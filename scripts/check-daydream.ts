import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readdirSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { daydreamEvent } from "../src/content/events/daydream-adventure-2027";
import { daydreamCopy } from "../src/content/events/daydream-copy";

async function main() {
  createRequire(import.meta.url).extensions[".css"] = module => { module.exports = {}; };
  const { eventRegistry } = await import("../src/lib/events/event-registry");
  const { buildEventMetadata } = await import("../src/lib/events/event-metadata");
  const { EventPage } = await import("../src/components/events/EventPage");
  const registration = eventRegistry.resolve(daydreamEvent.slug);
  assert(registration?.Content);
  assert.equal(daydreamEvent.startAt, "2026-10-18T20:00:00+08:00");
  assert.equal(daydreamEvent.registrationUrl, "https://forms.gle/isPDKepgK9BsPpg86");
  assert.equal(eventRegistry.list("active").includes(daydreamEvent), true);
  const metadata = buildEventMetadata(daydreamEvent, { production: true, includeDrafts: false });
  assert.equal(metadata.alternates?.canonical, "https://lilaiireland.com/events/daydream-adventure-2027/");
  assert.deepEqual(metadata.robots, { index: false, follow: true });
  assert(metadata.openGraph?.images);

  const html = renderToStaticMarkup(createElement(EventPage, { registration }));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const ids = ["hero", "hook", "questions", "agenda", "frames", "speakers", "event", "faq", "register", "closing"];
  let previous = -1;
  for (const id of ids) {
    const position = html.indexOf(`id="${id}"`);
    assert(position > previous, `${id} must preserve approved section order`);
    previous = position;
  }
  assert.equal((html.match(/<details\b/g) || []).length, 9);
  for (const name of ["Alex", "Bella", "Arsha"]) assert(html.includes(`<h3 class="ds-heading-3">${name}</h3>`));
  assert(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert(html.includes(`href="${daydreamEvent.registrationUrl}"`));
  assert(!html.includes("data:image") && !html.includes("__bundler"));
  // Every approved textual field must survive custom composition, including all FAQ answers and agenda tags.
  const checkCopy = (value: unknown, key = "") => {
    if (typeof value === "string" && key !== "src" && key !== "alt") {
      const escaped = renderToStaticMarkup(createElement("span", null, value)).slice(6, -7);
      assert(html.includes(escaped), `Missing approved copy: ${value}`);
    } else if (Array.isArray(value)) value.forEach(item => checkCopy(item));
    else if (value && typeof value === "object") Object.entries(value).forEach(([name, item]) => checkCopy(item, name));
  };
  checkCopy(daydreamCopy);
  const images = [daydreamEvent.heroImage!, ...daydreamCopy.hook.photos, ...daydreamCopy.frames.photos, ...daydreamCopy.speakers.people.map(person => person.image)];
  for (const image of images) {
    assert(existsSync(`public${image.src}`));
    assert(image.width > 0 && image.height > 0 && image.alt.length > 0);
    assert(html.includes(`alt="${image.alt}"`));
    assert(html.includes(`width="${image.width}" height="${image.height}"`));
  }
  assert.equal((html.match(/loading="lazy"/g) || []).length, 11);
  assert.equal((html.match(/<img\b[^>]*fetchPriority="high"/g) || []).length, 1);
  assert.equal(readdirSync("public/events/daydream-adventure-2027").length, 12);
  const archived = renderToStaticMarkup(createElement(EventPage, { registration: { ...registration, event: { ...daydreamEvent, status: "archived" } } }));
  assert(archived.includes("活動已結束"));
  assert(!archived.includes(daydreamEvent.registrationUrl) && !archived.includes("qr-register.png"));
  assert(archived.includes('href="/events/"'));
  console.log("PASS real campaign registry, source dates/CTA, canonical/noindex/OG, ten-section order, speakers, FAQ, image dimensions/loading and archived registration removal");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
