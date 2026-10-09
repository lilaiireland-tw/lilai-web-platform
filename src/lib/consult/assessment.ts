export type Stage = "watch" | "explore" | "ready" | "action";

export interface AssessmentData {
  name?: string;
  nickname?: string;
  email?: string;
  instagram?: string;
  lineId?: string;
  location?: string;
  awareness?: string;
  timeline?: string;
  plan?: string;
  workIntention?: string;
  wantWork?: boolean;
  englishGoal?: string;
  cityPreference?: string;
  budget?: string;
  goals?: string;
  lifeChange?: string;
  barriers?: string;
  resources?: string;
  webinar?: string;
}

export const BUDGET_RULES: Record<string, {
  stagePoints: number;
  hotPoints: number;
  sensitivity: number;
  usableTuition: number | null;
}> = {
  "NT$30 萬以下": { stagePoints: 1, hotPoints: 0, sensitivity: 5, usableTuition: 5 },
  "NT$30–35 萬": { stagePoints: 1, hotPoints: 0, sensitivity: 4, usableTuition: 10 },
  "NT$35–40 萬": { stagePoints: 2, hotPoints: 1, sensitivity: 3, usableTuition: 12.5 },
  "NT$40–45 萬": { stagePoints: 2, hotPoints: 1, sensitivity: 2, usableTuition: 17.5 },
  "NT$45 萬以上": { stagePoints: 2, hotPoints: 1, sensitivity: 1, usableTuition: 20 },
  "還不確定": { stagePoints: 0, hotPoints: 0, sensitivity: 3, usableTuition: null },
};

const ROUTE_BUDGET_RULES = {
  twentyFivePlus8: { RT01: 10, RT02: 12, RT03: 12, RT04: 15, RT05: 12 },
  otherPlans: { RT01: 2.5, RT02: 3, RT03: 3, RT04: 3.5, RT05: 3 },
  gapPenalty: 1.5,
};

export const STAGE_INFO = {
  watch: { name: "觀望型", emoji: "🌱", description: "你目前比較接近「觀望型」。這代表你對愛爾蘭或海外生活有興趣，但可能還在蒐集資訊、比較不同國家，或還沒有明確出發時間。這個階段不用急著報名，最重要的是先看懂自己的目標、預算和真正的卡點。", nextSteps: "先了解愛爾蘭語校、25+8 和短期遊學的差異\n整理預算方向與出發時間\n把你最在意的問題先寫下來，諮詢時更有效率", followUp: "加入 email nurturing 名單，持續寄送實用內容與活動通知", cta: "explore_pack" },
  explore: { name: "探索型", emoji: "🔍", description: "你目前比較接近「探索型」。這代表你已經不只是隨便看看，而是開始認真思考愛爾蘭是否適合你。你可能正在比較方案、預算、英文程度或未來可能性。這個階段最適合先系統整理資訊，再決定下一步。", nextSteps: "比較短期語校與 25+8 的差異\n釐清預算、出發時間與工作期待\n把你最在意的問題先寫下來，諮詢時更有效率", followUp: "寄送資料包與下一場說明會邀請，並在活動前再次提醒", cta: "explore_pack" },
  ready: { name: "準備型", emoji: "📋", description: "你目前比較接近「準備型」。這代表你已經進入比較實際的規劃階段，可能需要開始確認學校、課程長度、預算、住宿與出發時間。", nextSteps: "整理你的出發時間與預算上限\n參考愛爾蘭語校自主評估包，或直接預約一對一語校出發諮詢\n確認方案後盡快啟動申請流程，避免錯過開課日期", followUp: "寄送資料包與說明會邀請，重點追蹤，適時邀請一對一諮詢", cta: "ready_both" },
  action: { name: "行動型", emoji: "🚀", description: "你目前比較接近「行動型」。這代表你可能已經接近決策階段，需要的不只是更多資訊，而是有人協助你確認學校、課程、報價、住宿、文件與時間安排。", nextSteps: "準備目前預算、出發時間與偏好課程\n預約一對一語校出發諮詢，讓哩來幫你比較語校、確認報價與流程\n諮詢費可折抵報名定金（諮詢後 7 日內報名享 NT$3,000 定金優惠），開課後定金全額退還", followUp: "請 24–48 小時內主動聯繫，邀請一對一諮詢", cta: "action_consult" },
} as const;

export function classifyStage(data: AssessmentData): Stage {
  let score = 0;
  if (data.awareness === "已經準備報名，只是在找可信任的代辦或顧問") score += 4;
  else if (data.awareness === "已經蠻確定想去愛爾蘭，但還沒決定方案") score += 3;
  else if (data.awareness === "已經看過一些愛爾蘭語校或 25+8 資訊" || data.awareness === "正在比較愛爾蘭和其他國家") score += 2;
  if (data.timeline === "3 個月內") score += 4;
  else if (data.timeline === "3–6 個月內") score += 3;
  else if (data.timeline === "6–12 個月內") score += 2;
  if (["25+8 打工遊學", "考試準備班／商業英文", "8–12 週語言學習", "2–4 週短期遊學"].includes(data.plan ?? "")) score += 2;
  score += BUDGET_RULES[data.budget ?? ""]?.stagePoints || 0;
  if (score >= 10) return "action";
  if (score >= 7) return "ready";
  if (score >= 4) return "explore";
  return "watch";
}

export function classifyLead(data: AssessmentData) {
  const hotTimeline = ["3 個月內", "3–6 個月內"];
  const hotAwareness = ["已經準備報名，只是在找可信任的代辦或顧問", "已經蠻確定想去愛爾蘭，但還沒決定方案"];
  let hotScore = 0;
  if (hotTimeline.includes(data.timeline ?? "")) hotScore += 2;
  if (hotAwareness.includes(data.awareness ?? "")) hotScore += 2;
  hotScore += BUDGET_RULES[data.budget ?? ""]?.hotPoints || 0;
  if (["25+8 打工遊學", "考試準備班／商業英文"].includes(data.plan ?? "")) hotScore += 1;
  if (hotScore >= 4) return "🔥 Hot Lead";
  if ([...hotTimeline, "6–12 個月內"].includes(data.timeline ?? "") || hotAwareness.includes(data.awareness ?? "")) return "♨️ Warm Lead";
  return "🌱 Nurture Lead";
}

const BARRIER_TO_INDEX: Record<string, number> = {
  "預算不確定": 1, "英文不夠好": 2, "家人不支持或還沒溝通": 3,
  "不知道能不能在愛爾蘭找到工作": 4, "不確定回台灣後是否有幫助": 5,
  "怕孤單或適應不良": 6, "不知道愛爾蘭和其他國家怎麼選": 7,
  "不知道自己是不是真的適合出國": 8, "害怕做錯決定": 9,
  "還不清楚學校、簽證與住宿流程": 10,
};

export function getBlockerDiagnosis(barriers = "") {
  const selected = barriers.split("、").map(item => BARRIER_TO_INDEX[item.trim()]).filter(Boolean);
  const has = (value: number) => selected.includes(value);
  if (has(1) && has(4) && has(5)) return "你選的卡點都和「值不值得」有關——預算、打工、回台後的價值。這代表你不是衝動型，你在認真評估這趟旅程的投資報酬。這種思維方式其實很適合做出一個穩固的決定，你需要的是有人用具體數字和真實案例陪你算清楚這筆帳。";
  if (has(10) && has(9)) return "你選的卡點都是關於「不知道怎麼走」——這不是你準備不夠，而是你還沒有機會看到整個流程的全貌。一旦有人把步驟從頭到尾走一遍給你看，你會發現每一步其實都沒有想像中複雜。";
  if (has(8) && has(9)) return "你在問的其實不是「愛爾蘭好不好」，而是「我適不適合出去」——這是一個更深的問題，資訊回答不了它。這個問題需要有人先了解你現在的狀態，才有辦法給你一個真正有用的答案。";
  if (has(3) && has(9)) return "你在外部有阻力（家人），內部又對自己的決定不夠確定——這個狀況下，光是拿到更多資訊不會讓你更敢走。你需要的是先把自己的理由想清楚，才有辦法跟家人溝通，也才有辦法說服自己。";
  if (has(1) && has(9)) return "你同時在擔心預算，又害怕做錯決定——這個組合通常不是錢的問題，而是對未知的控制感還不夠。你需要的不是更多資訊，而是一個能幫你把條件排列清楚、讓你看見決策輪廓的對話。";
  if (has(7) && has(10)) return "你同時對學校和國家選擇都還不確定——這通常不是你沒有認真找資料，而是選項太多、比較起來又沒有標準，越查越亂。你需要的是先確定一個對你最重要的條件，其他選擇就會自然縮小。這正是我們可以幫你做的事：先問你幾個問題，幫你篩掉不適合的選項。";
  if (has(6) && has(8)) return "你在擔心的不只是行程本身，更是「我能不能撐過去」——這其實是一種對自己的誠實，不是弱點。很多後來很適應的學生，出發前也是這樣想的。這個問題適合在諮詢時直接聊，不是靠資訊能解答的。";
  if (has(2) && has(8)) return "「英文不夠好」和「不確定自己適不適合」這兩個卡點常常連在一起出現——很多時候，英文只是表面的擔心，底下是「我這樣的程度，人家會不會覺得我格格不入」。這個問題有具體的答案，語校的分級制度就是為了這件事設計的。";
  return "你選的這些卡點，反映的是你對這個決定的認真程度——卡住不是因為你不適合，而是因為你在意這個選擇。帶著這些問題來諮詢，正是我們可以一起整理的事。";
}

export function getAssessmentContent(data: AssessmentData, stage: Stage) {
  const info = STAGE_INFO[stage];
  if (data.plan !== "25+8 打工遊學") return info;
  const preparing = stage === "ready" || stage === "action";
  const nextSteps = preparing ? [
    "整理你的總預算、預計出發時間與課程偏好。",
    "Alex & Arsha 會在 1–2 個工作天內聯繫你，先透過文字確認需求。",
    "了解需求後，我們會免費開放《歐洲漫遊錄》說明會影片與相關資源，協助你確認下一步。",
  ] : [
    "整理你對 25+8 最想了解的問題，以及目前的預算與時間想法。",
    "Alex & Arsha 會在 1–2 個工作天內聯繫你，先透過文字了解你的狀況。",
    "了解需求後，我們會免費開放《歐洲漫遊錄》說明會影片與相關資源，讓你依自己的步調評估。",
  ];
  return { ...info, nextSteps: nextSteps.join("\n"), cta: "twentyfive_plus8" };
}

export function getTimeAnchor(timeline = "", plan = "") {
  if (plan === "25+8 打工遊學") {
    return ({
      "3 個月內": "出發時間較近，請先整理預算與預計開課日期，團隊聯繫時可一起確認準備時程。",
      "3–6 個月內": "可以先整理預算與出發月份，團隊聯繫時再一起確認課程及準備時程。",
      "6–12 個月內": "你還有時間比較方向，可先列出在意的條件，再透過影片與團隊聯繫逐步確認。",
      "一年以上": "時間較充裕，可以先了解 25+8 的安排，再逐步整理預算與出發方向。",
      "還不確定": "可以先從自己的目標與預算開始，團隊聯繫時再一起整理適合的出發時間。",
    } as Record<string, string>)[timeline] || "";
  }
  return ({
    "3 個月內": "你的出發時間很近，建議這 2–4 週就預約諮詢確認方案。",
    "3–6 個月內": "如果要在 6 個月內出發，申請流程需要時間，現在開始剛好，也是適合購買機票的時候。",
    "6–12 個月內": "你還有時間，但語校熱門時段和住宿容易提早額滿，建議先了解方向，到時再確認細節。",
    "一年以上": "時間充裕，但方向越早確認，後面準備越從容。",
    "還不確定": "如果目標是暑期 6–9 月抵達，語校名額跟住宿很容易提早額滿，建議及早規劃。",
  } as Record<string, string>)[timeline] || "";
}

export function calcDimensions(fd: AssessmentData) {
  const B = BUDGET_RULES[fd.budget ?? ""]?.sensitivity || 3;
  const F = 6 - B;
  let E = 2;
  if (fd.englishGoal === "最主要目的") E = 5;
  else if (fd.englishGoal === "重要但非唯一") E = 3;
  else if (fd.englishGoal === "非首要目標") E = 1;
  else {
    if (fd.goals?.includes("提升英文能力")) E += 2;
    if (fd.plan?.includes("語言學習")) E += 1;
  }
  E = Math.max(1, Math.min(5, E));
  let W = 1;
  if (fd.plan === "25+8 打工遊學") W += 3;
  if (fd.goals?.includes("累積海外職涯")) W += 1;
  if (fd.workIntention === "有，這是我出發的重要原因之一") W = Math.max(W, 4);
  else if (fd.workIntention === "沒有，我以學習和體驗為主" || fd.wantWork === false) W = 1;
  W = Math.max(1, Math.min(5, W));
  let C = 3;
  if (fd.cityPreference === "傾向非都柏林城市") C = 5;
  else if (fd.cityPreference === "沒有特別偏好") C = 4;
  else if (fd.cityPreference === "都柏林為主，願意考慮其他城市") C = 2;
  else if (fd.cityPreference === "想待在都柏林") C = 1;
  let L = 2;
  if (fd.goals?.includes("體驗歐洲生活")) L += 1;
  if (fd.goals?.includes("想拓展人生經驗")) L += 1;
  if (fd.goals?.includes("累積海外職涯")) L += 0.5;
  L = Math.max(1, Math.min(5, L));
  return { B, E, W, C, L, F };
}

export function calcRouteScores(fd: AssessmentData, dims = calcDimensions(fd)) {
  const { B, E, W, C, L, F } = dims;
  const is25plus8 = fd.plan === "25+8 打工遊學";
  const scores: Record<string, number> = {};
  const cityBoost = fd.cityPreference === "傾向非都柏林城市" ? 1.5 : fd.cityPreference === "沒有特別偏好" ? 0.6 : fd.cityPreference === "都柏林為主，願意考慮其他城市" ? 0.3 : 0;
  scores.RT01 = 0.75 * B + 0.15 * W + 0.10 * C;
  scores.RT02 = 0.50 * W + 0.20 * L + 0.20 * E + 0.10 * B + (is25plus8 ? 0.4 : 0) - (fd.wantWork === false ? 0.7 : 0);
  scores.RT03 = 0.60 * E + 0.15 * L + 0.15 * F + 0.10 * W + (fd.plan === "考試準備班／商業英文" ? 0.8 : 0);
  scores.RT04 = 0.45 * F + 0.30 * L + 0.25 * E;
  scores.RT05 = 0.55 * C + 0.25 * B + 0.20 * L + cityBoost;
  scores.RT06 = -999;
  for (const key in scores) if (scores[key] !== -999) scores[key] = Math.min(5, scores[key]);
  const usable = BUDGET_RULES[fd.budget ?? ""]?.usableTuition;
  const budgetGap: Record<string, boolean> = {};
  if (usable !== null && usable !== undefined) {
    const minimums = is25plus8 ? ROUTE_BUDGET_RULES.twentyFivePlus8 : ROUTE_BUDGET_RULES.otherPlans;
    for (const route in minimums) {
      if (usable < minimums[route as keyof typeof minimums]) {
        budgetGap[route] = true;
        scores[route] = Math.max(0, scores[route] - ROUTE_BUDGET_RULES.gapPenalty);
      }
    }
  }
  return { scores, budgetGap, usable };
}

export function getRouteRecommendation(fd: AssessmentData) {
  const dims = calcDimensions(fd);
  const { scores, budgetGap } = calcRouteScores(fd, dims);
  const routeNames: Record<string, string> = { RT01: "小資起飛線", RT02: "打工開局線", RT03: "英文進化線", RT04: "質感升級線", RT05: "城市換軌線" };
  const ranked = Object.keys(routeNames).map(rt => ({ rt, score: scores[rt] })).sort((a, b) => b.score - a.score);
  const [primary, secondary] = ranked;
  const matchLabel = (score: number) => score >= 4.2 ? "高匹配" : score >= 3.5 ? "中高匹配" : score >= 2.8 ? "可考慮" : "目前非優先";
  const format = (route: typeof primary) => ({ rt: route.rt, name: routeNames[route.rt], score: route.score, matchLabel: matchLabel(route.score), hasBudgetGap: !!budgetGap[route.rt] });
  return { dims, scores, primary: format(primary), secondary: secondary.score >= 3.5 ? format(secondary) : null, isSimilar: Math.abs(primary.score - secondary.score) <= 0.25, budgetUnclear: fd.budget === "還不確定" };
}
