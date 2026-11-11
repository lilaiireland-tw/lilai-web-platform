import type { EventContent } from "@/lib/events/event-types";
import styles from "./black-friday.module.css";

export function BlackFridayCta({ event, location, label, inverse = false }: {
  event: EventContent; location: string; label: string; inverse?: boolean;
}) {
  if (event.status !== "active") return null;
  return <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"
    data-event-slug={event.slug} data-campaign-name={event.campaignName} data-cta-location={location}
    className={`${styles.button} ${inverse ? styles.buttonInverse : ""}`}>{label}</a>;
}
