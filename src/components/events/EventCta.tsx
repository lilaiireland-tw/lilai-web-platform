import { Button } from "@/components/ui/Button";
import type { EventContent } from "@/lib/events/event-types";

export function EventCta({ event, location, label }: { event: EventContent; location: string; label: string }) {
  if (event.status !== "active") return null;
  // Analytics extension point: existing/future delegated tracking can read
  // these attributes. No vendor, listener or production submission is added.
  return <Button href={event.registrationUrl} data-event-slug={event.slug}
    data-campaign-name={event.campaignName} data-cta-location={location}>{label}</Button>;
}
