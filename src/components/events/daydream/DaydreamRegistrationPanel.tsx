import Image from "next/image";
import type { EventContent } from "@/lib/events/event-types";
import { daydreamContact as contact, daydreamPresentation as presentation } from "@/content/events/daydream-adventure-2027";
import { daydreamCopy as copy } from "@/content/events/daydream-copy";
import { CampaignButton } from "./DaydreamPrimitives";
import styles from "./daydream.module.css";

export function DaydreamRegistrationPanel({ event }: { event: EventContent }) {
  if (event.status !== "active") return null;
  return <div className={styles.registerCard}>
    <div className={styles.registerCardHeading}><h3>免費報名 10/18 分享會</h3><span>{presentation.registrationDate} · {event.venue} · FREE</span></div>
    <div className={styles.registerAction}><div className={styles.registerButtonGroup}>
        <CampaignButton event={event} location="register" external label="免費報名 10/18 分享會" />
        <div><span>將前往 Google 表單完成報名（開新分頁）。</span><span>{event.registrationUrl.replace("https://", "")}</span></div>
      </div><figure className={styles.qr}><Image {...contact.qrImage} unoptimized loading="lazy" /><figcaption>手機掃碼報名</figcaption></figure></div>
    <div className={styles.registrationNotes}><p>{copy.register.paragraphs[1]}</p><p>{copy.register.paragraphs[2]}</p></div>
  </div>;
}
