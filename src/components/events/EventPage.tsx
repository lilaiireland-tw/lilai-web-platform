import type { EventContent, EventRegistration, EventSection } from "@/lib/events/event-types";
import { EventHero } from "./EventHero";
import { EventInfo } from "./EventInfo";
import { SpeakerCard } from "./SpeakerCard";
import { EventAgenda } from "./EventAgenda";
import { EventFaq } from "./EventFaq";
import { EventCta } from "./EventCta";
import { EventStatusBanner } from "./EventStatusBanner";
import styles from "./events.module.css";

function SectionBody({ event, section }: { event: EventContent; section: EventSection }) {
  switch (section.type) {
    case "info": return <EventInfo event={event} />;
    case "speakers": return <div className={styles.grid}>{section.speakers.map(speaker => <SpeakerCard key={speaker.name} speaker={speaker} />)}</div>;
    case "agenda": return <EventAgenda items={section.items} />;
    case "faq": return <EventFaq items={section.items} />;
    case "cta": return <>{section.description && <p>{section.description}</p>}<EventCta event={event} location={section.id} label={section.label} /></>;
  }
}

export function EventPage({ registration, nextEvent }: { registration: EventRegistration; nextEvent?: EventContent }) {
  const { event, Content } = registration;
  return <main className={`ds-body ${styles.page}`} data-event-slug={event.slug}>
    <EventStatusBanner event={event} nextEvent={nextEvent} />
    {Content ? <Content event={event} /> : <><EventHero event={event} />
      {event.sections.filter(section => section.type !== "cta" || event.status === "active").map(section =>
        <section key={section.id} className="ds-section ds-section--soft" aria-labelledby={`${section.id}-title`}>
          <div className={`ds-container ds-container--narrow ${styles.stack}`}>
            <h2 id={`${section.id}-title`} className="ds-heading-2">{section.title}</h2>
            <SectionBody event={event} section={section} />
          </div>
        </section>)}
    </>}
  </main>;
}
