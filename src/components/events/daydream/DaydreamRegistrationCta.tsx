import { Button } from "@/components/ui/Button";
import type { EventContent } from "@/lib/events/event-types";

/** The campaign's first step is its registration section, before the external form. */
export function DaydreamRegistrationCta({ event, location, label }: {
  event: EventContent; location: string; label: string;
}) {
  if (event.status !== "active") return null;
  return <Button href="#register" data-event-slug={event.slug}
    data-campaign-name={event.campaignName} data-cta-location={location}>{label}</Button>;
}
