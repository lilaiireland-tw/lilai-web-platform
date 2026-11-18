import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript";
import { ireland25Plus8Schema, ireland25Plus8Faq, ireland25Plus8Schools, ireland25Plus8Tiers } from "../src/content/ireland-25-plus-8-copy";
import { productionRouteOwner } from "../cloudflare/production-routing-policy";
import { isStandaloneFrontendPath } from "../cloudflare/staging-policy";

const directory = "src/components/ireland-25-plus-8/";
const campaign = readFileSync(directory + "Ireland25Plus8Campaign.tsx", "utf8");
const faq = readFileSync(directory + "Ireland25Plus8Faq.tsx", "utf8");
const source = ts.createSourceFile("campaign.tsx", campaign, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const elements: (ts.JsxOpeningElement | ts.JsxSelfClosingElement)[] = [];
function visit(node: ts.Node) {
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) elements.push(node);
  ts.forEachChild(node, visit);
}
visit(source);
assert.equal(elements.filter(node => node.tagName.getText(source) === "h1").length, 1);
assert.equal(elements.filter(node => node.tagName.getText(source) === "section").length, 13);
assert.doesNotMatch(campaign + faq, /dangerouslySetInnerHTML|<script|<footer|<iframe|__LILAI_|fonts\.google|data:image|fetch\(/);
assert(!existsSync(directory + "content.json"));
assert(!existsSync(directory + "source.css"));
assert.match(campaign, /Ireland25Plus8Interactions/);
assert.match(campaign, /Ireland25Plus8Cta/);
assert.match(campaign, /Ireland25Plus8Faq/);
assert.match(campaign, /aria-disabled="true" data-paid-consult/);
assert.doesNotMatch(campaign.match(/<Ireland25Plus8Cta[^>]*data-paid-consult[^>]*>/)![0], /href=/);
assert.match(faq, /open=\{index < 2\}/);
assert.doesNotMatch(faq, /\bname=/);
assert.equal(ireland25Plus8Faq.length, 10);
assert.equal(ireland25Plus8Schools.length, 3);
assert.equal(ireland25Plus8Tiers.length, 3);
for (const tier of ireland25Plus8Tiers) assert(ireland25Plus8Schools.some(school => school.id === tier.schoolId));
const moduleCss = readFileSync(directory + "ireland-25-plus-8.module.css", "utf8");
assert.match(moduleCss, /\.design/);
assert.doesNotMatch(moduleCss, /\.ireland25/);
for (const path of ["/ireland-25-plus-8", "/ireland-25-plus-8/"]) {
  assert.equal(productionRouteOwner(path), "platform");
  assert(isStandaloneFrontendPath(path));
}
for (const [file] of (campaign + faq).matchAll(/\/assets\/ireland-25-plus-8\/[a-z0-9/.-]+/g)) {
  assert(existsSync("public" + file), file);
}
const images = elements.filter(node => node.tagName.getText(source) === "img");
assert.equal(images.length, 7);
for (const image of images) {
  const markup = image.getText(source);
  assert.match(markup, /width=(?:"\d+"|\{ireland25Plus8Schools\[\d\]\.image.width\})/);
  assert.match(markup, /height=(?:"\d+"|\{ireland25Plus8Schools\[\d\]\.image.height\})/);
  assert.match(markup, /loading="lazy"/);
}
const photos = [...campaign.matchAll(/<img[^>]*src="([^"]+)"/g)].map(match => match[1]);
photos.push(...ireland25Plus8Schools.map(school => school.image.src));
assert.equal(photos.length, 7);
for (const src of photos) {
  assert(existsSync("public" + src));
  const source = src.replace("/assets/ireland-25-plus-8/", "deploy/assets/");
  if (existsSync(source)) {
    const hash = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");
    assert.equal(hash("public" + src), hash(source), `Original photo bytes: ${src}`);
  }
}
const css = readFileSync("src/components/ireland-25-plus-8/fonts.css", "utf8");
assert.doesNotMatch(css, /https?:/);
for (const [, file] of css.matchAll(/url\(([^)]+)\)/g)) {
  assert.equal(readFileSync("public" + file).subarray(0, 4).toString(), "wOF2");
}
const page = readFileSync("src/app/ireland-25-plus-8/page.tsx", "utf8");
assert.match(page, /index: false/);
assert.match(page, /<Ireland25Plus8Campaign \/>/);
assert.doesNotMatch(page, /dangerouslySetInnerHTML|content\.json|fetch\(/);
assert.equal(ireland25Plus8Schema[1].url, "https://lilaiireland.com/ireland-25-plus-8/");
console.log("PASS 25+8: editable JSX, scoped CSS Module, structured copy, two open FAQs, disabled missing booking URL, local fonts/assets, seven original lazy photos, canonical and route ownership");
