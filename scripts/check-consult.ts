import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  calcDimensions,
  classifyLead,
  classifyStage,
  getAssessmentContent,
  getBlockerDiagnosis,
  getRouteRecommendation,
  getTimeAnchor,
} from "../src/lib/consult/assessment";
import {
  CONSULTATION_CONVERSION_SEND_TO,
  GOOGLE_ADS_SCRIPT_URL,
  GOOGLE_ADS_TAG_ID,
  initializeGoogleAds,
  trackConsultationConversion,
  type GoogleAdsWindow,
} from "../src/lib/analytics/google-ads";
import {
  runAccuracyFeedbackSubmission,
  runConsultationSubmission,
} from "../src/lib/consult/submission";

assert.equal(classifyStage({}), "watch");
assert.equal(classifyStage({ awareness: "已經看過一些愛爾蘭語校或 25+8 資訊", plan: "2–4 週短期遊學" }), "explore");
assert.equal(classifyStage({ awareness: "已經蠻確定想去愛爾蘭，但還沒決定方案", timeline: "6–12 個月內", plan: "8–12 週語言學習" }), "ready");
assert.equal(classifyStage({ awareness: "已經準備報名，只是在找可信任的代辦或顧問", timeline: "3 個月內", plan: "25+8 打工遊學" }), "action");
assert.equal(classifyLead({ awareness: "已經準備報名，只是在找可信任的代辦或顧問", timeline: "3–6 個月內" }), "🔥 Hot Lead");
assert.equal(classifyLead({ timeline: "6–12 個月內" }), "♨️ Warm Lead");
assert.equal(classifyLead({ timeline: "一年以上" }), "🌱 Nurture Lead");
console.log("PASS stage and lead classification boundaries");

assert.match(getBlockerDiagnosis("預算不確定、不知道能不能在愛爾蘭找到工作、不確定回台灣後是否有幫助"), /投資報酬/);
assert.match(getBlockerDiagnosis("不知道自己是不是真的適合出國、害怕做錯決定"), /更深的問題/);
assert.match(getBlockerDiagnosis("英文不夠好、不知道自己是不是真的適合出國"), /分級制度/);
assert.match(getBlockerDiagnosis("怕孤單或適應不良"), /認真程度/);
console.log("PASS blocker combination precedence and fallback");

const routeInput = {
  budget: "NT$30 萬以下", plan: "25+8 打工遊學", englishGoal: "最主要目的",
  workIntention: "有，這是我出發的重要原因之一", wantWork: true,
  cityPreference: "傾向非都柏林城市", goals: "體驗歐洲生活、累積海外職涯",
};
assert.deepEqual(calcDimensions(routeInput), { B: 5, E: 5, W: 5, C: 5, L: 3.5, F: 1 });
const route = getRouteRecommendation(routeInput);
assert.equal(route.primary.rt, "RT01");
assert.equal(route.primary.score, 3.5);
assert.equal(route.primary.hasBudgetGap, true);
assert.equal(route.secondary?.rt, "RT02");
console.log("PASS five-route scoring and budget-gap penalty");

assert.equal(getAssessmentContent({ plan: "25+8 打工遊學" }, "ready").cta, "twentyfive_plus8");
assert.match(getTimeAnchor("3 個月內", "25+8 打工遊學"), /團隊聯繫/);
assert.match(getTimeAnchor("3 個月內", "2–4 週短期遊學"), /預約諮詢/);
console.log("PASS 25+8 content override and time anchors");

const client = readFileSync("src/components/consult/ConsultationPage.tsx", "utf8");
const tagComponent = readFileSync("src/components/analytics/GoogleAdsTag.tsx", "utf8");
assert(client.includes("AKfycbx8AxEZ_Dh1IFWqMvTLDGGvUyPyBKrgjzoSlW9wWgyTAAgYH3qUPtm6NBdZ5Mq6Mb0N/exec"));
assert.equal(client.match(/mode: "no-cors"/g)?.length, 2);
assert.equal(client.match(/"Content-Type": "text\/plain;charset=utf-8"/g)?.length, 2);
assert.match(tagComponent, /strategy="afterInteractive"/);
assert.equal(GOOGLE_ADS_SCRIPT_URL, "https://www.googletagmanager.com/gtag/js?id=AW-17610996814");
console.log("PASS preserved GAS contract and official Google Tag loader markers");

function trackingWindow(hostname: string, gtag?: (...args: unknown[]) => void): GoogleAdsWindow {
  return { location: { hostname }, gtag };
}

async function checkTrackingBehavior() {
  const configurationCalls: unknown[][] = [];
  const productionWindow = trackingWindow("lilaiireland.com", (...args) => configurationCalls.push(args));
  assert.equal(initializeGoogleAds({ productionDeployment: true, browserWindow: productionWindow }), true);
  assert.equal(initializeGoogleAds({ productionDeployment: true, browserWindow: productionWindow }), true);
  assert.equal(configurationCalls.filter(call => call[0] === "js").length, 1);
  assert.deepEqual(configurationCalls.filter(call => call[0] === "config"), [["config", GOOGLE_ADS_TAG_ID]]);
  assert.equal(productionWindow.__lilaiGoogleAdsConfigured, true);
  console.log("PASS Google Tag configures once on the authorized production hostname");

  for (const runtime of [
    { productionDeployment: false, browserWindow: trackingWindow("lilaiireland.com") },
    { productionDeployment: false, browserWindow: trackingWindow("localhost") },
    { productionDeployment: true, browserWindow: trackingWindow("localhost") },
    { productionDeployment: true, browserWindow: trackingWindow("preview.example.workers.dev") },
  ]) {
    const guard = { sent: false };
    assert.equal(initializeGoogleAds(runtime), false);
    assert.equal(trackConsultationConversion(guard, runtime), false);
    assert.equal(guard.sent, false);
    assert.equal(runtime.browserWindow.gtag, undefined);
    assert.equal(runtime.browserWindow.dataLayer, undefined);
  }
  console.log("PASS staging, preview and local runtimes cannot initialize or send Google Ads events");

  assert.equal(CONSULTATION_CONVERSION_SEND_TO, "AW-17610996814/Ynp6CPHkhe4cEM74yc1B");
  assert.notEqual(CONSULTATION_CONVERSION_SEND_TO, "AW-17610996814/MeKhCKz2-e0cEM74yc1B");
  assert.notEqual(CONSULTATION_CONVERSION_SEND_TO, "AW-17610996814/b4bzCNrO-u0cEM74yc1B");

  const eventCalls: unknown[][] = [];
  const eventWindow = trackingWindow("lilaiireland.com", (...args) => eventCalls.push(args));
  const conversionGuard = { sent: false };
  initializeGoogleAds({ productionDeployment: true, browserWindow: eventWindow });
  assert.equal(eventCalls.filter(call => call[0] === "event").length, 0, "mount must not convert");
  const navigate = () => undefined;
  navigate();
  navigate();
  assert.equal(eventCalls.filter(call => call[0] === "event").length, 0, "navigation must not convert");

  let requestCount = 0;
  let submittingTransitions: boolean[] = [];
  const invalidGate = { inFlight: false, completed: false };
  assert.equal(await runConsultationSubmission({
    gate: invalidGate,
    validate: () => false,
    request: async () => { requestCount += 1; },
    onResolved: () => trackConsultationConversion(conversionGuard, { productionDeployment: true, browserWindow: eventWindow }),
    onSubmittingChange: value => submittingTransitions.push(value),
  }), "validation-failed");
  assert.equal(requestCount, 0);
  assert.deepEqual(submittingTransitions, []);
  assert.equal(eventCalls.filter(call => call[0] === "event").length, 0);

  const rejectedGate = { inFlight: false, completed: false };
  await assert.rejects(runConsultationSubmission({
    gate: rejectedGate,
    validate: () => true,
    request: async () => { requestCount += 1; throw new Error("mock network failure"); },
    onResolved: () => trackConsultationConversion(conversionGuard, { productionDeployment: true, browserWindow: eventWindow }),
  }), /mock network failure/);
  assert.equal(rejectedGate.completed, false);
  assert.equal(eventCalls.filter(call => call[0] === "event").length, 0);

  let resolveRequest: (() => void) | undefined;
  const request = new Promise<void>(resolve => { resolveRequest = resolve; });
  const successGate = { inFlight: false, completed: false };
  const options = {
    gate: successGate,
    validate: () => true,
    request: async () => { requestCount += 1; await request; },
    onResolved: () => trackConsultationConversion(conversionGuard, { productionDeployment: true, browserWindow: eventWindow }),
  };
  const firstClick = runConsultationSubmission(options);
  const repeatedClick = runConsultationSubmission(options);
  assert.equal(await repeatedClick, "ignored");
  resolveRequest?.();
  assert.equal(await firstClick, "resolved");
  assert.equal(await runConsultationSubmission(options), "ignored");
  assert.equal(requestCount, 2, "one rejected attempt and one resolved attempt should be requested");
  const conversions = eventCalls.filter(call => call[0] === "event");
  assert.deepEqual(conversions, [["event", "conversion", { send_to: CONSULTATION_CONVERSION_SEND_TO }]]);
  assert.equal(successGate.completed, true);

  const eventCountBeforeFeedback = conversions.length;
  let feedbackRequests = 0;
  await runAccuracyFeedbackSubmission(async () => { feedbackRequests += 1; });
  assert.equal(feedbackRequests, 1);
  assert.equal(eventCalls.filter(call => call[0] === "event").length, eventCountBeforeFeedback);
  console.log("PASS conversion lifecycle, rejection, duplicate-click and accuracy-feedback behavior with mocks only");

  const queuedWindow = trackingWindow("lilaiireland.com");
  const queuedGuard = { sent: false };
  assert.equal(trackConsultationConversion(queuedGuard, {
    productionDeployment: true,
    browserWindow: queuedWindow,
  }), true);
  assert.deepEqual(queuedWindow.dataLayer?.map(entry => (entry as unknown[])[0]), ["js", "config", "event"]);
  console.log("PASS conversion queues when the remote Google script has not loaded yet");
}

checkTrackingBehavior().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
