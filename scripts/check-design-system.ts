import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../src/components/ui/Button";

// Source guard, not a computed-style/browser check: all visual heading sizes
// must reset legacy h1 constraints and UA margins regardless of semantic tag.
const primitives = readFileSync("src/styles/primitives.css", "utf8");
const headingRules = [...primitives.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
for (const heading of ["ds-heading-1", "ds-heading-2", "ds-heading-3"]) {
  const declarations = headingRules
    .filter(([, selectors]) => selectors.split(",").some(selector => selector.trim() === `.${heading}`))
    .map(([, , body]) => body).join("\n");
  assert.match(declarations, /\bmargin\s*:\s*0\s*;/, `${heading} must reset all margins`);
  assert.match(declarations, /\bmax-width\s*:\s*none\s*;/, `${heading} must reset legacy h1 width`);
}
console.log("PASS heading source guard: every size resets margins and legacy width constraints");

const fontCss = readFileSync("src/styles/fonts.css", "utf8");
assert.doesNotMatch(fontCss, /fonts\.gstatic\.com/, "Brand fonts must be self-hosted");

const fontFaces = [...fontCss.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(([, body]) => ({
  body,
  family: body.match(/font-family:\s*['\"]([^'\"]+)/)?.[1],
  ranges: body.match(/unicode-range:\s*([^;]+)/)?.[1]
    .split(",")
    .map(value => value.trim().match(/^U\+([0-9a-f]+)(?:-([0-9a-f]+))?$/i))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map(match => [Number.parseInt(match[1], 16), Number.parseInt(match[2] || match[1], 16)] as const) || [],
  url: body.match(/url\((\/fonts\/[^)]+\.woff2)\)/)?.[1],
}));

const sourceFiles = (directory: string): string[] => readdirSync(directory).flatMap(name => {
  const path = join(directory, name);
  if (statSync(path).isDirectory()) return sourceFiles(path);
  return /\.(?:css|html|ts|tsx)$/.test(name) && path !== join("src", "styles", "fonts.css") ? [path] : [];
});
const hanCharacters = new Set(sourceFiles("src").flatMap(path =>
  [...readFileSync(path, "utf8").matchAll(/\p{Script=Han}/gu)].map(match => match[0])
));

for (const family of ["Noto Sans TC", "Noto Serif TC"]) {
  const faces = fontFaces.filter(face => face.family === family);
  assert(faces.length > 1, `${family} must use unicode-range shards`);
  const ranges = faces.flatMap(face => face.ranges);
  const missing = [...hanCharacters].filter(character => {
    const codePoint = character.codePointAt(0)!;
    return !ranges.some(([start, end]) => codePoint >= start && codePoint <= end);
  });
  assert.deepEqual(missing, [], `${family} is missing source characters: ${missing.join("")}`);

  for (const face of faces) {
    assert(face.url, `${family} face must reference a local WOFF2 asset`);
    const assetPath = join("public", face.url.slice(1));
    assert(existsSync(assetPath), `Missing font asset: ${assetPath}`);
    assert.equal(readFileSync(assetPath).subarray(0, 4).toString("ascii"), "wOF2", assetPath);
  }
}
assert(fontFaces.filter(face => face.family === "Noto Sans TC").every(face =>
  /font-weight:\s*400 700;/.test(face.body)
));
assert(fontFaces.filter(face => face.family === "Noto Serif TC").every(face =>
  /font-weight:\s*700;/.test(face.body)
));

for (const stylesheet of ["src/app/globals.css", "src/styles/primitives.css", "src/components/layout/layout.module.css"]) {
  const unsupportedWeights = [...readFileSync(stylesheet, "utf8").matchAll(/font-weight:\s*(\d+)/g)]
    .map(match => Number(match[1])).filter(weight => weight !== 400 && weight !== 700);
  assert.deepEqual(unsupportedWeights, [], `${stylesheet} uses unsupported weights`);
}
console.log(`PASS brand fonts: self-hosted unicode-range coverage for ${hanCharacters.size} Han characters and 400/700 weights`);

const render = (props: Parameters<typeof Button>[0]) => renderToStaticMarkup(createElement(Button, props));
const native = render({ children: "Action", "aria-label": "Accessible action", className: "custom", name: "action" });
assert.match(native, /<button/);
assert.match(native, /type="button"/);
assert.match(native, /aria-label="Accessible action"/);
assert.match(native, /name="action"/);
assert.match(native, /ds-button--primary custom/);
assert.match(render({ type: "submit", children: "Submit", disabled: true }), /type="submit"[^>]*disabled=""/);
assert.match(render({ href: "/example/", target: "_blank", rel: "noopener", children: "Link" }), /href="\/example\/"/);
const disabled = Button({ href: "/example/", disabled: true, tabIndex: 0, onClick: () => { throw new Error("Must not activate"); }, children: "Unavailable" });
assert.equal(disabled.type, "a");
assert.equal(disabled.props.href, undefined);
assert.equal(disabled.props.onClick, undefined);
assert.equal(disabled.props.tabIndex, -1);
assert.equal(disabled.props["aria-disabled"], true);
assert.equal(disabled.props.role, "link");
assert.doesNotMatch(render({ href: "/example/", disabled: true, children: "Unavailable" }), /href=/);
for (const variant of ["primary", "secondary", "dark", "ghost"] as const) {
  for (const size of ["small", "default", "large"] as const) {
    const html = render({ variant, size, fullWidth: true, children: "Action" });
    assert(html.includes(`ds-button--${variant}`));
    if (size !== "default") assert(html.includes(`ds-button--${size}`));
    assert(html.includes("ds-button--full"));
  }
}
console.log("PASS Button: native props/ARIA, submit semantics, variants/sizes, disabled anchor activation");
