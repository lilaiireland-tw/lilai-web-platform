import type { Metadata } from "next";
import { getEventPolicy, type EventPolicy } from "./event-policy";
import { eventPath } from "./event-registry";
import type { EventContent } from "./event-types";

export const EVENT_PRODUCTION_URL = "https://lilaiireland.com";
export function eventAbsoluteUrl(path: string) { return new URL(path, EVENT_PRODUCTION_URL).toString(); }

export function buildEventMetadata(event: EventContent, policy: EventPolicy = getEventPolicy()): Metadata {
  const canonical = eventAbsoluteUrl(eventPath(event.slug));
  return {
    title: { absolute: event.seo.title }, description: event.seo.description,
    alternates: { canonical },
    robots: { index: policy.production && event.status !== "draft" && event.seo.index, follow: event.status !== "draft" },
    openGraph: {
      type: "website", title: event.seo.title, description: event.seo.description,
      url: canonical, images: [{ url: eventAbsoluteUrl(event.seo.ogImage.src), width: event.seo.ogImage.width, height: event.seo.ogImage.height, alt: event.seo.ogImage.alt }],
    },
  };
}

export function buildEventsIndexMetadata(policy: EventPolicy = getEventPolicy()): Metadata {
  const title = "活動｜哩來愛爾蘭";
  const description = "哩來愛爾蘭活動與說明會，查看即將舉辦及已結束的活動。";
  const canonical = eventAbsoluteUrl("/events");
  return {
    title: { absolute: title }, description, alternates: { canonical },
    robots: { index: policy.production, follow: true },
    openGraph: { type: "website", title, description, url: canonical, images: [] },
  };
}
