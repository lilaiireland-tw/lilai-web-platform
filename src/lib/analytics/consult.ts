import { readConsentCookie } from "./consent";
import type { GoogleAdsWindow } from "./google-ads";

type ConsultEvent = "consult_form_start" | "consult_step_view" | "consult_step_complete" |
  "consult_validation_error" | "consult_submit_attempt" | "consult_submit_success";

/** Uses the existing Google tag only; never initializes or configures any tag. */
export function createConsultAnalytics(runtime: {
  productionDeployment: boolean;
  measurementId?: string;
  browserWindow?: GoogleAdsWindow;
}) {
  const observed = new Set<string>();
  return (event: ConsultEvent, step?: number) => {
    const once = event === "consult_form_start" || event === "consult_step_view" || event === "consult_step_complete" || event === "consult_submit_success";
    const key = `${event}:${step ?? ""}`;
    if (once && observed.has(key)) return;
    try {
      const browser = runtime.browserWindow ?? (typeof window === "undefined" ? undefined : window);
      const id = runtime.measurementId;
      if (!runtime.productionDeployment || browser?.location.hostname !== "lilaiireland.com" ||
          !id || !/^G-[A-Z0-9]+$/.test(id) ||
          !readConsentCookie(browser.document?.cookie ?? "")?.analytics) return;
      if ((event === "consult_step_view" || event === "consult_step_complete" || event === "consult_validation_error") &&
          (step === undefined || !Number.isInteger(step) || step < 1 || step > 5)) return;
      // Only an event name, fixed form ID and bounded step number can leave here.
      const parameters = {
        send_to: id,
        form_id: "consult-assessment",
        ...(step !== undefined && Number.isInteger(step) && step >= 1 && step <= 5 ? { step_number: step } : {}),
      };
      if (typeof browser.gtag === "function") {
        browser.gtag("event", event, parameters);
      } else {
        // The existing Google tag drains dataLayer when ready. Use the official
        // gtag Arguments shape, without replacing gtag, loading scripts or config.
        const enqueue = function (..._args: unknown[]) {
          (browser.dataLayer ??= []).push(arguments);
        };
        enqueue("event", event, parameters);
      }
      // Mark only accepted commands; failed sends remain retryable. The existing
      // gtag stub already queues commands while the remote script is loading.
      if (once) observed.add(key);
    } catch {
      // Analytics must never interrupt validation, GAS or the Ads conversion.
    }
  };
}
