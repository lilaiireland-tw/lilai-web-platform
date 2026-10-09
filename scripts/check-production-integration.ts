import assert from "node:assert/strict";
import { routeProductionRequest } from "../cloudflare/production-router";
import { existingSignupRouteMatches, productionRouteOwner } from "../cloudflare/production-routing-policy";

const origin = "https://lilaiireland.com";
const fixtures = new Map<string, { type: string; body: string }>([
  ["/", { type: "text/html", body: '<main>home</main><script src="/_next/static/chunks/home.js"></script><link href="/_next/static/css/site.css" rel="stylesheet"><img src="/assets/logo.svg"><img src="/events/fixture.webp"><style>@font-face{src:url(/fonts/site.woff2)}</style>' }],
  ["/events", { type: "text/html", body: '<main>events</main><script src="/_next/static/chunks/events.js"></script><img src="/events/fixture.webp">' }],
  ["/events/", { type: "text/html", body: '<main>events</main><script src="/_next/static/chunks/events.js"></script><img src="/events/fixture.webp">' }],
  ["/_next/static/chunks/home.js", { type: "text/javascript", body: "window.fixture='js'" }],
  ["/_next/static/css/site.css", { type: "text/css", body: "body{color:#123}" }],
  ["/assets/logo.svg", { type: "image/svg+xml", body: "<svg/>" }],
  ["/events/fixture.webp", { type: "image/webp", body: "fixture-image" }],
  ["/fonts/site.woff2", { type: "font/woff2", body: "fixture-font" }],
]);

async function main() {
  let platformCalls = 0;
  let originCalls = 0;
  const platform = {
    async fetch(request: Request) {
      platformCalls += 1;
      const url = new URL(request.url);
      const fixture = fixtures.get(url.pathname);
      if (!fixture) return new Response("platform 404", { status: 404 });
      return new Response(fixture.body, { headers: { "Content-Type": fixture.type } });
    },
  };
  const originFetch = async (request: Request) => {
    originCalls += 1;
    assert.equal(request.url, new URL(request.url).toString());
    return new Response("wordpress fixture", { status: 418, headers: { "x-origin-fixture": "preserved" } });
  };

  for (const path of ["/", "/events", "/events/", "/events/daydream-adventure-2027"]) {
    assert.equal(productionRouteOwner(path), "platform", `${path} policy owner`);
    const response = await routeProductionRequest(new Request(new URL(path, origin)), { platform, originFetch });
    assert.equal(response.status, path.includes("daydream") ? 404 : 200, `${path} platform fixture status`);
  }

  for (const assetPath of [
    "/_next/static/chunks/home.js", "/_next/static/css/site.css", "/assets/logo.svg",
    "/events/fixture.webp", "/fonts/site.woff2",
  ]) {
    assert.equal(productionRouteOwner(assetPath), "platform", `${assetPath} policy owner`);
    const response = await routeProductionRequest(new Request(new URL(assetPath, origin)), { platform, originFetch });
    assert.equal(response.status, 200, `${assetPath} loads`);
    assert((await response.text()).length > 0, `${assetPath} has fixture bytes`);
  }

  const homepage = await routeProductionRequest(new Request(new URL("/", origin)), { platform, originFetch });
  const html = await homepage.text();
  const dependencies = [...html.matchAll(/(?:src|href)="([^"]+)"|url\(([^)]+)\)/g)]
    .map(match => (match[1] ?? match[2]).replace(/^['"]|['"]$/g, ""));
  for (const assetPath of dependencies) {
    assert.equal(productionRouteOwner(assetPath), "platform", `homepage dependency ${assetPath}`);
    const dependency = await routeProductionRequest(new Request(new URL(assetPath, origin)), { platform, originFetch });
    assert.equal(dependency.status, 200, `homepage dependency ${assetPath} loads`);
  }

  const wordpressResponse = await routeProductionRequest(new Request(new URL("/about/", origin)), { platform, originFetch });
  assert.equal(wordpressResponse.status, 418);
  assert.equal(wordpressResponse.headers.get("x-origin-fixture"), "preserved");
  for (const path of ["/events-other", "/unknown-route"]) {
    assert.equal(productionRouteOwner(path), "wordpress", `${path} fallback owner`);
    const response = await routeProductionRequest(new Request(new URL(path, origin)), { platform, originFetch });
    assert.equal(response.status, 418, `${path} origin result preserved`);
  }

  const missingEvent = await routeProductionRequest(new Request(new URL("/events/no-such-event", origin)), {
    platform: { async fetch() { return new Response("not found", { status: 404 }); } }, originFetch,
  });
  assert.equal(missingEvent.status, 404, "unknown event must retain Platform 404");
  const missingAsset = await routeProductionRequest(new Request(new URL("/events/missing-image.png", origin)), {
    platform: { async fetch() { return new Response("not found", { status: 404 }); } }, originFetch,
  });
  assert.equal(missingAsset.status, 404, "missing event asset must retain Platform 404");

  const platformFailure = new Error("platform runtime unavailable");
  await assert.rejects(routeProductionRequest(new Request(new URL("/", origin)), {
    platform: { async fetch() { throw platformFailure; } }, originFetch,
  }), error => error === platformFailure, "platform failure must surface to caller");
  const originFailure = new Error("origin runtime unavailable");
  await assert.rejects(routeProductionRequest(new Request(new URL("/about/", origin)), {
    platform, async originFetch() { throw originFailure; },
  }), error => error === originFailure, "origin failure must surface to caller");

  assert.equal(platformCalls, 15, "platform receives only the intended requests once each");
  assert.equal(originCalls, 3, "WordPress fallback receives each request once; no loop or retry");

  // Rollback means removing only the broad Router Route. Before that route is
  // added, ordinary URLs go back to WordPress and exact signup routes stay owned.
  for (const path of ["/", "/events", "/events/"]) {
    const response = await originFetch(new Request(new URL(path, origin)));
    assert.equal(response.headers.get("x-origin-fixture"), "preserved", `rollback ${path}`);
  }
  assert(existingSignupRouteMatches(new URL("/language-school-signup", origin)));
  assert(existingSignupRouteMatches(new URL("/language-school-signup/step", origin)));
  assert(!existingSignupRouteMatches(new URL("/language-school-signup?utm_source=x", origin)));

  console.log("PASS isolated Router/Platform harness: homepage, events, JS, CSS, image, font routing and bytes");
  console.log("PASS WordPress fallback, unknown paths, Platform 404, failures, and one-call/no-loop behavior");
  console.log("PASS route-removal rollback model returns root/events to origin and preserves signup route contract");
}

void main();
