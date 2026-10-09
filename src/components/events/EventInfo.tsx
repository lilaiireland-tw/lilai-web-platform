import type { EventContent } from "@/lib/events/event-types";
import styles from "./events.module.css";

export function EventInfo({ event }: { event: EventContent }) {
  const formats = { "in-person": "實體活動", online: "線上活動", hybrid: "實體與線上活動" };
  return <dl className={styles.details}>
    <div><dt>活動時間</dt><dd><time dateTime={event.startAt}>{event.dateLabel}</time></dd></div>
    <div><dt>活動形式</dt><dd>{formats[event.format]}</dd></div>
    <div><dt>活動地點</dt><dd>{event.venue}</dd></div>
  </dl>;
}
