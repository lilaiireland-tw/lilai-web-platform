"use client";
import { useState } from "react";
import { daydreamCopy } from "@/content/events/daydream-copy";
import { Lines } from "./DaydreamPrimitives";
import styles from "./daydream.module.css";

export function DaydreamFaq() {
  const [open, setOpen] = useState<number | null>(null);
  return <div className={styles.faqList}>{daydreamCopy.faq.items.map((item, i) =>
    <div key={item.question} className={styles.faqItem}>
      <button type="button" aria-expanded={open === i} aria-controls={`daydream-answer-${i}`}
        onClick={() => setOpen(open === i ? null : i)} className={styles.faqQuestion}>
        <span>{item.question}</span><span aria-hidden="true">{open === i ? "−" : "＋"}</span>
      </button>
      <p id={`daydream-answer-${i}`} hidden={open !== i} className={styles.faqAnswer}><Lines text={item.answer} /></p>
    </div>)}</div>;
}
