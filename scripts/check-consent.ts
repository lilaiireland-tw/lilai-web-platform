import assert from "node:assert/strict";
import {
  ACCEPTED_PREFERENCES,
  DENIED_CONSENT,
  REJECTED_PREFERENCES,
  encodeConsent,
  parseConsent,
  readConsentCookie,
  toGoogleConsent,
} from "../src/lib/analytics/consent";
import {
  initializeGoogleAds,
  trackConsultationConversion,
  updateGoogleAdsConsent,
  type GoogleAdsWindow,
} from "../src/lib/analytics/google-ads";

assert.equal(parseConsent("v1.abc"), null);
assert.equal(readConsentCookie("some_other_cookie=value"), null);
assert.deepEqual(readConsentCookie("x=1; lilai_consent_v1=" + encodeConsent(ACCEPTED_PREFERENCES)), ACCEPTED_PREFERENCES);
assert.deepEqual(toGoogleConsent(REJECTED_PREFERENCES), DENIED_CONSENT);
assert.deepEqual(toGoogleConsent({ analytics: true, advertising: false, personalization: true }), {
  ...DENIED_CONSENT,
  analytics_storage: "granted",
});
const commands: unknown[][] = [];
const windowMock: GoogleAdsWindow = {
  location: { hostname: "lilaiireland.com" },
  document: { cookie: "lilai_consent_v1=" + encodeConsent({ analytics: true, advertising: false, personalization: false }) },
  gtag: (...args: unknown[]) => commands.push(args),
};
assert.equal(initializeGoogleAds({ productionDeployment: true, browserWindow: windowMock }), true);
assert.equal(initializeGoogleAds({ productionDeployment: true, browserWindow: windowMock }), true);
assert.equal(commands.length, 4);
assert.deepEqual(commands[0], ["consent", "default", { ...DENIED_CONSENT, wait_for_update: 500 }]);
assert.deepEqual(commands[1], ["consent", "update", toGoogleConsent({ analytics: true, advertising: false, personalization: false })]);
assert.equal(commands[2][0], "js");
assert.equal(commands[3][0], "config");
assert.equal(updateGoogleAdsConsent(ACCEPTED_PREFERENCES, { productionDeployment: true, browserWindow: windowMock }), true);
assert.deepEqual(commands[4], ["consent", "update", toGoogleConsent(ACCEPTED_PREFERENCES)]);
const guard = { sent: false };
assert.equal(trackConsultationConversion(guard, { productionDeployment: true, browserWindow: windowMock }), true);
assert.equal(trackConsultationConversion(guard, { productionDeployment: true, browserWindow: windowMock }), false);
assert.equal(commands.filter(entry => entry[0] === "event").length, 1);
const local: GoogleAdsWindow = { location: { hostname: "localhost" } };
assert.equal(initializeGoogleAds({ productionDeployment: true, browserWindow: local }), false);
assert.equal(updateGoogleAdsConsent(ACCEPTED_PREFERENCES, { productionDeployment: true, browserWindow: local }), false);
assert.equal(local.gtag, undefined);
console.log("PASS Consent Mode v2 default, restored settings, updates, conversion guard and preview isolation (local mocks)");
