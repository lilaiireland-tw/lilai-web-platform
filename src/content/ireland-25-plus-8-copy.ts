export const ireland25Plus8Video = {
  youtubeId: "fY5Qom7wTKE",
  title: "25+8 說明會精華",
};

// Approved source copy. Keep prices and school facts aligned with the supplied handoff.
export const ireland25Plus8Tiers = [
  {
    "symbol": "€",
    "label": "小資",
    "price": "€3,500 以下（含）",
    "description": "重視預算與實用性，優先考慮整體負擔。",
    "schoolId": "school-ned-college"
  },
  {
    "symbol": "€€",
    "label": "平衡",
    "price": "超過 €3,500～€5,000（含）",
    "description": "兼顧預算、課程與個人需求。",
    "schoolId": "school-isi-dublin"
  },
  {
    "symbol": "€€€",
    "label": "輕奢",
    "price": "超過 €5,000",
    "description": "課程預算更有彈性，可比較不同的學習環境與方案。",
    "schoolId": "school-atlas-language-school"
  }
];

export const ireland25Plus8Schools = [
  {
    "id": "school-ned-college",
    "name": "NED College",
    "detailUrl": "https://tidy-nerine-6a5.notion.site/NED-College-32a23b0a4ab3805d9701ebd99c48d2ab",
    "image": {
      "src": "/assets/ireland-25-plus-8/photos/school-ned-college.jpg",
      "alt": "NED College 學生在 Dublin 校舍門口交談",
      "width": 1280,
      "height": 719
    },
    "location": "Dublin 校區｜另有 Limerick 校區",
    "tagline": "預算友善 × 實用求職支援",
    "description": "希望控制出發預算，同時為海外找工作做好準備？NED 提供實用的求職資源與學生 App。",
    "features": [
      "CV 與面試練習等求職資源",
      "學生 App 可查看出勤、假期與活動",
      "有不同課程時段，可依當期方案比較"
    ],
    "suitableFor": "預算優先，也重視海外工作與生活體驗的人。",
    "tier": `${ireland25Plus8Tiers[0].symbol} ${ireland25Plus8Tiers[0].label}`
  },
  {
    "id": "school-isi-dublin",
    "name": "ISI Dublin",
    "detailUrl": "https://tidy-nerine-6a5.notion.site/ISI-Dublin-27b23b0a4ab380dc867ee2e91082bb64",
    "image": {
      "src": "/assets/ireland-25-plus-8/photos/school-isi-dublin.jpg",
      "alt": "ISI Dublin 石牆教室裡的英文課",
      "width": 678,
      "height": 452
    },
    "location": "Dublin 1｜市中心",
    "tagline": "特色校舍 × 文化活動 × 國際交流",
    "description": "想把英文真正融入生活？ISI 結合歷史校舍、文化活動與市中心生活機能。",
    "features": [
      "歷史修道院改建的特色校舍",
      "Conversation Corner 等英文交流資源",
      "Jobs Club、文化與課外活動"
    ],
    "suitableFor": "想兼顧英文學習、國際社交與城市生活的人。",
    "tier": `${ireland25Plus8Tiers[1].symbol} ${ireland25Plus8Tiers[1].label}`
  },
  {
    "id": "school-atlas-language-school",
    "name": "Atlas Language School",
    "detailUrl": "https://tidy-nerine-6a5.notion.site/Atlas-Language-School-32c23b0a4ab38020a5cbcaa85eb18832",
    "image": {
      "src": "/assets/ireland-25-plus-8/photos/school-atlas-language-school.jpg",
      "alt": "Atlas Language School 接待大廳與學生",
      "width": 1024,
      "height": 683
    },
    "location": "Dublin 2｜Portobello House",
    "tagline": "教學資源 × 考試準備 × 校園體驗",
    "description": "重視學習資源、考試準備與完整校園體驗？Atlas Language School 提供多元的校園生活資源。",
    "features": [
      "Grand Canal 旁的特色校園環境",
      "語言考試準備資源",
      "學生公共空間與課外活動"
    ],
    "suitableFor": "重視學習資源與校園環境、預算較有彈性的人。",
    "tier": `${ireland25Plus8Tiers[2].symbol} ${ireland25Plus8Tiers[2].label}`
  }
];

type FaqItem = { question: string; answer: string; link?: { href: string; label: string } };
export const ireland25Plus8Faq: FaqItem[] = [
  {
    "question": "愛爾蘭 25+8 是什麼？",
    "answer": "愛爾蘭長期英文課程方案的通稱：報名至少 25 週的合格英文課程，符合規定後可獲准最長約 8 個月的學生居留，並在規定內兼職。它不是獨立的簽證類型。",
    "link": {
      "href": "#system",
      "label": "看制度說明 →"
    }
  },
  {
    "question": "25+8 有年齡限制嗎？",
    "answer": "一般須年滿 18 歲，沒有打工度假的年齡上限；但仍需符合合格課程、財力、出席率與考試等條件。"
  },
  {
    "question": "英文不好可以報名嗎？",
    "answer": "可以。學校會依程度分班，多數課程接受初階學生；部分課程有最低程度要求，以學校規定為準。"
  },
  {
    "question": "25+8 一期可以待多久？",
    "answer": "一期是 25 週課程加上假期，學生居留最長約 8 個月，實際效期依移民局核發為準。"
  },
  {
    "question": "25+8 可以打工嗎？每週可以工作幾小時？",
    "answer": "符合 Stamp 2 條件可以兼職：一般每週最多 20 小時；6–9 月，以及 12 月 15 日至 1 月 15 日，每週最多 40 小時。",
    "link": {
      "href": "#system",
      "label": "看工時規定 →"
    }
  },
  {
    "question": "25+8 的費用大約多少？",
    "answer": "哩來把合作語校分成三個預算級距：€ 小資（€3,500 以下，含）、€€ 平衡（超過 €3,500～€5,000，含）、€€€ 輕奢（超過 €5,000）。級距是預算分類，不是品質評等。機票、住宿與生活費另計。",
    "link": {
      "href": "#budget",
      "label": "看預算拆解 →"
    }
  },
  {
    "question": "財力證明是什麼？需要另外繳給政府嗎？",
    "answer": "不用繳給政府。財力證明是你需要具備並能證明的生活資金；目前 8 個月課程的要求是可直接支配的 €6,665。"
  },
  {
    "question": "25+8 可以續簽幾次？",
    "answer": "合格語言課程最多三期，學生居留累計最長約兩年；每次續簽都要重新符合條件並經審核。"
  },
  {
    "question": "25+8 跟 WHV（打工度假）有什麼不同？",
    "answer": "WHV（打工度假）以度假為主，有年齡與名額限制；25+8 以學英文為主，打工依 Stamp 2 規定。",
    "link": {
      "href": "#fit",
      "label": "看三種方式比較 →"
    }
  },
  {
    "question": "一對一諮詢需要付費嗎？透過哩來報名有什麼服務？",
    "answer": "不一定。先填免費出發評估、看完說明會重播，就可以預約免費的一對一諮詢；想跳過重播直接討論，也可以選擇付費的一對一諮詢方案。哩來提供客製化選校、報名協助、行前說明會，以及依方案條件提供的開局大禮包。",
    "link": {
      "href": "#consult",
      "label": "看兩種諮詢方式 →"
    }
  }
];

export const ireland25Plus8Schema = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "哩來愛爾蘭",
        "item": "https://lilaiireland.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "愛爾蘭 25+8 打工遊學",
        "item": "https://lilaiireland.com/ireland-25-plus-8"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "愛爾蘭25+8完整攻略｜費用、打工規定與語校推薦",
    "url": "https://lilaiireland.com/ireland-25-plus-8",
    "inLanguage": "zh-Hant",
    "dateModified": "2026-11-18",
    "publisher": {
      "@type": "Organization",
      "name": "哩來愛爾蘭 Lilai Ireland",
      "url": "https://lilaiireland.com/"
    }
  }
];
