import { CONSULT_FEEDBACK_PATH, CONSULT_SUBMISSIONS_PATH, validConsultationAck, validFeedbackAck, type ConsultationAck } from "./ack";

export const RECEIPT_UNCONFIRMED = "尚未確認是否成功接收，系統不會自動重送。你的填答已保留；如需人工重試，相同內容會沿用原提交編號。原系統僅短時間防重，重試仍可能重複接收；也可先聯絡哩來愛爾蘭確認。";

export function requestConsultation(payload: { submissionId: string }): Promise<ConsultationAck>;
export function requestConsultation(payload: { submissionId: string }, feedback: true): Promise<null>;
export async function requestConsultation(payload: { submissionId: string }, feedback = false) {
  const response = await fetch(feedback ? CONSULT_FEEDBACK_PATH : CONSULT_SUBMISSIONS_PATH, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Consult-Request": "1" },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error("receipt_unconfirmed");
  const ack: unknown = await response.json();
  if (feedback) {
    if (!validFeedbackAck(ack, payload.submissionId)) throw new Error("invalid_ack");
    return null;
  }
  if (!validConsultationAck(ack, payload.submissionId)) throw new Error("invalid_ack");
  return ack;
}
