import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { active, archived, draft, registrations } from "./fixtures/events";
import { getEventPolicy } from "../src/lib/events/event-policy";

async function main() {
  // Registered custom campaigns import CSS too; install the markup-only stub before registry imports.
  createRequire(import.meta.url).extensions[".css"] = module => { module.exports = {}; };
  const { createEventRegistry } = await import("../src/lib/events/event-registry");
  const { buildEventMetadata, buildEventsIndexMetadata } = await import("../src/lib/events/event-metadata");
  const production = { production: true, includeDrafts: true };
  const preview = { production: false, includeDrafts: true };
  const registry = createEventRegistry(registrations, production);
  assert.equal(registry.resolve(active.slug)?.event, active);
  assert.equal(registry.resolve("missing"), undefined);
  assert.equal(registry.resolve(draft.slug), undefined);
  assert.deepEqual(registry.slugs(), [active.slug, archived.slug]);
  assert.equal(createEventRegistry(registrations, preview).resolve(draft.slug)?.event, draft);
  assert.equal(createEventRegistry(registrations, { ...preview, includeDrafts: false }).resolve(draft.slug), undefined);
  assert.throws(() => createEventRegistry([...registrations, registrations[0]], production));
  assert.throws(() => createEventRegistry([{ event: { ...active, slug: "../unsafe" } }], production));
  assert.deepEqual(registry.list("active"), [active]);
  assert.deepEqual(registry.list("archived"), [archived]);
  assert.deepEqual(registry.indexable(), [active, archived]);
  assert.deepEqual(createEventRegistry(registrations, preview).indexable(), []);
  assert.equal(getEventPolicy().production, process.env.EVENT_DEPLOYMENT_ENV === "production");
  const metadata = buildEventMetadata(active, production);
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.equal(metadata.alternates?.canonical, "https://lilaiireland.com/events/fixture-active");
  assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
  assert.deepEqual(metadata.title, { absolute: active.seo.title });
  assert.equal(metadata.description, active.seo.description);
  assert.deepEqual(metadata.openGraph?.images, [{ url: "https://lilaiireland.com/events/fixture-active/og.webp", width: 1200, height: 630, alt: "Fixture OG" }]);
  assert.deepEqual(buildEventMetadata({ ...active, seo: { ...active.seo, index: false } }, production).robots, { index: false, follow: true });
  assert.deepEqual(buildEventMetadata(active, preview).robots, { index: false, follow: true });
  assert.deepEqual(buildEventMetadata(draft, production).robots, { index: false, follow: false });
  assert.deepEqual(buildEventsIndexMetadata(preview).robots, { index: false, follow: true });
  console.log("PASS registry, lifecycle visibility, production/staging SEO, canonical/OG and index grouping");

  // CSS Modules are irrelevant to server markup checks. Browser QA is separate.
  createRequire(import.meta.url).extensions[".css"] = module => { module.exports = {}; };
  const { EventPage } = await import("../src/components/events/EventPage");
  const { EventsIndex } = await import("../src/components/events/EventsIndex");
  const render = (event: typeof active) => renderToStaticMarkup(createElement(EventPage, { registration: { event }, nextEvent: active }));
  const html = render(active);
  assert(html.includes(`href="${active.registrationUrl.replaceAll("&", "&amp;")}"`));
  assert(html.includes('data-cta-location="hero"') && html.includes('data-cta-location="registration"'));
  assert(html.includes('data-campaign-name="fixture-campaign"'));
  assert(html.includes("Fixture speaker") && html.includes("Fixture topic") && html.includes("<details"));
  const archiveHtml = render(archived);
  assert(archiveHtml.includes("活動已結束"));
  assert(!archiveHtml.includes(active.registrationUrl));
  assert(archiveHtml.includes('href="/events"') && archiveHtml.includes('href="/events/fixture-active"'));
  assert(!render(draft).includes(active.registrationUrl));
  const index = renderToStaticMarkup(createElement(EventsIndex, { active: registry.list("active"), archived: registry.list("archived") }));
  assert(index.includes("Active fixture") && index.includes("Archived fixture") && !index.includes("Fixture draft"));
  const custom = renderToStaticMarkup(createElement(EventPage, { registration: { event: archived, Content: () => createElement("h1", null, "Custom composition") } }));
  assert(custom.includes("Custom composition") && custom.includes("活動已結束"));
  console.log("PASS active/archived/draft markup, CTA URL/identifiers, sections, index and custom composition");

  const sourcePath = "src/content/events/index.ts";
  const originalSource = readFileSync(sourcePath);
  const originalNextEnv = readFileSync("next-env.d.ts");
  const probe = createServer();
  probe.listen(0, "127.0.0.1"); await once(probe, "listening");
  const address = probe.address(); assert(address && typeof address !== "string");
  await new Promise<void>(resolve => probe.close(() => resolve()));
  let app: ReturnType<typeof spawn> | undefined;
  let logs = "";
  try {
    // Temporary fixture registration is always restored, never committed.
    writeFileSync(sourcePath, 'export { registrations as eventRegistrations } from "../../../scripts/fixtures/events";\n');
    app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(address.port)], {
      env: { ...process.env, EVENT_DEPLOYMENT_ENV: "preview", EVENTS_INCLUDE_DRAFTS: "true" }, stdio: ["ignore", "pipe", "pipe"],
    });
    app.stdout?.on("data", data => { logs += data; }); app.stderr?.on("data", data => { logs += data; });
    const get = (path: string) => fetch(`http://127.0.0.1:${address.port}${path}`, { headers: { "User-Agent": "Googlebot" }, signal: AbortSignal.timeout(30000) });
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (app.exitCode !== null) throw new Error(logs);
      try { const result = await get("/events"); if (result.status === 200) { ready = true; break; } } catch { /* startup */ }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    assert(ready, logs);
    for (const event of [active, archived, draft]) {
      const response = await get(`/events/${event.slug}`); assert.equal(response.status, 200);
      const body = await response.text();
      assert(body.includes(event.title));
      assert(body.includes('content="noindex'));
      assert(body.includes(`href="https://lilaiireland.com/events/${event.slug}"`));
      assert.equal((body.match(/<header\b/g) || []).length, 1);
      assert.equal((body.match(/<footer\b/g) || []).length, 1);
      assert.equal((body.match(/<main\b/g) || []).length, 1);
    }
    assert.equal((await get("/events/fixture-missing")).status, 404);
    const indexResponse = await get("/events"); const indexHtml = await indexResponse.text();
    assert(indexHtml.includes("Active fixture") && indexHtml.includes("Archived fixture"));
    assert(!indexHtml.includes('href="/events/fixture-draft"'));
    console.log("PASS local HTTP routes: active/archived/draft, invalid slug 404, noindex, canonical, shared shell and index");
  } finally {
    if (app && app.exitCode === null) { const exited = once(app, "exit"); app.kill(); await exited; }
    writeFileSync(sourcePath, originalSource); writeFileSync("next-env.d.ts", originalNextEnv);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
