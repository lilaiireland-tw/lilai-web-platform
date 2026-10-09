import type { EventSection } from "@/lib/events/event-types";
import styles from "./events.module.css";

export function EventAgenda({ items }: { items: Extract<EventSection, { type: "agenda" }>["items"] }) {
  return <ol className={styles.list}>{items.map((item, i) => <li key={i}>
    {item.time && <span className="ds-small">{item.time} · </span>}<strong>{item.title}</strong>
    {item.description && <p>{item.description}</p>}
  </li>)}</ol>;
}
