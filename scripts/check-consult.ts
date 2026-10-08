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
assert(client.includes("AKfycbx8AxEZ_Dh1IFWqMvTLDGGvUyPyBKrgjzoSlW9wWgyTAAgYH3qUPtm6NBdZ5Mq6Mb0N/exec"));
assert.equal(client.match(/mode: "no-cors"/g)?.length, 2);
assert.equal(client.match(/"Content-Type": "text\/plain;charset=utf-8"/g)?.length, 2);
assert(client.includes("AW-17610996814/Ynp6CPHkhe4cEM74yc1B"));
assert(client.indexOf("await fetch(GAS_ENDPOINT") < client.indexOf("trackConversion();"));
console.log("PASS preserved GAS and Google Ads contract markers");
