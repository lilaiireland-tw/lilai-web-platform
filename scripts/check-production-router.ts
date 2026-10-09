import assert from "node:assert/strict";
import { routeProductionRequest } from "../cloudflare/production-router";

const base = "https://lilaiireland.com";

async function main() {
  const platformPaths = [
    "/",
    "/consult",
    "/consult/",
    "/consult?utm_source=google",
    "/consult/?gclid=test-click-id",
    "/events",
    "/events/",
    "/events/summer-concert",
    "/events-sitemap.xml",
    "/_next/static/test.js",
    "/assets/logo.svg",
    "/fonts/site.woff2",
  ];

  for (const path of platformPaths) {
    const request = new Request(new URL(path, base));
    let routedRequest: Request | undefined;
    let originCalled = false;
    const response = await routeProductionRequest(request, {
      platform: {
        async fetch(platformRequest) {
          routedRequest = platformRequest;
          return new Response("platform", { status: 202 });
        },
      },
      async originFetch() {
        originCalled = true;
        return new Response("origin");
      },
    });

    assert.equal(routedRequest, request, `${path} must pass the original request to the platform`);
    assert.equal(originCalled, false, `${path} must not reach the origin`);
    assert.equal(response.status, 202, `${path} platform response must be returned`);
  }

  const originPaths = [
    "/about/",
    "/robots.txt",
    "/sitemap_index.xml",
    "/sitemap.xml",
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
      headers: [
        ["Location", "/preserved-redirect/"],
        ["Set-Cookie", "session=unchanged; Path=/"],
        ["Set-Cookie", "preference=dark; Path=/; SameSite=Lax"],
      ],
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
    assert.equal(response.status, 302, "redirect status must remain unchanged");
    assert.equal(response.headers.get("location"), "/preserved-redirect/");
    assert.deepEqual(response.headers.getSetCookie(), [
      "session=unchanged; Path=/",
      "preference=dark; Path=/; SameSite=Lax",
    ], "all Set-Cookie headers must remain separate and unchanged");
  }

  const wordpressSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://lilaiireland.com/about/</loc></url></urlset>`;
  const wordpressSitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://lilaiireland.com/page-sitemap.xml</loc></sitemap></sitemapindex>`;
  const platformEventSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://lilaiireland.com/events</loc></url></urlset>`;
  const assertXmlResponse = async (response: Response, root: "urlset" | "sitemapindex", expectedBody: string, path: string) => {
    assert.equal(response.status, 200, `${path} must return a successful sitemap response`);
    assert.match(response.headers.get("content-type") ?? "", /(?:application|text)\/xml/i, `${path} must have an XML content type`);
    const body = await response.text();
    assert.equal(body, expectedBody, `${path} must return the selected owner's response unchanged`);
    assert.match(body, new RegExp(`^<\\?xml version="1\\.0" encoding="UTF-8"\\?>\\s*<${root}\\b`), `${path} must have an XML declaration and ${root} root`);
    assert.match(body, new RegExp(`</${root}>\\s*$`), `${path} must close its ${root} root`);
    assert.equal((body.match(/<loc>/g) ?? []).length, (body.match(/<\/loc>/g) ?? []).length, `${path} must have balanced location elements`);
  };

  for (const [path, body, root] of [
    ["/sitemap_index.xml", wordpressSitemapIndexXml, "sitemapindex"],
    ["/sitemap.xml", wordpressSitemapXml, "urlset"],
  ] as const) {
    let originCalled = false;
    let platformCalled = false;
    const response = await routeProductionRequest(new Request(new URL(path, base)), {
      platform: { async fetch() { platformCalled = true; return new Response("wrong owner"); } },
      async originFetch() {
        originCalled = true;
        return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
      },
    });
    assert(originCalled, `${path} must be owned by WordPress`);
    assert(!platformCalled, `${path} must not reach the Platform`);
    await assertXmlResponse(response, root, body, path);
  }

  {
    let platformCalled = false;
    let originCalled = false;
    const path = "/events-sitemap.xml";
    const response = await routeProductionRequest(new Request(new URL(path, base)), {
      platform: {
        async fetch() {
          platformCalled = true;
          return new Response(platformEventSitemapXml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
        },
      },
      async originFetch() { originCalled = true; return new Response("wrong owner"); },
    });
    assert(platformCalled, `${path} must be owned by the Platform`);
    assert(!originCalled, `${path} must not reach WordPress`);
    await assertXmlResponse(response, "urlset", platformEventSitemapXml, path);
  }

  for (const status of [404, 503]) {
    const expected = new Response(`wordpress-${status}`, { status });
    const actual = await routeProductionRequest(new Request(new URL("/missing/", base)), {
      platform: { async fetch() { throw new Error("WordPress request reached platform"); } },
      async originFetch() { return expected; },
    });
    assert.equal(actual, expected, `WordPress ${status} response must be returned unchanged`);
    assert.equal(actual.status, status);
    assert.equal(await actual.text(), `wordpress-${status}`);
  }

  const headRequest = new Request(new URL("/events/", base), { method: "HEAD" });
  let headPlatformRequest: Request | undefined;
  const headResponse = await routeProductionRequest(headRequest, {
    platform: { async fetch(request) {
      headPlatformRequest = request;
      return new Response(null, { status: 200, headers: { "Content-Length": "123" } });
    } },
    async originFetch() { throw new Error("HEAD event request reached origin"); },
  });
  assert.equal(headPlatformRequest?.method, "HEAD", "HEAD must retain its method at the platform");
  assert.equal(headResponse.status, 200);
  assert.equal(headResponse.body, null, "HEAD response must not expose a response body");
  assert.equal(headResponse.headers.get("content-length"), "123");

  let streamPulls = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      streamPulls += 1;
      if (streamPulls === 1) controller.enqueue(new TextEncoder().encode("first-"));
      else if (streamPulls === 2) controller.enqueue(new TextEncoder().encode("second"));
      else controller.close();
    },
  });
  const streamingResponse = new Response(stream, { status: 206 });
  await Promise.resolve();
  const pullsBeforeRouting = streamPulls;
  const streamed = await routeProductionRequest(new Request(new URL("/about/", base)), {
    platform: { async fetch() { throw new Error("origin request reached platform"); } },
    async originFetch() { return streamingResponse; },
  });
  assert.equal(streamed.body, stream, "router must return the original stream without buffering or wrapping");
  assert.equal(streamPulls, pullsBeforeRouting, "router must not consume the stream before returning it");
  assert.equal(await streamed.text(), "first-second");

  const bindingFailure = new Error("mock Service Binding unavailable");
  let bindingCalls = 0;
  await assert.rejects(
    routeProductionRequest(new Request(new URL("/", base)), {
      platform: { async fetch() { bindingCalls += 1; throw bindingFailure; } },
      async originFetch() { throw new Error("binding failure must not fall through to origin"); },
    }),
    error => error === bindingFailure,
    "Service Binding errors propagate to the platform caller",
  );
  assert.equal(bindingCalls, 1, "a failed Service Binding request must not be retried");

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

  let postBindingCalls = 0;
  const failedPost = new Request(new URL("/events/", base), {
    method: "POST",
    body: "fixture",
  });
  await assert.rejects(routeProductionRequest(failedPost, {
    platform: { async fetch() { postBindingCalls += 1; throw new Error("mock POST binding failure"); } },
    async originFetch() { throw new Error("failed platform POST must not replay to origin"); },
  }), /mock POST binding failure/);
  assert.equal(postBindingCalls, 1, "failed POST must not be retried or replayed");

  console.log("PASS homepage, consultation, event, and audited static requests dispatch to Platform");
  console.log("PASS origin 404/503, redirects, Location, multiple Set-Cookie, and response bodies are preserved");
  console.log("PASS HEAD method and bodyless response behavior are preserved");
  console.log("PASS streaming response is returned unbuffered and readable");
  console.log("PASS Service Binding failures propagate and failed requests are never retried");
  console.log("PASS WordPress method, body, and cookie stay on the original request");
}

void main();
