import { eventManifest } from "../src/content/events/event-manifest";

const frontendExactPaths = new Set(["/", "/consult", "/robots.txt", "/sitemap.xml"]);
const eventPaths = new Set(eventManifest.map(event => `/events/${event.slug}`));
const staticAssetPrefixes = ["/_next/", "/assets/", "/fonts/", "/events/"] as const;

export function isStandaloneFrontendPath(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return frontendExactPaths.has(normalized) || normalized === "/events" || eventPaths.has(normalized);
}

export function isStandaloneStaticAssetPath(pathname: string) {
  return staticAssetPrefixes.some(prefix => pathname.startsWith(prefix));
}

export function stagingUnavailableResponse(method: string) {
  return new Response(method === "HEAD" ? null : "WordPress and WooCommerce routes are unavailable in standalone staging.\n", {
    status: 503,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Lilai-Staging-Limitation": "wordpress-woocommerce-unavailable",
    },
  });
}
