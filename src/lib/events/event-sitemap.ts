import { eventAbsoluteUrl } from "./event-metadata";
import type { EventContent } from "./event-types";

export function buildEventSitemapUrls(events: readonly EventContent[]) {
  return ["/events", ...events.map(event => `/events/${event.slug}`)].map(eventAbsoluteUrl);
}

export function buildEventSitemapXml(events: readonly EventContent[]) {
  const entries = buildEventSitemapUrls(events).map(url => `  <url><loc>${url}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}
