import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CURRENT_PRODUCTION_WORKER_ROUTES,
  PRODUCTION_HOSTNAME,
  PROPOSED_PRODUCTION_WORKER_ROUTE,
  SIGNUP_WORKER_SCRIPT,
  existingSignupRouteMatches,
  productionRouteOwner,
} from "../cloudflare/production-routing-policy";
import { PUBLIC_SITE_URL } from "../src/lib/deployment";
import { absoluteUrl } from "../src/lib/site";

interface WorkerRoute {
  pattern: string;
  script?: string | null;
}

function assertProtectedRouteSnapshot(routes: WorkerRoute[]) {
  const byPattern = new Map<string, WorkerRoute>();
  for (const route of routes) {
    assert(!byPattern.has(route.pattern), `duplicate Worker route pattern: ${route.pattern}`);
    byPattern.set(route.pattern, route);
  }
  for (const pattern of [
    "lilaiireland.com/language-school-signup",
    "lilaiireland.com/language-school-signup/*",
  ]) {
    assert.equal(byPattern.get(pattern)?.script, SIGNUP_WORKER_SCRIPT,
      `${pattern} must remain on ${SIGNUP_WORKER_SCRIPT}`);
  }
  const unexpectedSignupRoutes = routes.filter(route =>
    route.pattern.includes("language-school-signup") && ![
      "lilaiireland.com/language-school-signup",
      "lilaiireland.com/language-school-signup/*",
    ].includes(route.pattern));
  assert.deepEqual(unexpectedSignupRoutes, [], "unexpected signup route overlap");
  const apexCatchAll = byPattern.get(PROPOSED_PRODUCTION_WORKER_ROUTE.pattern);
  if (apexCatchAll) {
    assert.equal(apexCatchAll.script, PROPOSED_PRODUCTION_WORKER_ROUTE.script,
      "apex catch-all is owned by an unexpected Worker");
  }
  assert(!routes.some(route => route.script?.includes("staging")),
    "production route table must not reference a staging Worker");
}

function assertOwner(owner: ReturnType<typeof productionRouteOwner>, paths: string[]) {
  for (const path of paths) {
    assert.equal(productionRouteOwner(path), owner, path);
  }
}

function main() {
  assert.deepEqual(CURRENT_PRODUCTION_WORKER_ROUTES, [
    { pattern: "*.lilaiireland.com/*", script: null },
    { pattern: "lilaiireland.com/language-school-signup", script: SIGNUP_WORKER_SCRIPT },
    { pattern: "lilaiireland.com/language-school-signup/*", script: SIGNUP_WORKER_SCRIPT },
  ]);
  assert.deepEqual(PROPOSED_PRODUCTION_WORKER_ROUTE, {
    pattern: "lilaiireland.com/*",
    script: "lilai-web-platform-router",
  });
  assertProtectedRouteSnapshot([...CURRENT_PRODUCTION_WORKER_ROUTES]);
  assertProtectedRouteSnapshot([
    ...CURRENT_PRODUCTION_WORKER_ROUTES,
    PROPOSED_PRODUCTION_WORKER_ROUTE,
  ]);
  if (process.env.CHECK_ROUTE_SNAPSHOT_PATH) {
    const parsed = JSON.parse(readFileSync(process.env.CHECK_ROUTE_SNAPSHOT_PATH, "utf8"));
    const routes = Array.isArray(parsed) ? parsed : parsed.result;
    assert(Array.isArray(routes), "route snapshot must be an array or Cloudflare API response");
    assertProtectedRouteSnapshot(routes);
    console.log(`PASS protected live route snapshot: ${process.env.CHECK_ROUTE_SNAPSHOT_PATH}`);
  }
  console.log("PASS verified route snapshot and proposed route preserve both signup mappings");

  assertOwner("platform", [
    "/", "/?utm_source=smoke", "/events", "/events/", "/events?source=smoke",
    "/events/daydream-adventure-2027/", "/events/unknown", "/events/missing.png?cache=1",
    "/_next/static/chunk.js?v=1", "/assets/lilai-logo.png", "/fonts/example.woff2",
  ]);
  assertOwner("wordpress", [
    "/events-other", "/event", "/_next", "/assets", "/fonts",
    "/wp-admin/", "/wp-login.php", "/wp-json/", "/wp-content/uploads/example.jpg",
    "/wp-includes/js/example.js", "/shop/", "/cart/", "/checkout/", "/my-account/",
    "/product/example/", "/product-category/example/", "/wc-api/example", "/about/",
    "/robots.txt", "/sitemap.xml", "/sitemap_index.xml", "/unknown-route",
    "/?wc-ajax=get_refreshed_fragments", "/?wc-api=payment-callback", "/?add-to-cart=1",
    "/?rest_route=/wp/v2/posts", "/?p=123", "/?page_id=123", "/?preview=true",
    "/?s=ireland", "/events/?add-to-cart=1",
  ]);
  console.log("PASS platform allowlist boundaries and WordPress/WooCommerce fallback");

  assertOwner("signup", [
    "/language-school-signup", "/language-school-signup/",
    "/language-school-signup/step", "/language-school-signup/?utm_source=smoke",
    "/language-school-signup?utm_source=smoke",
  ]);
  assert.equal(productionRouteOwner("/language-school-signup-other"), "wordpress");
  assert(existingSignupRouteMatches("/language-school-signup"));
  assert(existingSignupRouteMatches("/language-school-signup/"));
  assert(existingSignupRouteMatches("/language-school-signup/step?x=1"));
  assert(!existingSignupRouteMatches("/language-school-signup?utm_source=smoke"));
  assert(!existingSignupRouteMatches("/language-school-signup-other"));
  console.log("PASS signup exclusions, prefix boundary, and bare-query route edge case");

  assert.equal(PRODUCTION_HOSTNAME, "lilaiireland.com");
  assert.equal(PUBLIC_SITE_URL, "https://lilaiireland.com");
  assert.equal(absoluteUrl("/events/"), "https://lilaiireland.com/events/");
  const productionContract = JSON.stringify({
    routes: [...CURRENT_PRODUCTION_WORKER_ROUTES, PROPOSED_PRODUCTION_WORKER_ROUTE],
    site: PUBLIC_SITE_URL,
  });
  assert(!productionContract.includes("workers.dev"));
  assert(!productionContract.includes("staging"));
  console.log("PASS production canonical and no staging URL exposure");

  const wrangler = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
  assert.equal(wrangler.name, "lilai-web-platform-staging");
  assert.deepEqual(wrangler.routes, []);
  assert.equal(wrangler.workers_dev, true);
  console.log("PASS production contract does not mutate isolated staging configuration");
}

main();
