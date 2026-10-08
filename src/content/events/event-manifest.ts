import type { EventContent } from "../../lib/events/event-types";
import { daydreamEvent } from "./daydream-adventure-2027";

// Content-only source of truth for event routes. Runtime render registrations
// add components separately so edge route policy does not import React/CSS.
export const eventManifest: readonly EventContent[] = [daydreamEvent];
