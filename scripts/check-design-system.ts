import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
