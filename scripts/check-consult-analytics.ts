import assert from "node:assert/strict";
import { createConsultAnalytics } from "../src/lib/analytics/consult";
import type { GoogleAdsWindow } from "../src/lib/analytics/google-ads";

const calls: unknown[][] = [];
const browser: GoogleAdsWindow = {
  location: { hostname: "lilaiireland.com" },
  document: { cookie: "lilai_consent_v1=v1.100" },
  gtag: (...args) => { calls.push(args); },
};
const runtime = { productionDeployment: true, measurementId: "G-TEST123", browserWindow: browser };
const track = createConsultAnalytics(runtime);
track("consult_form_start");
track("consult_form_start");
for (const step of [1, 2, 3, 4, 3, 4, 5, 5]) track("consult_step_complete", step);
track("consult_validation_error", 5);
track("consult_submit_attempt");
track("consult_submit_attempt"); // A deliberate retry is a new attempt.
track("consult_submit_success");
track("consult_submit_success");
assert.equal(calls.length, 10);
assert.equal(calls.filter(call => call[1] === "consult_form_start").length, 1);
assert.equal(calls.filter(call => call[1] === "consult_step_complete").length, 5);
for (const [command, , parameters] of calls) {
  assert.equal(command, "event");
  const params = parameters as Record<string, unknown>;
  assert.equal(params.send_to, "G-TEST123");
  assert.equal(params.form_id, "consult-assessment");
  assert(Object.keys(params).every(key => ["send_to", "form_id", "step_number"].includes(key)));
}
calls.length = 0;
for (const cookie of ["", "lilai_consent_v1=v1.011", "lilai_consent_v1=invalid"]) {
  browser.document!.cookie = cookie;
  createConsultAnalytics(runtime)("consult_submit_attempt");
}
browser.document!.cookie = "lilai_consent_v1=v1.100";
createConsultAnalytics({ ...runtime, measurementId: undefined })("consult_submit_attempt");
createConsultAnalytics({ ...runtime, measurementId: "AW-123" })("consult_submit_attempt");
createConsultAnalytics({ ...runtime, productionDeployment: false })("consult_submit_attempt");
browser.location.hostname = "localhost";
createConsultAnalytics(runtime)("consult_submit_attempt");
assert.equal(calls.length, 0);
browser.location.hostname = "lilaiireland.com";
const consentTrack = createConsultAnalytics(runtime);
browser.document!.cookie = "";
consentTrack("consult_form_start");
browser.document!.cookie = "lilai_consent_v1=v1.100";
consentTrack("consult_form_start");
assert.equal(calls.length, 0, "No retrospective start after consent");
consentTrack("consult_submit_attempt");
browser.document!.cookie = "lilai_consent_v1=v1.000";
consentTrack("consult_submit_attempt");
assert.equal(calls.length, 1, "Withdrawal takes effect on the next event");
browser.document!.cookie = "lilai_consent_v1=v1.100";
browser.gtag = () => { throw new Error("blocked tracker"); };
assert.doesNotThrow(() => createConsultAnalytics(runtime)("consult_submit_success"));
delete browser.gtag;
assert.doesNotThrow(() => createConsultAnalytics(runtime)("consult_submit_attempt"));
assert.equal(browser.gtag, undefined, "Must never initialize a tag");
console.log("PASS consultation analytics: deduplication, GA4-only routing, parameter allowlist, consent, runtime gates and failure isolation");
