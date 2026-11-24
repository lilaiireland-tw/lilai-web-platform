import { assessmentResourceCopy } from "@/lib/consult/assessment";

export const heroImages = [
  { src: "https://lilaiireland.com/wp-content/uploads/2026/07/lilai-consultation-hero-1-1.jpg", alt: "哩來愛爾蘭 — Podcast 錄製現場" },
  { src: "https://lilaiireland.com/wp-content/uploads/2026/07/lilai-consultation-hero-2-1.jpg", alt: "哩來愛爾蘭 — Alex & Arsha 在愛爾蘭" },
  { src: "https://lilaiireland.com/wp-content/uploads/2026/07/lilai-consultation-hero-3-1.jpg", alt: "哩來愛爾蘭 — 說明會現場" },
] as const;

export const benefits = [
  ["免費出發階段建議", "幫你判斷目前比較接近觀望型、探索型、準備型或行動型，讓你知道現在該做什麼。"],
  ["愛爾蘭語校與 25+8 初步方向", "根據你的目標與出發時間，初步判斷你適合短期語校、25+8，還是先整理資訊。"],
  ["預算與生活準備資料", "包含愛爾蘭語校、25+8、生活成本、住宿、打工與出發前準備方向。"],
  ["免費資源與說明會重播", assessmentResourceCopy],
] as const;

export const options = {
  discoveryChannels: ["instagram", "threads", "google_website", "dcard", "facebook", "accupass", "referral", "youtube", "other", "unknown"],
  dcardExposure: ["yes", "maybe_dcard", "maybe_other", "no_recall"],
  location: ["台灣", "愛爾蘭", "其他歐洲國家", "其他地區"],
  awareness: ["剛開始了解，還在查資料", "已經看過一些愛爾蘭語校或 25+8 資訊", "正在比較愛爾蘭和其他國家", "已經蠻確定想去愛爾蘭，但還沒決定方案", "已經準備報名，只是在找可信任的代辦或顧問"],
  timeline: ["3 個月內", "3–6 個月內", "6–12 個月內", "一年以上", "還不確定"],
  plan: ["2–4 週短期遊學", "8–12 週語言學習", "25+8 打工遊學", "考試準備班／商業英文", "還不確定，需要先評估", "我其實也在比較其他國家"],
  workIntention: ["有，這是我出發的重要原因之一", "沒有，我以學習和體驗為主", "還在考慮中"],
  goals: ["提升英文能力", "體驗歐洲生活", "累積海外職涯", "想離開台灣一陣子，換個環境", "未來想嘗試留在海外", "想銜接碩士或職涯發展", "想拓展人生經驗"],
  englishGoal: ["最主要目的", "重要但非唯一", "非首要目標"],
  barriers: ["預算不確定", "英文不夠好", "家人不支持或還沒溝通", "不知道能不能在愛爾蘭找到工作", "不確定回台灣後是否有幫助", "怕孤單或適應不良", "不知道愛爾蘭和其他國家怎麼選", "不知道自己是不是真的適合出國", "害怕做錯決定", "還不清楚學校、簽證與住宿流程"],
  cityPreference: ["想待在都柏林", "都柏林為主，願意考慮其他城市", "傾向非都柏林城市", "沒有特別偏好"],
  budget: ["NT$30 萬以下", "NT$30–35 萬", "NT$35–40 萬", "NT$40–45 萬", "NT$45 萬以上", "還不確定"],
  resources: ["愛爾蘭語校比較", "25+8 打工遊學介紹", "預算與生活成本", "住宿資訊", "愛爾蘭找工作與打工", "英文程度與適應問題", "出發前準備 checklist", "一對一諮詢與選校建議"],
  webinar: ["愛爾蘭語校與 25+8 完整介紹", "英文不好也能去愛爾蘭嗎？", "愛爾蘭打工、生活成本與預算規劃", "從台灣到歐洲生活的真實經驗", "如何說服家人與規劃出發時間", "愛爾蘭 vs 其他國家比較", "還不確定，想先收到活動通知"],
} as const;

export const optionLabels: Partial<Record<keyof typeof options, Record<string, string>>> = {
  discoveryChannels: {
    instagram: "Instagram（貼文／Reels／限時動態）", threads: "Threads", google_website: "Google 搜尋／哩來官方網站",
    dcard: "Dcard（心得分享／文章推薦）", facebook: "Facebook（社團／貼文）", accupass: "Accupass",
    referral: "朋友、學長姐或熟人推薦", youtube: "YouTube", other: "其他", unknown: "不確定／沒有印象",
  },
  dcardExposure: {
    yes: "有，我曾經看過", maybe_dcard: "不太確定，但有印象在 Dcard 看過相關分享",
    maybe_other: "不太確定，有印象看過相關分享，但不是在 Dcard", no_recall: "沒有／沒有印象",
  },
  englishGoal: { "最主要目的": "這趟旅程最主要的目的", "重要但非唯一": "重要，但不是唯一原因", "非首要目標": "不是我的首要目標，我有其他優先考量" },
  cityPreference: { "都柏林為主，願意考慮其他城市": "都柏林為主，但願意考慮其他城市", "傾向非都柏林城市": "傾向非都柏林城市（高威、科克等）", "沒有特別偏好": "沒有特別偏好，哪裡適合就去哪裡" },
  budget: { "還不確定": "還不確定，需要更多資訊" },
};

// shortcut: UI reference keys only; verify the public policy revision and backend registry before release.
export const assessmentFormContract = {
  contractVersion: "free-assessment.v1",
  privacyNoticeVersion: "agreement-reference.v1",
  consentTextVersion: "free-assessment-consent.v1",
  consentSource: "free_assessment",
} as const;

export const privacyNotice = {
  url: "https://lilaiireland.com/agreement/",
  short: "哩來愛爾蘭將使用你提供的資料進行本次免費評估、寄送結果及必要的服務回覆。",
  full: "哩來愛爾蘭將使用你提供的聯絡方式、出發計畫與需求等資料，進行本次免費評估、寄送結果及必要的服務回覆。未經適當告知與確認，我們不會直接以此表單替你向語言學校提出正式申請。詳細資料使用、保存方式及個資權利，請參閱",
};

export const contactPreferences = [
  { field: "contactConsent", label: "我希望哩來的學長姐依據這次評估，透過我提供的聯絡方式與我討論下一步。", hint: "僅用於本次評估相關的個別聯繫，不代表訂閱日後行銷訊息。" },
  { field: "marketingConsent", label: "我願意透過 Email 收到哩來提供的愛爾蘭語校、25+8、出發攻略、說明會邀請與活動優惠資訊。", hint: "可隨時取消訂閱。不勾選也能取得完整免費評估結果。" },
] as const;

export const nextStepInvitation = "完成評估後，你可以依照自己的需求選擇下一步。如果希望優先收到未來說明會邀請，也歡迎訂閱哩來的出發資訊。";

export const faqs = [
  ["《哩來出發計畫》是報名表嗎？", "不是。《哩來出發計畫》是一份免費的出發前評估表單，目的是幫你初步看懂自己目前的狀態、適合的方向，以及下一步可以怎麼走。填完不代表你要立刻報名語校，也不代表你一定要購買任何方案。我們希望你先把自己看清楚，再決定要不要出發。"],
  ["填完表單後，我會收到什麼？", "初步出發階段評估、下一步建議，以及愛爾蘭語校、25+8、預算與生活準備方向。" + assessmentResourceCopy],
  ["如何收到未來說明會邀請？", nextStepInvitation + "未來通知僅透過 Email 寄給有有效行銷授權且未退訂的使用者；選填感興趣的主題或索取既有重播不代表訂閱。"],
  ["我完全不知道自己適不適合去愛爾蘭，應該先選哪一個？", "建議你先填寫「哩來出發計畫｜免費階段評估」。它適合還在觀望、剛開始查資料、或不知道自己適合短期語校、25+8、考試準備班／商業英文的人。如果你現在的狀態是「我有興趣，但不知道從哪開始」，那就先從這裡開始。"],
  ["沒有同意聯繫或行銷，還能索取重播嗎？", assessmentResourceCopy + "兩項授權皆為選填，不勾選也不影響取得結果與資源；你可以自行索取，我們不會因此主動跟進。"],
  ["免費一對一諮詢適合什麼人？", "觀看重播後，若想確認語校、城市、週數、預算、住宿與申請流程，可透過 LINE 或回覆報告 Email 預約免費一對一諮詢。自行預約所需的服務回覆，不代表訂閱未來行銷訊息。"],
  ["這些方案會不會都是在推我報名語校？", "不會。我們當然提供語校代辦與留遊學諮詢服務，但《哩來出發計畫》的目的不是把每個人都推去報名。有些人適合 25+8，有些人適合短期語校，有些人可能適合先存錢、先補英文，甚至暫時不適合出發。我們希望做的是：幫你做出比較清楚、比較適合自己的選擇。"],
] as const;
