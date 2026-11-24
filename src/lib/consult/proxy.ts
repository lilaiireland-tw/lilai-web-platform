import { isSubmissionId, validConsultationAck, validFeedbackAck } from "./ack";
import { assessmentFormContract, options } from "../../components/consult/consult-content";

const BODY_LIMIT = 32 * 1024;
const ACK_LIMIT = 16 * 1024;
const TIMEOUT_MS = 15_000;

class ProxyError extends Error {
  constructor(readonly status: number, readonly code: string) { super(code); }
}

export async function limitedText(message: Request | Response, limit: number, signal: AbortSignal) {
  signal.throwIfAborted();
  const reader = message.body?.getReader();
  if (!reader) return "";
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new ProxyError(413, "body_too_large");
      }
      chunks.push(value);
    }
  } finally { signal.removeEventListener("abort", cancel); reader.releaseLock(); }
  signal.throwIfAborted();
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(bytes);
}

function endpointUrl(endpoint: string | undefined) {
  if (!endpoint) throw new ProxyError(503, "not_configured");
  let url: URL;
  try { url = new URL(endpoint); }
  catch { throw new ProxyError(503, "not_configured"); }
  if (url.protocol !== "https:" || url.hostname !== "script.google.com" || url.port ||
      url.username || url.password || url.search || url.hash ||
      !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)) {
    throw new ProxyError(503, "not_configured");
  }
  return url;
}

function validatePayload(value: unknown, feedback: boolean): asserts value is Record<string, unknown> & { submissionId: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ProxyError(400, "invalid_payload");
  const data = value as Record<string, unknown>;
  if (!isSubmissionId(data.submissionId) ||
      typeof data.email !== "string" || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ||
      !["name", "nickname"].every(key => typeof data[key] === "string" && (data[key] as string).trim().length > 0 && (data[key] as string).length <= 100)) {
    throw new ProxyError(400, "invalid_payload");
  }
  if (feedback) {
    const allowed = ["type", "submissionId", "jobId", "name", "nickname", "email", "stageName", "leadQuality", "accuracyAnswer", "submittedAt"];
    if (data.type !== "accuracy_feedback" || !isSubmissionId(data.jobId) ||
        !["很準", "還好", "不太準"].includes(String(data.accuracyAnswer)) ||
        Object.keys(data).some(key => !allowed.includes(key))) throw new ProxyError(400, "invalid_payload");
  } else {
    const allowed = [...Object.keys(assessmentFormContract), "submissionId", "contactConsent", "marketingConsent",
      "discoveryChannels", "discoveryOther", "dcardExposure", "name", "nickname", "email", "instagram", "lineId",
      "location", "awareness", "timeline", "plan", "workIntention", "wantWork", "englishGoal", "cityPreference", "budget",
      "goals", "lifeChange", "barriers", "resources", "webinar", "stage", "routeResult", "blockerDiagnosis", "stageName",
      "stageDescription", "nextSteps", "followUp", "leadQuality", "teamEmail", "resourceLink", "discountPrice", "originalPrice", "submittedAt"];
    if (Object.keys(data).some(key => !allowed.includes(key)) ||
        !Object.entries(assessmentFormContract).every(([key, value]) => data[key] === value) ||
        typeof data.contactConsent !== "boolean" || typeof data.marketingConsent !== "boolean" ||
        !Array.isArray(data.discoveryChannels) || data.discoveryChannels.length > options.discoveryChannels.length ||
        data.discoveryChannels.some(value => !options.discoveryChannels.includes(value)) ||
        new Set(data.discoveryChannels).size !== data.discoveryChannels.length ||
        (data.discoveryChannels.includes("unknown") && data.discoveryChannels.length !== 1) ||
        typeof data.discoveryOther !== "string" || data.discoveryOther.length > 200 ||
        (data.discoveryOther !== "" && !data.discoveryChannels.includes("other")) ||
        !(data.dcardExposure === null || options.dcardExposure.some(value => value === data.dcardExposure))) {
      throw new ProxyError(400, "invalid_payload");
    }
  }
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

async function feedbackProof(secret: string, submissionId: string, jobId: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`feedback.v1|${submissionId}|${jobId}`)));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Shared bounded transport; fixed GAS URL and one safe ContentService redirect. */
export async function consultGasRequest(endpoint: string | undefined, data: unknown, signal: AbortSignal, upstream: typeof fetch = fetch): Promise<unknown> {
  signal.throwIfAborted();
  const gasUrl = endpointUrl(endpoint);
  let response = await upstream(gasUrl, {
    method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data), redirect: "manual", signal, cache: "no-store",
  });
  if ([302, 303].includes(response.status)) {
    const location = response.headers.get("location");
    await response.body?.cancel();
    const target = new URL(location ?? "", gasUrl);
    if (!location || target.protocol !== "https:" || target.hostname !== "script.googleusercontent.com" ||
        target.port || target.username || target.password || target.hash || target.pathname !== "/macros/echo") {
      throw new ProxyError(502, "upstream_redirect_rejected");
    }
    // ContentService redirect retrieves the result with GET; never replay the POST/body/secret.
    response = await upstream(target, { method: "GET", redirect: "manual", signal, cache: "no-store" });
  }
  if (!response.ok) { await response.body?.cancel(); throw new ProxyError(502, "upstream_http_error"); }
  let ack: unknown;
  try { ack = JSON.parse(await limitedText(response, ACK_LIMIT, signal)); }
  catch { throw new ProxyError(502, "invalid_ack"); }
  return ack;
}

/** Fixed server-configured upstream; never forwards caller headers, credentials or URLs. */
export async function proxyConsultation(request: Request, feedback: boolean, endpoint: string | undefined, upstream: typeof fetch = fetch, credential = process.env.CONSULT_GAS_CREDENTIAL) {
  try {
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const url = new URL(request.url);
    // Local Next custom-server tests reconstruct localhost for the 127.0.0.1 listener.
    const loopbackHost = `127.0.0.1${url.port ? `:${url.port}` : ""}`;
    const origin = url.protocol === "http:" && url.hostname === "localhost" && request.headers.get("host") === loopbackHost
      ? `http://${loopbackHost}` : url.origin;
    if (request.headers.get("origin") !== origin ||
        ![null, "same-origin"].includes(request.headers.get("sec-fetch-site"))) throw new ProxyError(403, "origin_rejected");
    // JSON + a custom header prevent cross-site form and simple-fetch drive-by submissions.
    // shortcut: this is not a distributed rate limit; add one if observed abuse warrants infrastructure work.
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json" ||
        request.headers.get("x-consult-request") !== "1") throw new ProxyError(415, "json_required");
    if (Number(request.headers.get("content-length")) > BODY_LIMIT) throw new ProxyError(413, "body_too_large");
    endpointUrl(endpoint);
    if (!credential || credential.length < 32) throw new ProxyError(503, "not_configured");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const operation = async () => {
        let data: unknown;
        try { data = JSON.parse(await limitedText(request, BODY_LIMIT, controller.signal)); }
        catch (error) { if (error instanceof ProxyError) throw error; throw new ProxyError(400, "invalid_json"); }
        validatePayload(data, feedback);
        const forwarded = { ...data };
        // Recompute these in GAS; browser results remain display-only.
        for (const key of ["teamEmail", "resourceLink", "stage", "routeResult", "blockerDiagnosis", "stageName", "stageDescription",
          "nextSteps", "followUp", "leadQuality", "discountPrice", "originalPrice", "submittedAt"]) delete forwarded[key];
        if (feedback) {
          const proof = await feedbackProof(credential, data.submissionId, String(data.jobId));
          const cookie = request.headers.get("cookie")?.split(";").map(value => value.trim()).find(value => value.startsWith(`consult_feedback_${data.submissionId}=`))?.split("=")[1];
          if (cookie !== proof) throw new ProxyError(403, "feedback_not_authorized");
          forwarded._feedbackProof = proof;
        }
        forwarded._serverCredential = credential;
        controller.signal.throwIfAborted();
        const ack = await consultGasRequest(endpoint, forwarded, controller.signal, upstream);
        if (feedback) {
          if (!validFeedbackAck(ack, data.submissionId)) throw new ProxyError(502, "invalid_ack");
          return json({ status: "ok" });
        }
        if (!validConsultationAck(ack, data.submissionId)) throw new ProxyError(502, "invalid_ack");
        const result = json({ status: "ok", accepted: true, jobId: ack.jobId, submissionId: data.submissionId });
        // A known submissionId can hit the existing Cache: that ACK cannot issue a new capability.
        if (!("deduplicated" in ack)) {
          const proof = await feedbackProof(credential, data.submissionId, ack.jobId);
          result.headers.append("Set-Cookie", `consult_feedback_${data.submissionId}=${proof}; HttpOnly; Secure; SameSite=Strict; Path=/api/consult; Max-Age=2592000`);
        }
        return result;
      };
      // Covers body streams and mocks as well as fetch, even if they ignore AbortSignal.
      return await Promise.race([operation(), new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () => reject(new ProxyError(504, "receipt_unconfirmed")), { once: true });
      })]);
    } finally { clearTimeout(timer); }
  } catch (error) {
    return error instanceof ProxyError ? json({ error: error.code }, error.status) : json({ error: "receipt_unconfirmed" }, 502);
  }
}
