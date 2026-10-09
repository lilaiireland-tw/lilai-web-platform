import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";

async function main() {
  process.env.SITE_DEPLOYMENT_ENV = "production";
  process.env.EVENT_DEPLOYMENT_ENV = "production";
  process.env.EVENTS_INCLUDE_DRAFTS = "false";
  createRequire(import.meta.url).extensions[".css"] = module => { module.exports = {}; };

  const [{ eventRegistry }, { buildEventMetadata, buildEventsIndexMetadata }, { default: sitemap }, robotsModule, { STATIC_SITEMAP_URLS }] = await Promise.all([
    import("../src/lib/events/event-registry"),
    import("../src/lib/events/event-metadata"),
    import("../src/app/sitemap"),
    import("../src/app/robots"),
    import("../src/data/urlMap")
  ]);
  const { buildEventSitemapUrls } = await import("../src/lib/events/event-sitemap");
  const { active, archived, draft, registrations } = await import("./fixtures/events");
  const { createEventRegistry } = await import("../src/lib/events/event-registry");

  const daydream = eventRegistry.resolve("daydream-adventure-2027")?.event;
  assert(daydream, "Daydream event fixture should be registered");
  assert.deepEqual(buildEventMetadata(daydream).robots, { index: false, follow: true });
  assert.equal(buildEventMetadata(daydream).alternates?.canonical, "https://lilaiireland.com/events/daydream-adventure-2027");
  assert.deepEqual(buildEventsIndexMetadata().robots, { index: true, follow: true });
  const fixtureRegistry = createEventRegistry(registrations, { production: true, includeDrafts: false });
  assert.deepEqual(buildEventSitemapUrls(fixtureRegistry.indexable()), [
    "https://lilaiireland.com/events",
    `https://lilaiireland.com/events/${active.slug}`,
    `https://lilaiireland.com/events/${archived.slug}`
  ]);
  assert(!buildEventSitemapUrls(fixtureRegistry.indexable()).some(url => url.includes(draft.slug)));
  assert(STATIC_SITEMAP_URLS.some(path => path === "/consult"), "Consult should use the slashless canonical in the existing sitemap");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("WordPress sitemap sources are intentionally isolated in this regression check"); };
  const currentSitemap = await sitemap();
  globalThis.fetch = originalFetch;
  const sitemapUrls = currentSitemap.map(item => item.url);
  assert(sitemapUrls.includes("https://lilaiireland.com/consult"));
  assert(sitemapUrls.includes("https://lilaiireland.com/events"));
  assert(!sitemapUrls.includes("https://lilaiireland.com/events/daydream-adventure-2027"));
  assert.deepEqual(robotsModule.default().sitemap, [
    "https://lilaiireland.com/sitemap_index.xml",
    "https://lilaiireland.com/sitemap.xml",
    "https://lilaiireland.com/events-sitemap.xml"
  ]);

  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const address = probe.address();
  assert(address && typeof address !== "string");
  await new Promise<void>(resolve => probe.close(() => resolve()));

  let app: ReturnType<typeof spawn> | undefined;
  let logs = "";
  try {
    app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(address.port)], {
      env: { ...process.env, SITE_DEPLOYMENT_ENV: "production", EVENT_DEPLOYMENT_ENV: "production", EVENTS_INCLUDE_DRAFTS: "false" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    app.stdout?.on("data", data => { logs += data; });
    app.stderr?.on("data", data => { logs += data; });
    const origin = `http://127.0.0.1:${address.port}`;
    const get = (path: string, redirect: RequestRedirect = "manual") => fetch(`${origin}${path}`, { redirect, signal: AbortSignal.timeout(30000) });

    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (app.exitCode !== null) throw new Error(logs);
      try { if ((await get("/events")).status === 200) { ready = true; break; } } catch { /* wait for dev server */ }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    assert(ready, logs);

    const routes = [
      ["/consult", "/consult/"],
      ["/events", "/events/"]
    ] as const;
    for (const [canonicalPath, aliasPath] of routes) {
      const canonicalResponse = await get(canonicalPath);
      assert.equal(canonicalResponse.status, 200, `${canonicalPath} canonical should return HTTP 200`);
      const html = await canonicalResponse.text();
      assert(html.includes(`href="https://lilaiireland.com${canonicalPath}"`), `${canonicalPath} canonical metadata`);

      const alias = await get(aliasPath);
      assert.equal(alias.status, 308, `${aliasPath} should redirect`);
      const location = new URL(alias.headers.get("location")!, origin);
      assert.equal(location.pathname, canonicalPath);

      const queryAlias = await get(`${aliasPath}?utm_source=seo-regression`);
      assert.equal(queryAlias.status, 308, `${aliasPath} with query should redirect`);
      const queryLocation = new URL(queryAlias.headers.get("location")!, origin);
      assert.equal(queryLocation.pathname, canonicalPath);
      assert.equal(queryLocation.search, "?utm_source=seo-regression");
    }

    const consult = await (await get("/consult")).text();
    assert.match(consult, /name="robots" content="index, follow"/);
    const events = await (await get("/events")).text();
    assert.match(events, /name="robots" content="index, follow"/);
    const robotTxt = await (await get("/robots.txt")).text();
    assert(robotTxt.includes("Sitemap: https://lilaiireland.com/sitemap_index.xml"));
    assert(robotTxt.includes("Sitemap: https://lilaiireland.com/sitemap.xml"));
    assert(robotTxt.includes("Sitemap: https://lilaiireland.com/events-sitemap.xml"));

    const eventSitemapResponse = await get("/events-sitemap.xml");
    assert.equal(eventSitemapResponse.status, 200);
    const eventSitemap = await eventSitemapResponse.text();
    assert.deepEqual([...eventSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]), buildEventSitemapUrls(eventRegistry.indexable()));
    assert(eventSitemap.includes("<loc>https://lilaiireland.com/events</loc>"));
    assert(!eventSitemap.includes("daydream-adventure-2027"), "noindex Daydream must not be submitted");
    console.log("PASS direct canonical 200s, slash/query redirects, robots directives, WordPress and Platform sitemap discovery, and indexable event sitemap coverage");
  } finally {
    if (app && app.exitCode === null) { const exited = once(app, "exit"); app.kill(); await exited; }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
