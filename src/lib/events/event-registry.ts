import { eventRegistrations } from "@/content/events";
import { getEventPolicy, type EventPolicy } from "./event-policy";
import type { EventRegistration } from "./event-types";

export function createEventRegistry(entries: readonly EventRegistration[], policy: EventPolicy) {
  const bySlug = new Map<string, EventRegistration>();
  for (const entry of entries) {
    const { event } = entry;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.slug) || bySlug.has(event.slug)) {
      throw new Error(`Invalid or duplicate event slug: ${event.slug}`);
    }
    bySlug.set(event.slug, entry);
  }
  const visible = (entry: EventRegistration) => entry.event.status !== "draft" || (!policy.production && policy.includeDrafts);
  const resolve = (slug: string) => {
    const entry = bySlug.get(slug);
    return entry && visible(entry) ? entry : undefined;
  };
  const list = (status: "active" | "archived") => entries
    .filter(entry => entry.event.status === status)
    .map(entry => entry.event)
    .sort((a, b) => status === "active" ? Date.parse(a.startAt) - Date.parse(b.startAt) : Date.parse(b.startAt) - Date.parse(a.startAt));
  return {
    resolve, list,
    slugs: () => entries.filter(visible).map(({ event }) => event.slug),
    indexable: () => policy.production ? entries.filter(({ event }) => event.status !== "draft" && event.seo.index).map(({ event }) => event) : [],
  };
}

export const eventRegistry = createEventRegistry(eventRegistrations, getEventPolicy());
export function eventPath(slug: string) { return `/events/${slug}/`; }
