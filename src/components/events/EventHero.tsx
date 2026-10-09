import Image from "next/image";
import type { EventContent } from "@/lib/events/event-types";
import { EventCta } from "./EventCta";
import styles from "./events.module.css";

export function EventHero({ event }: { event: EventContent }) {
  return <section className="ds-section"><div className={`ds-container ${event.heroImage ? styles.hero : styles.stack}`}>
    <div className={styles.stack}><h1 className="ds-heading-1">{event.title}</h1>
      <p className="ds-body-large">{event.description}</p>
      <EventCta event={event} location="hero" label={event.registrationLabel} />
    </div>
    {event.heroImage && <Image {...event.heroImage} className={styles.image} sizes="(max-width: 760px) calc(100vw - 28px), (max-width: 1200px) 50vw, 556px" priority />}
  </div></section>;
}
