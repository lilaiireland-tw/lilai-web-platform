import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import content from "../src/components/ireland-25-plus-8/content.json";
import { productionRouteOwner } from "../cloudflare/production-routing-policy";
import { isStandaloneFrontendPath } from "../cloudflare/staging-policy";

const html = content.html;
assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
assert.doesNotMatch(html, /<script|<footer|__LILAI_|fonts\.google|data:image/);
assert.match(html, /data-paid-consult/);
assert.match(html, /aria-disabled="true"/);
for (const path of ["/ireland-25-plus-8", "/ireland-25-plus-8/"]) {
  assert.equal(productionRouteOwner(path), "platform");
  assert(isStandaloneFrontendPath(path));
}
for (const [file] of html.matchAll(/\/assets\/ireland-25-plus-8\/[a-z0-9/.-]+/g)) {
  assert(existsSync("public" + file), file);
}
const images = [...html.matchAll(/<img\b[^>]+>/g)].map(match => match[0]);
assert.equal(images.length, 7);
for (const image of images) {
  assert.match(image, /width="\d+"/);
  assert.match(image, /height="\d+"/);
  assert.match(image, /loading="lazy"/);
  const src = image.match(/src="([^"]+)"/)![1];
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
assert.equal(content.schema[1].url, "https://lilaiireland.com/ireland-25-plus-8/");
console.log("PASS 25+8: static content, one H1, disabled missing booking URL, local fonts/assets, seven original lazy photos, canonical and route ownership");
