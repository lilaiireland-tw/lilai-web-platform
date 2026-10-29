import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createConsultAnalytics } from "../src/lib/analytics/consult";
import type { GoogleAdsWindow } from "../src/lib/analytics/google-ads";

const calls: unknown[][] = [];
const browser: GoogleAdsWindow = {
  location: { hostname: "lilaiireland.com" },
  document: { cookie: "lilai_consent_v1=v1.100" },
  gtag: (...args) => { calls.push(args); },
};
const runtime = { productionDeployment: true, measurementId: "G-06M3GS0WS0", browserWindow: browser };
const track = createConsultAnalytics(runtime);
track("consult_form_start");
track("consult_form_start");
for (const step of [1, 2, 3, 4, 3, 4, 5, 5]) track("consult_step_view", step);
for (const step of [1, 2, 3, 4, 3, 4, 5, 5]) track("consult_step_complete", step);
track("consult_validation_error", 5);
track("consult_submit_attempt");
track("consult_submit_attempt"); // A deliberate retry is a new attempt.
track("consult_submit_success");
track("consult_submit_success");
assert.equal(calls.length, 15);
assert.equal(calls.filter(call => call[1] === "consult_step_view").length, 5);
assert.equal(calls.filter(call => call[1] === "consult_form_start").length, 1);
assert.equal(calls.filter(call => call[1] === "consult_step_complete").length, 5);
for (const [command, , parameters] of calls) {
  assert.equal(command, "event");
  const params = parameters as Record<string, unknown>;
  assert.equal(params.send_to, "G-06M3GS0WS0");
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
assert.equal(calls.length, 1, "A new interaction after consent can start the tracked funnel");
calls.length = 0;
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
assert.equal(browser.dataLayer?.length, 1);
assert.deepEqual(Array.from(browser.dataLayer![0] as IArguments), ["event", "consult_submit_attempt", {
  send_to: "G-06M3GS0WS0", form_id: "consult-assessment",
}]);
const delayed = createConsultAnalytics(runtime);
delayed("consult_form_start");
delayed("consult_form_start");
delayed("consult_step_view", 1);
delayed("consult_step_view", 1);
assert.equal(browser.dataLayer?.length, 3, "Missing gtag queues consented commands once");
// A loaded tag drains the same queue; no retry timer, config or script is added.
const drained = browser.dataLayer!.map(command => Array.from(command as IArguments));
assert(drained.every(command => command[0] === "event"));
browser.gtag = (...args) => { calls.push(args); };
delayed("consult_form_start");
delayed("consult_step_view", 1);
const countBefore = calls.length;
delayed("consult_step_view", 0);
delayed("consult_step_complete", 6);
assert.equal(calls.length, countBefore);
const abandoned = createConsultAnalytics(runtime);
abandoned("consult_step_view", 1);
abandoned("consult_step_complete", 1);
abandoned("consult_step_view", 2);
assert.deepEqual(calls.slice(-3).map(call => [call[1], (call[2] as { step_number: number }).step_number]), [
  ["consult_step_view", 1], ["consult_step_complete", 1], ["consult_step_view", 2],
]);
console.log("PASS consultation analytics: deduplication, GA4-only routing, parameter allowlist, consent, runtime gates and failure isolation");

const config = JSON.parse(readFileSync("cloudflare/production-platform.jsonc", "utf8"));
assert.equal(config.vars.NEXT_PUBLIC_GA4_MEASUREMENT_ID, runtime.measurementId);
const buildScript = readFileSync("scripts/cloudflare-production.ts", "utf8");
assert.match(buildScript, /\.\.\.config.vars/);
assert.match(buildScript, /env: commandEnv/);
console.log("PASS production GA4 destination is included in the Cloudflare build child environment");
