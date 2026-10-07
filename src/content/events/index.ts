import type { EventRegistration } from "@/lib/events/event-types";

// Add only approved campaign source and extracted assets. The first migration
// is blocked; see docs/events.md. No placeholder campaigns are published.
export const eventRegistrations: readonly EventRegistration[] = [];
