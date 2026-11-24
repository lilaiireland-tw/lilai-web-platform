export const CONSULT_SUBMISSIONS_PATH = "/api/consult/submissions";
export const CONSULT_FEEDBACK_PATH = "/api/consult/accuracy-feedback";

export function isConsultApiPath(path: string) {
  return path === CONSULT_SUBMISSIONS_PATH || path === CONSULT_FEEDBACK_PATH;
}

export function isSubmissionId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export type ConsultationAck = { status: "ok"; accepted: true; jobId: string; submissionId?: string };

export function validFeedbackAck(value: unknown, submissionId: string): value is { status: "ok" } {
  if (!value || typeof value !== "object") return false;
  const ack = value as Record<string, unknown>;
  return ack.status === "ok" && (!Object.hasOwn(ack, "accepted") || ack.accepted === true) && !Object.hasOwn(ack, "error") &&
    (!Object.hasOwn(ack, "submissionId") || ack.submissionId === submissionId);
}

export function validConsultationAck(value: unknown, submissionId: string): value is ConsultationAck {
  if (!validFeedbackAck(value, submissionId)) return false;
  const ack = value as Record<string, unknown>;
  return ack.accepted === true && isSubmissionId(ack.jobId);
}
