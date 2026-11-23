import { errorResponse } from "../worker/signup/shared/http";

export const STAGING_PLATFORM = "lilai-web-platform-staging";
export const STAGING_SIGNUP_BACKEND = "site-creator-vinext-starter-staging";
export const STAGING_SIGNUP_ORIGIN = "https://lilai-web-platform-staging.lilaiireland.workers.dev";
export const SIGNUP_APPLICATIONS_PATH = "/language-school-signup/api/applications";
export const SIGNUP_TURNSTILE_PATH = "/language-school-signup/api/turnstile-config";

export function stagingSignupMethod(path: string) {
  if (path === SIGNUP_APPLICATIONS_PATH) return "POST";
  if (path === SIGNUP_TURNSTILE_PATH) return "GET";
}

export function isSignupStaticAssetPath(path: string) {
  return path.startsWith("/language-school-signup/lilai-assets/") ||
    path === "/language-school-signup/og.png" || path === "/language-school-signup/favicon.svg";
}

// Both the public edge and private backend enforce the narrow staging API contract.
export async function prepareStagingSignupRequest(request: Request): Promise<Request | Response> {
  const path = new URL(request.url).pathname;
  const method = stagingSignupMethod(path);
  if (!method) return errorResponse(404, "api_not_found", "找不到此 API。");
  if (request.method !== method) return errorResponse(405, "method_not_allowed", "不支援此 HTTP 方法。", undefined, { Allow: method });
  const headers = new Headers();
  let body: ArrayBuffer | undefined;
  if (method === "POST") {
    if (request.headers.get("Origin") !== STAGING_SIGNUP_ORIGIN || request.headers.get("Sec-Fetch-Site") === "cross-site") {
      return errorResponse(403, "invalid_origin", "只接受測試平台的報名請求。");
    }
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("Content-Type") ?? "")) {
      return errorResponse(415, "unsupported_media_type", "只接受 JSON 格式。");
    }
    const key = request.headers.get("Idempotency-Key") ?? "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
      return errorResponse(400, "invalid_idempotency_key", "缺少有效的送出識別碼。");
    }
    if (Number(request.headers.get("Content-Length")) > 32768) return errorResponse(413, "payload_too_large", "請求內容過大。");
    const reader = request.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 32768) {
          await reader.cancel();
          return errorResponse(413, "payload_too_large", "請求內容過大。");
        }
        chunks.push(value);
      }
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    body = bytes.buffer;
    headers.set("Content-Type", "application/json");
    headers.set("Idempotency-Key", key);
    headers.set("Origin", STAGING_SIGNUP_ORIGIN);
    const ip = request.headers.get("CF-Connecting-IP");
    if (ip) headers.set("CF-Connecting-IP", ip);
  }
  return new Request(new URL(path, STAGING_SIGNUP_ORIGIN), { method, headers, body });
}

export async function forwardStagingSignupRequest(request: Request, backend: { fetch(request: Request): Promise<Response> } | undefined): Promise<Response> {
  const prepared = await prepareStagingSignupRequest(request);
  if (prepared instanceof Response) return prepared;
  if (!backend) return errorResponse(503, "signup_backend_unavailable", "測試報名服務尚未啟用。");
  try {
    const response = await backend.fetch(prepared);
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      return errorResponse(502, "signup_backend_redirect", "測試報名服務回傳非預期轉址。");
    }
    const result = new Response(response.body, response);
    result.headers.set("Cache-Control", "no-store");
    return result;
  } catch {
    return errorResponse(503, "signup_backend_unavailable", "測試報名服務暫時無法連接。");
  }
}
