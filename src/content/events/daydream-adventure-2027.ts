import type { EventContent } from "@/lib/events/event-types";
import { daydreamCopy as copy } from "./daydream-copy";

const title = `${copy.hero.title}｜${copy.event.title}`;
const description = copy.speakers.title.replaceAll("\n", "");

export const daydreamEvent: EventContent = {
  slug: "daydream-adventure-2027",
  title,
  shortTitle: copy.hero.title,
  description,
  // The approved 2027 campaign is held in October 2026. No exact end time supplied.
  startAt: "2026-10-18T20:00:00+08:00",
  dateLabel: "2026.10.18（日）20:00 · 台灣時間 UTC+8",
  venue: "線上直播",
  format: "online",
  registrationUrl: "https://forms.gle/isPDKepgK9BsPpg86",
  registrationLabel: "免費報名分享會",
  status: "active",
  campaignName: "白日夢冒險王 2027",
  heroImage: copy.hero.photos[0],
  // No indexing instruction in the supplied source: retain conservative campaign noindex.
  seo: { index: false, title, description, ogImage: copy.hero.photos[0] },
  sections: [
    { id: "speakers", type: "speakers", title: copy.speakers.title, speakers: copy.speakers.people },
    { id: "event", type: "info", title: copy.event.title },
    { id: "faq", type: "faq", title: copy.faq.title, items: copy.faq.items },
    { id: "register", type: "cta", title: copy.register.title, label: "免費報名 10/18 分享會" },
  ],
};

export const daydreamDetails = [
  { label: "DATE", value: "2026 / 10 / 18（日）" },
  { label: "TIME", value: "20:00", note: "台灣時間 UTC+8" },
  { label: "FORMAT", value: daydreamEvent.venue },
  { label: "DURATION", value: "約 90–120 分鐘" },
  { label: "PRICE", value: "免費參加" },
  { label: "CAPACITY", value: "限額 200 位" },
  { label: "REGISTRATION DEADLINE", value: "10 / 18（日）18:00" },
  { label: "SPEAKERS", value: copy.speakers.people.map(person => person.name).join(" · "), note: "Alex、Arsha 哩來愛爾蘭學長 · Bella 哩來合作分享人" },
  { label: "PRESENTED BY", value: "Lilai Ireland 哩來愛爾蘭", note: "築夢愛爾國際留遊學顧問" },
] as const;

export const daydreamContact = {
  instagramUrl: "https://www.instagram.com/lilaiireland/",
  instagramHandle: "@lilaiireland",
  email: "info@lilaiireland.com",
  qrImage: { src: "/events/daydream-adventure-2027/qr-register.png", alt: "報名表單 QR Code", width: 300, height: 300 },
  disclaimer: "本活動主題靈感來自電影《白日夢冒險王》，為非官方合作活動。",
};
