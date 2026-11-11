import { blackFridayFaq } from "@/content/events/black-friday-copy";
import styles from "./black-friday.module.css";

export function BlackFridayFaq() {
  return <div className={styles.faqList}>{blackFridayFaq.map((item, i) =>
    <details key={item.question} name="black-friday-faq" open={i === 0} className={styles.faq}>
      <summary>{item.question}<span aria-hidden="true" className={styles.faqArrow} /></summary>
      <div className={styles.faqAnswer}>{item.answer}</div>
    </details>)}
  </div>;
}
