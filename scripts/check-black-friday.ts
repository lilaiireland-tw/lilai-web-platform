import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
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
  assert(!/<footer\b/.test(html) && !html.includes('aria-label="主要導覽"'), "Root Layout owns the site header and footer; section headers retain source semantics");
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
  for (const link of anchors.filter(anchor => anchor.includes(`href="${blackFridayEvent.registrationUrl}"`))) {
    assert(link.includes('target="_blank"') && link.includes('rel="noopener noreferrer"'), "Every LINE CTA opens a safe new tab");
  }
  const stickyCta = renderToStaticMarkup(createElement(BlackFridayCta, {
    event: blackFridayEvent, location: "sticky_mobile", label: blackFridayEvent.registrationLabel,
  }));
  assert(stickyCta.includes('target="_blank"') && stickyCta.includes('rel="noopener noreferrer"'));
  const images = html.match(/<img\b[^>]*>/g) || [];
  assert.equal(images.length, 6);
  assert.equal(images.filter(image => image.includes('loading="lazy"')).length, 5);
  assert.equal(images.filter(image => image.includes('fetchPriority="high"')).length, 1);
  for (const image of images) {
    assert(/width="\d+" height="\d+"/.test(image));
    const src = image.match(/src="([^"]+)"/)?.[1];
    assert(src && existsSync(`public${src}`));
  }
  for (const name of ["photo-street-group", "photo-cafe-welcome"]) {
    assert(existsSync(`public/events/black-friday-2026/${name}.jpg`));
    assert(html.includes(`${name}.jpg`));
  }
  const fonts = readFileSync("src/components/events/black-friday/black-friday-fonts.css", "utf8");
  for (const family of ["Black Friday Inter", "Black Friday Sans", "Black Friday Serif"]) assert(fonts.includes(family));
  assert.equal((fonts.match(/@font-face/g) || []).length, 13);
  assert(fonts.includes("font-weight: 900"));
  const fontPaths = new Set([...fonts.matchAll(/url\("([^"]+)"\)/g)].map(match => match[1]));
  assert.equal(fontPaths.size, 3);
  for (const path of fontPaths) assert.equal(readFileSync(`public${path}`).subarray(0, 4).toString(), "wOF2");
  // Optional byte audit against the original, untracked handoff inputs.
  if (process.argv[2]) {
    const source = process.argv[2].replace(/[\\/]$/, "");
    for (const name of ["photo-street-group.jpg", "photo-cafe-welcome.jpg"]) {
      assert(readFileSync(`public/events/black-friday-2026/${name}`).equals(readFileSync(`${source}/site/assets/${name}`)), `${name} must retain original bytes`);
    }
    const standalone = readFileSync(`${source}/lilai-black-friday-standalone.html`, "utf8");
    const manifest = JSON.parse(standalone.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/)![1]) as Record<string, { mime: string; compressed?: boolean; data: string }>;
    for (const path of fontPaths) {
      const id = path.split("/").pop()!.replace(/\.woff2$/, "");
      const entry = manifest[id];
      assert.equal(entry.mime, "font/woff2");
      const data = Buffer.from(entry.data, "base64");
      const original = entry.compressed ? gunzipSync(data) : data;
      assert.equal(createHash("sha256").update(readFileSync(`public${path}`)).digest("hex"), createHash("sha256").update(original).digest("hex"));
    }
    console.log("PASS original JPEG bytes and all three original WOFF2 SHA-256 hashes");
  }
  for (const status of ["archived", "draft"] as const) {
    const event = { ...blackFridayEvent, status };
    const archived = renderToStaticMarkup(createElement(EventPage, { registration: { ...registration, event } }));
    assert(!archived.includes(`href="${event.registrationUrl}"`));
    assert.equal(renderToStaticMarkup(createElement(BlackFridayCta, { event, location: "sticky_mobile", label: event.registrationLabel })), "");
  }
  assert(readFileSync("src/app/layout.tsx", "utf8").includes("<Header />"));
  console.log("PASS black Friday registry, source composition/offers/FAQ/terms, shared shell ownership, SEO, original fonts/local images/loading, CTA destinations and archive guards");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
