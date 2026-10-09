export const PRODUCTION_HOSTNAME = "lilaiireland.com";
export const PRODUCTION_ROUTER_SCRIPT = "lilai-web-platform-router";
export const SIGNUP_WORKER_SCRIPT = "site-creator-vinext-starter";

export const CURRENT_PRODUCTION_WORKER_ROUTES = [
  { pattern: "*.lilaiireland.com/*", script: null },
  { pattern: "lilaiireland.com/language-school-signup", script: SIGNUP_WORKER_SCRIPT },
  { pattern: "lilaiireland.com/language-school-signup/*", script: SIGNUP_WORKER_SCRIPT },
] as const;

export const PROPOSED_PRODUCTION_WORKER_ROUTE = {
  pattern: "lilaiireland.com/*",
  script: PRODUCTION_ROUTER_SCRIPT,
} as const;

export type ProductionRouteOwner = "platform" | "signup" | "wordpress";

const platformAssetPrefixes = ["/_next/", "/assets/", "/fonts/"] as const;
const wordpressQueryKeys = new Set([
  "add-to-cart",
  "attachment_id",
  "feed",
  "page_id",
  "p",
  "preview",
  "rest_route",
  "s",
  "wc-ajax",
  "wc-api",
]);

export function isSignupPath(pathname: string) {
  return pathname === "/language-school-signup" ||
    pathname.startsWith("/language-school-signup/");
}

export function hasWordPressQueryEndpoint(url: URL) {
  return [...url.searchParams.keys()].some(key => wordpressQueryKeys.has(key.toLowerCase()));
}

export function productionRouteOwner(input: string | URL): ProductionRouteOwner {
  const url = input instanceof URL ? input : new URL(input, `https://${PRODUCTION_HOSTNAME}`);

  if (url.hostname !== PRODUCTION_HOSTNAME) return "wordpress";
  if (isSignupPath(url.pathname)) return "signup";
  if (hasWordPressQueryEndpoint(url)) return "wordpress";
  if (
    url.pathname === "/" ||
    url.pathname === "/consult" ||
    url.pathname === "/consult/" ||
    url.pathname === "/events" ||
    url.pathname.startsWith("/events/")
  ) {
    return "platform";
  }
  if (platformAssetPrefixes.some(prefix => url.pathname.startsWith(prefix))) return "platform";
  return "wordpress";
}

// Cloudflare route patterns include the query string. The existing exact signup
// route therefore does not match a bare signup URL with a query. A future broad
// router must guard that request and preserve the current WordPress slash redirect;
// it must never send the request to the platform service.
export function existingSignupRouteMatches(input: string | URL) {
  const url = input instanceof URL ? input : new URL(input, `https://${PRODUCTION_HOSTNAME}`);
  if (url.hostname !== PRODUCTION_HOSTNAME) return false;
  if (url.pathname === "/language-school-signup" && !url.search) return true;
  return url.pathname.startsWith("/language-school-signup/");
}
