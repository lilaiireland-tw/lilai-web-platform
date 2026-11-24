import { validFeedbackAck, CONSULT_UNSUBSCRIBE_PATH } from "./ack";
import { consultGasRequest, limitedText } from "./proxy";
import { readUnsubscribeToken } from "./unsubscribe-token";

function page(message: string, token?: string, status = 200) {
  return new Response(`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email 行銷退訂</title><main><h1>Email 行銷退訂</h1><p>${message}</p>${token ? `<form method="post" action="${CONSULT_UNSUBSCRIBE_PATH}"><input type="hidden" name="token" value="${token}"><button type="submit" name="confirm" value="unsubscribe">確認取消 Email 行銷訂閱</button></form>` : ""}<p>退訂不影響必要評估報告與你自行提出的服務需求。主動聯繫授權可另外向團隊撤回。</p><a href="/consult">返回免費出發評估</a></main></html>`, {
    status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" },
  });
}

export async function unsubscribe(request: Request, config = {
  secret: process.env.CONSULT_UNSUBSCRIBE_SECRET, credential: process.env.CONSULT_GAS_CREDENTIAL, endpoint: process.env.CONSULT_GAS_ENDPOINT,
}, upstream: typeof fetch = fetch) {
  if (!["GET", "POST"].includes(request.method)) return page("此操作不支援。", undefined, 405);
  if (!config.secret || !/^[0-9a-f]{64}$/i.test(config.secret) || !config.credential || config.credential.length < 32) return page("退訂服務暫時無法使用，請回覆原信向團隊提出退訂。", undefined, 503);
  const url = new URL(request.url);
  const signal = AbortSignal.timeout(15_000);
  let token: string;
  if (request.method === "GET") {
    token = url.searchParams.get("token") || "";
  } else {
    if (request.headers.get("origin") !== url.origin || ![null, "same-origin"].includes(request.headers.get("sec-fetch-site"))) return page("請由退訂確認頁重新操作。", undefined, 403);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/x-www-form-urlencoded") return page("請由退訂確認頁重新操作。", undefined, 415);
    let form: URLSearchParams;
    try {
      form = new URLSearchParams(await limitedText(request, 512, signal));
    } catch (error) { return page("請由退訂確認頁重新操作。", undefined, error instanceof Error && "status" in error && error.status === 413 ? 413 : 400); }
    if (form.getAll("token").length !== 1 || form.getAll("confirm").length !== 1 || form.get("confirm") !== "unsubscribe" || [...form.keys()].some(key => !["token", "confirm"].includes(key))) return page("請先確認取消訂閱。", undefined, 400);
    token = form.get("token") || "";
  }
  let submissionId: string;
  try { submissionId = await readUnsubscribeToken(token, config.secret); }
  catch { return page("退訂連結無效，請回覆原信向團隊提出退訂。", undefined, 400); }
  if (request.method === "GET") return page("請確認是否取消未來 Email 行銷與說明會通知。", token);
  try {
    const ack = await consultGasRequest(config.endpoint, { type: "withdraw_assessment_consent", submissionId, purpose: "marketing", _serverCredential: config.credential }, signal, upstream);
    if (!validFeedbackAck(ack, submissionId)) throw new Error("Invalid withdrawal ACK");
    return page("已取消 Email 行銷訂閱。重複確認也不會恢復訂閱。");
  } catch { return page("尚未確認退訂成功，請重試或回覆原信向團隊提出退訂。", token, 502); }
}
