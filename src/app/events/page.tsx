import { EventsIndex } from "@/components/events/EventsIndex";
import { eventRegistry } from "@/lib/events/event-registry";
import { buildEventsIndexMetadata } from "@/lib/events/event-metadata";

export const dynamic = "force-static";
export const metadata = buildEventsIndexMetadata();
export default function EventsPage() {
  return <EventsIndex active={eventRegistry.list("active")} archived={eventRegistry.list("archived")} />;
}
