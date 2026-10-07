import Link from "next/link";
import type { EventContent } from "@/lib/events/event-types";
import { eventPath } from "@/lib/events/event-registry";
import styles from "./events.module.css";

export function EventsIndex({ active, archived }: { active: readonly EventContent[]; archived: readonly EventContent[] }) {
  return <main className={`ds-body ${styles.page}`}>
    <section className="ds-section"><div className="ds-container"><h1 className="ds-heading-1">活動與說明會</h1></div></section>
    {([{ title: "進行中／即將舉辦", events: active, empty: "目前沒有公開活動。" },
      { title: "已結束", events: archived, empty: "目前沒有已結束的活動。" }]).map((group, i) =>
      <section key={group.title} className="ds-section ds-section--soft" aria-labelledby={`event-group-${i}`}>
        <div className={`ds-container ${styles.stack}`}><h2 id={`event-group-${i}`} className="ds-heading-2">{group.title}</h2>
          {group.events.length ? <div className={styles.grid}>{group.events.map(event =>
            <article key={event.slug} className={`ds-card ds-card--bordered ${styles.stack}`}>
              <h3 className="ds-heading-3"><Link href={eventPath(event.slug)}>{event.shortTitle}</Link></h3>
              <p>{event.description}</p><time dateTime={event.startAt}>{event.dateLabel}</time>
            </article>)}</div> : <p>{group.empty}</p>}
        </div>
      </section>)}
  </main>;
}
