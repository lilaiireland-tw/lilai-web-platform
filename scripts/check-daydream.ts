import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { daydreamEvent, daydreamContact, daydreamPresentation } from "../src/content/events/daydream-adventure-2027";
import { daydreamCopy } from "../src/content/events/daydream-copy";

async function main() {
  createRequire(import.meta.url).extensions[".css"] = module => { module.exports = {}; };
  const { eventRegistry } = await import("../src/lib/events/event-registry");
  const { buildEventMetadata } = await import("../src/lib/events/event-metadata");
  const { EventPage } = await import("../src/components/events/EventPage");
  const { DaydreamRegistrationCta } = await import("../src/components/events/daydream/DaydreamRegistrationCta");
  const registration = eventRegistry.resolve(daydreamEvent.slug);
  assert(registration?.Content);
  assert.equal(daydreamEvent.startAt, "2026-10-18T20:00:00+08:00");
  assert.equal(daydreamEvent.registrationUrl, "https://forms.gle/isPDKepgK9BsPpg86");
  assert.equal(eventRegistry.list("active").includes(daydreamEvent), true);
  const metadata = buildEventMetadata(daydreamEvent, { production: true, includeDrafts: false });
  assert.equal(metadata.alternates?.canonical, "https://lilaiireland.com/events/daydream-adventure-2027");
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
  assert.equal((html.match(/<button\b[^>]*aria-expanded="false"/g) || []).length, 9);
  assert.equal((html.match(/<p\b[^>]*id="daydream-answer-\d"[^>]*hidden=""/g) || []).length, 9);
  for (const name of ["Alex", "Bella", "Arsha"]) assert(html.includes(`<h3>${name}</h3>`));
  const anchors = html.match(/<a\b[^>]*>/g) || [];
  for (const location of ["hero", "agenda", "event", "closing"]) {
    const links = anchors.filter(anchor => anchor.includes(`data-cta-location="${location}"`));
    assert.equal(links.length, 1, `One campaign CTA expected at ${location}`);
    assert(links[0].includes('href="#register"'), `${location} must lead to the registration section`);
    assert(!links[0].includes("target="), `${location} must stay in the campaign tab`);
  }
  const formLinks = anchors.filter(anchor => anchor.includes(`href="${daydreamEvent.registrationUrl}"`));
  assert.equal(formLinks.length, 1, "Only the registration card should link to Google Form");
  assert(formLinks[0].includes('data-cta-location="register"'));
  assert(formLinks[0].includes('target="_blank"') && formLinks[0].includes('rel="noopener noreferrer"'));
  const mobileCta = renderToStaticMarkup(createElement(DaydreamRegistrationCta, {
    event: daydreamEvent, location: "mobile-sticky", label: "免費報名 10/18 分享會",
  }));
  assert(mobileCta.includes('href="#register"') && mobileCta.includes('data-cta-location="mobile-sticky"'));
  assert(!mobileCta.includes("target=") && !mobileCta.includes(daydreamEvent.registrationUrl));
  for (const status of ["archived", "draft"] as const) {
    assert.equal(renderToStaticMarkup(createElement(DaydreamRegistrationCta, {
      event: { ...daydreamEvent, status }, location: "mobile-sticky", label: daydreamEvent.registrationLabel,
    })), "", `${status} must suppress in-page registration CTAs`);
  }
  assert(!html.includes("data:image") && !html.includes("__bundler"));
  // Every approved textual field must survive custom composition, including all FAQ answers and agenda tags.
  const renderedText = html.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "");
  const checkCopy = (value: unknown, key = "") => {
    if (typeof value === "string" && key !== "src" && key !== "alt") {
      const escaped = renderToStaticMarkup(createElement("span", null, value)).slice(6, -7);
      assert(renderedText.includes(escaped), `Missing approved copy: ${value}`);
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
  assert.equal((html.match(/loading="lazy"/g) || []).length, 12);
  assert.equal((html.match(/<img\b[^>]*fetchPriority="high"/g) || []).length, 1);
  assert(html.includes(daydreamPresentation.logo.src));
  const fontCss = readFileSync("src/components/events/daydream/daydream-fonts.css", "utf8");
  for (const [, font] of fontCss.matchAll(/url\("([^"\)]+)"\)/g)) assert(existsSync(`public${font}`));
  for (const icon of ["calendar-days", "clock", "monitor", "ticket"]) assert(existsSync(`public/events/daydream-adventure-2027/icons/${icon}.svg`));

  // Optional source audit: compare exported assets directly to the supplied bundle.
  // The large source HTML is user-owned and is deliberately not checked into Git.
  const reference = process.argv[2];
  if (reference) {
    const source = readFileSync(reference, "utf8");
    const island = (name: string) => JSON.parse(source.match(new RegExp(`<script type="__bundler/${name}">([\\s\\S]*?)</script>`))![1]);
    const manifest = island("manifest") as Record<string, { data: string; compressed: boolean }>;
    const resources = Object.fromEntries((island("ext_resources") as { id: string; uuid: string }[]).map(r => [r.id, r.uuid]));
    const assets = [eventImage("r0", images[0].src), eventImage("r1", images[1].src), eventImage("r2", images[2].src),
      ...daydreamCopy.frames.photos.map((image, i) => eventImage(`r${i + 3}`, image.src)),
      eventImage("r12", daydreamCopy.speakers.people[0].image.src), eventImage("r8", daydreamCopy.speakers.people[1].image.src),
      eventImage("r13", daydreamCopy.speakers.people[2].image.src), eventImage("r14", daydreamContact.qrImage.src), eventImage("r9", daydreamPresentation.logo.src)];
    function eventImage(id: string, file: string) { return { uuid: resources[id], file }; }
    for (const file of readdirSync("public/events/daydream-adventure-2027/fonts").filter(file => file.endsWith(".woff2"))) {
      assets.push({ uuid: file.replace(/\.woff2$/, ""), file: `/events/daydream-adventure-2027/fonts/${file}` });
    }
    for (const icon of ["calendar-days", "clock", "monitor", "ticket"]) {
      assets.push(eventImage(`ic_${icon.replaceAll("-", "_")}`, `/events/daydream-adventure-2027/icons/${icon}.svg`));
    }
    for (const { uuid, file } of assets) {
      const entry = manifest[uuid];
      const raw = Buffer.from(entry.data, "base64");
      const expected = entry.compressed ? gunzipSync(raw) : raw;
      const hash = (data: Buffer) => createHash("sha256").update(data).digest("hex");
      assert.equal(hash(readFileSync(`public${file}`)), hash(expected), `Asset differs from source: ${file}`);
    }
    console.log(`PASS reference SHA-256 audit: ${assets.length} original images, logo, icons and font files`);
  }
  const archived = renderToStaticMarkup(createElement(EventPage, { registration: { ...registration, event: { ...daydreamEvent, status: "archived" } } }));
  assert(archived.includes("活動已結束"));
  assert(!archived.includes(daydreamEvent.registrationUrl) && !archived.includes("qr-register.png"));
  assert(!archived.includes('href="#register"') && !archived.includes("data-cta-location="));
  assert(archived.includes('href="/events"'));
  console.log("PASS registry, dates, CTA flow, canonical/noindex/OG, ten-section order, complete copy/line breaks, speakers, initially collapsed FAQ, image dimensions/loading, font/icon assets and archived registration removal");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
