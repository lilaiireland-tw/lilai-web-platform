import type { EventRegistration } from "@/lib/events/event-types";
import { daydreamEvent } from "./daydream-adventure-2027";
import { DaydreamCampaign } from "@/components/events/daydream/DaydreamCampaign";

export const eventRegistrations: readonly EventRegistration[] = [
  { event: daydreamEvent, Content: DaydreamCampaign },
];
