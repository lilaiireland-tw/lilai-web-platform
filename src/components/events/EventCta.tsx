import { Button } from "@/components/ui/Button";
import type { EventContent } from "@/lib/events/event-types";

export function EventCta({ event, location, label, target }: { event: EventContent; location: string; label: string; target?: "_blank" }) {
  if (event.status !== "active") return null;
  // Analytics extension point: existing/future delegated tracking can read
  // these attributes. No vendor, listener or production submission is added.
  return <Button href={event.registrationUrl} target={target} rel={target ? "noopener noreferrer" : undefined} data-event-slug={event.slug}
    data-campaign-name={event.campaignName} data-cta-location={location}>{label}</Button>;
}
