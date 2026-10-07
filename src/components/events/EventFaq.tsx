import type { EventSection } from "@/lib/events/event-types";
import styles from "./events.module.css";

export function EventFaq({ items }: { items: Extract<EventSection, { type: "faq" }>["items"] }) {
  return <div>{items.map((item, i) => <details className={styles.faq} key={i}>
    <summary>{item.question}</summary><p>{item.answer}</p>
  </details>)}</div>;
}
