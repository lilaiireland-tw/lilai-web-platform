import type { EventContent } from "../../lib/events/event-types";
import { blackFridayFaq } from "./black-friday-copy";

const title = "哩來黑五出發計畫｜指定課程最高 30% OFF";
const description = "指定語校課程最高 30% OFF，ISI Dublin 精選下午班現省 €1,000。另有指定學校免註冊費與哩來加碼，符合條件可疊加，活動至 2026/11/30。";

export const blackFridayEvent: EventContent = {
  slug: "black-friday-2026",
  title,
  shortTitle: "哩來黑五出發計畫",
  description,
  // User approved November 1 as the internal date; source display stays 即日起.
  startAt: "2026-11-01T00:00:00+08:00",
  dateLabel: "即日起至 2026/11/30",
  venue: "LINE 線上諮詢",
  format: "online",
  registrationUrl: "https://line.me/R/ti/p/@lilaiireland",
  registrationLabel: "用 LINE 詢問我的優惠",
  status: "active",
  campaignName: "哩來黑五出發計畫 2026",
  heroImage: { src: "/events/black-friday-2026/photo-street-group.jpg", width: 896, height: 846, alt: "哩來學長姐與學生在都柏林街頭的自拍合照" },
  seo: {
    index: false, title, description,
    ogImage: { src: "/events/black-friday-2026/og-share.png", width: 1200, height: 630, alt: "哩來黑五出發計畫：指定語校課程最高 30% OFF，活動至 2026/11/30" },
  },
  sections: [{ id: "faq", type: "faq", title: "常見問題", items: blackFridayFaq }],
};
