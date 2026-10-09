import type { EventContent } from "@/lib/events/event-types";
import { CampaignButton } from "./DaydreamPrimitives";

/** Campaign buttons lead to the registration section before the external form. */
export function DaydreamRegistrationCta({ event, location, label }: {
  event: EventContent; location: string; label: string;
}) {
  return <CampaignButton event={event} location={location} label={label} small={location === "mobile-sticky"} />;
}
