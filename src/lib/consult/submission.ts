export type ConsultationSubmissionGate = {
  inFlight: boolean;
  completed: boolean;
};

type ConsultationSubmissionOptions<T> = {
  gate: ConsultationSubmissionGate;
  validate: () => boolean;
  request: () => Promise<T>;
  onResolved: (value: T) => void;
  onSubmittingChange?: (submitting: boolean) => void;
};

export type ConsultationSubmissionOutcome =
  | "resolved"
  | "validation-failed"
  | "ignored";

/**
 * Owns the main-form lifecycle guard. A rejected request remains retryable;
 * one resolved request is final for this mounted form instance.
 */
export async function runConsultationSubmission<T>({
  gate,
  validate,
  request,
  onResolved,
  onSubmittingChange,
}: ConsultationSubmissionOptions<T>): Promise<ConsultationSubmissionOutcome> {
  if (gate.inFlight || gate.completed) return "ignored";
  if (!validate()) return "validation-failed";

  gate.inFlight = true;
  onSubmittingChange?.(true);
  try {
    const value = await request();
    gate.completed = true;
    onResolved(value);
    return "resolved";
  } finally {
    gate.inFlight = false;
    onSubmittingChange?.(false);
  }
}

export async function runAccuracyFeedbackSubmission<T>(request: () => Promise<T>) {
  return request();
}
