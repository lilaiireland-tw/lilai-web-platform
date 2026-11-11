import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { blackFridayEvent } from "../src/content/events/black-friday-2026";
import { blackFridayFaq, blackFridayTerms } from "../src/content/events/black-friday-copy";

async function main() {
  createRequire(import.meta.url).extensions[".css"] = module => { module.exports = {}; };
  const { createEventRegistry } = await import("../src/lib/events/event-registry");
  const { eventRegistrations } = await import("../src/content/events");
  const { EventPage } = await import("../src/components/events/EventPage");
  const { BlackFridayCta } = await import("../src/components/events/black-friday/BlackFridayCta");
  const { buildEventMetadata } = await import("../src/lib/events/event-metadata");
  const registry = createEventRegistry(eventRegistrations, { production: true, includeDrafts: false });
  const registration = registry.resolve(blackFridayEvent.slug);
  assert(registration?.Content);
  assert(registry.list("active").includes(blackFridayEvent));
  assert.equal(blackFridayEvent.startAt, "2026-11-01T00:00:00+08:00");
  const metadata = buildEventMetadata(blackFridayEvent, { production: true, includeDrafts: false });
  assert.equal(metadata.alternates?.canonical, "https://lilaiireland.com/events/black-friday-2026");
  assert.deepEqual(metadata.robots, { index: false, follow: true });
  assert(metadata.twitter && "card" in metadata.twitter);
  assert.equal(metadata.twitter.card, "summary_large_image");
  const html = renderToStaticMarkup(createElement(EventPage, { registration }));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert(!/<(?:header|footer)\b/.test(html), "Root Layout owns the site header and footer");
  assert(!html.includes("data:image") && !html.includes("support.js") && !html.includes("ds-bundle.js"));
  let previous = -1;
  for (const id of ["hero", "stack", "school-offers", "departure", "renewal", "about", "faq", "final", "terms"]) {
    const position = html.indexOf(`id="${id}"`);
    assert(position > previous, `${id} preserves source order`);
    previous = position;
  }
  for (const item of blackFridayFaq) assert(html.includes(item.question) && html.includes(item.answer));
  for (const term of blackFridayTerms) assert(html.includes(term));
  assert.equal((html.match(/<details\b/g) || []).length, 7);
  assert.equal((html.match(/<details\b[^>]*open=""/g) || []).length, 1);
  for (const copy of ["€2,520", "€3,520", "現省 €1,000", "滿 5 人以上", "兩人以上團報", "毋須諮詢直接報名", "NT$350／人", "次月底前發放"])
    assert(html.includes(copy), `Approved offer retained: ${copy}`);
  const anchors = html.match(/<a\b[^>]*>/g) || [];
  const nav = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/)?.[0];
  assert(nav);
  assert.equal((nav.match(/<a\b/g) || []).length, 5);
  for (const id of ["school-offers", "departure", "renewal", "faq"]) assert(nav.includes(`href="#${id}"`));
  for (const location of ["nav", "hero", "school_offers", "departure_bonus", "renewal", "footer"]) {
    const links = anchors.filter(anchor => anchor.includes(`data-cta-location="${location}"`));
    assert.equal(links.length, 1);
    assert(links[0].includes(`href="${blackFridayEvent.registrationUrl}"`));
  }
  const images = html.match(/<img\b[^>]*>/g) || [];
  assert.equal(images.length, 6);
  assert.equal(images.filter(image => image.includes('loading="lazy"')).length, 5);
  assert.equal(images.filter(image => image.includes('fetchPriority="high"')).length, 1);
  assert(!html.includes('rel="preload"'), "Picture selection must not preload the full fallback as well");
  for (const image of images) {
    assert(/width="\d+" height="\d+"/.test(image));
    const src = image.match(/src="([^"]+)"/)?.[1];
    assert(src && existsSync(`public${src}`));
  }
  for (const name of ["photo-street-group", "photo-cafe-welcome"]) {
    assert(existsSync(`public/events/black-friday-2026/${name}-640.webp`));
    assert(html.includes(`${name}-640.webp 640w`));
  }
  for (const status of ["archived", "draft"] as const) {
    const event = { ...blackFridayEvent, status };
    const archived = renderToStaticMarkup(createElement(EventPage, { registration: { ...registration, event } }));
    assert(!archived.includes(`href="${event.registrationUrl}"`));
    assert.equal(renderToStaticMarkup(createElement(BlackFridayCta, { event, location: "sticky_mobile", label: event.registrationLabel })), "");
  }
  assert(readFileSync("src/app/layout.tsx", "utf8").includes("<Header />"));
  console.log("PASS black Friday registry, source offers/FAQ/terms, shared shell ownership, SEO, responsive local images/loading, CTA destinations and archive guards");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
