import { Button } from "@/components/ui/Button";
import type { EventContent } from "@/lib/events/event-types";
import { eventPath } from "@/lib/events/event-registry";
import styles from "./events.module.css";

export function EventStatusBanner({ event, nextEvent }: { event: EventContent; nextEvent?: EventContent }) {
  if (event.status === "active") return null;
  return <aside className={styles.banner} aria-label="活動狀態"><div className={`ds-container ${styles.stack}`}>
    <p>{event.status === "draft" ? "活動草稿預覽" : "活動已結束，報名已關閉。"}</p>
    {event.status === "archived" && <div className={styles.actions}>
      <Button href="/events" variant="secondary">查看最新活動</Button>
      {nextEvent?.status === "active" && <Button href={eventPath(nextEvent.slug)}>{nextEvent.shortTitle}</Button>}
    </div>}
  </div></aside>;
}
