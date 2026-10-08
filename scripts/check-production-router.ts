import assert from "node:assert/strict";
import { routeProductionRequest } from "../cloudflare/production-router";

const base = "https://lilaiireland.com";

async function main() {
  const platformPaths = [
    "/consult",
    "/consult/",
    "/consult?utm_source=google",
    "/consult/?gclid=test-click-id",
  ];

  for (const path of platformPaths) {
    const request = new Request(new URL(path, base));
    let routedRequest: Request | undefined;
    const originResponse = new Response("origin");
    const response = await routeProductionRequest(request, {
      platform: {
        async fetch(platformRequest) {
          routedRequest = platformRequest;
          return new Response("platform", { status: 202 });
        },
      },
      async originFetch() {
        return originResponse;
      },
    });

    assert.equal(routedRequest, request, `${path} must pass the original request to the platform`);
    assert.equal(response.status, 202, `${path} platform response must be returned`);
  }

  const originPaths = [
    "/about/",
    "/wp-json/wp/v2/posts",
    "/?rest_route=/wp/v2/posts",
    "/?wc-api=payment-callback",
    "/?add-to-cart=123",
    "/consult?wc-ajax=checkout",
    "/consult/?rest_route=/wp/v2/posts",
    "/consult/child",
    "/language-school-signup?utm_source=google",
    "/language-school-signup-other",
  ];

  for (const path of originPaths) {
    const request = new Request(new URL(path, base));
    let originRequest: Request | undefined;
    let platformCalled = false;
    const originResponse = new Response("wordpress", {
      status: 302,
      headers: { Location: "/preserved-redirect/", "Set-Cookie": "session=unchanged; Path=/" },
    });
    const response = await routeProductionRequest(request, {
      platform: {
        async fetch() {
          platformCalled = true;
          return new Response("platform");
        },
      },
      async originFetch(originRequestValue) {
        originRequest = originRequestValue;
        return originResponse;
      },
    });

    assert.equal(platformCalled, false, `${path} must not reach the platform`);
    assert.equal(originRequest, request, `${path} must pass the original request to WordPress`);
    assert.equal(response, originResponse, `${path} must return the origin response unchanged`);
    assert.equal(response.headers.get("location"), "/preserved-redirect/");
    assert.equal(response.headers.get("set-cookie"), "session=unchanged; Path=/");
  }

  const writeRequest = new Request(new URL("/wp-json/wp/v2/posts", base), {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "wordpress_logged_in=fixture" },
    body: JSON.stringify({ title: "read-only test fixture" }),
  });
  let originWrite: Request | undefined;
  await routeProductionRequest(writeRequest, {
    platform: { async fetch() { throw new Error("WordPress write reached platform"); } },
    async originFetch(request) {
      originWrite = request;
      return new Response(null, { status: 204 });
    },
  });
  assert.equal(originWrite, writeRequest, "WordPress writes must be forwarded once as the original request");
  assert.equal(await originWrite?.text(), JSON.stringify({ title: "read-only test fixture" }));

  console.log("PASS production router dispatches consult variants to the platform");
  console.log("PASS WordPress query endpoints, signup edge cases, and unknown paths pass through unchanged");
  console.log("PASS WordPress method, body, and cookie stay on the original request");
}

void main();
