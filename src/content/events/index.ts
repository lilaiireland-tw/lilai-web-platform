import type { EventRegistration } from "@/lib/events/event-types";
import { DaydreamCampaign } from "@/components/events/daydream/DaydreamCampaign";
import { BlackFridayCampaign } from "@/components/events/black-friday/BlackFridayCampaign";
import { eventManifest } from "./event-manifest";

export const eventRegistrations: readonly EventRegistration[] = eventManifest.map(event => ({
  event,
  Content: event.slug === "daydream-adventure-2027" ? DaydreamCampaign : event.slug === "black-friday-2026" ? BlackFridayCampaign : undefined,
}));
