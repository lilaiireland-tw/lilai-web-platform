import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { openSync, closeSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

const origin = "https://lilaiireland.com";
export async function request(path, init = {}) {
  let url = new URL(path, origin);
  const redirects = [];
  for (let hop = 0; hop < 5; hop++) {
    const response = await fetch(url, { ...init, redirect: "manual", signal: AbortSignal.timeout(30000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const next = new URL(response.headers.get("location"), url);
      assert.equal(next.origin, origin, "Unexpected redirect outside production origin");
      redirects.push({ status: response.status, path: next.pathname + next.search });
      await response.body?.cancel();
      url = next;
      continue;
    }
    return { status: response.status, type: response.headers.get("content-type") ?? "",
      robots: response.headers.get("x-robots-tag"), body: await response.text(),
      path: url.pathname + url.search, redirects };
  }
  throw new Error(`Redirect loop: ${path}`);
}
export function assertPage(result, path) {
  assert.equal(result.status, 200, `${path}: HTTP ${result.status}`);
  assert.match(result.type, /text\/html/);
  assert(!/noindex/i.test(result.robots ?? ""), `${path}: noindex header`);
  assert(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(result.body), `${path}: noindex metadata`);
  const canonical = result.body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
  assert.equal(canonical, path === "/" ? origin : origin + path, `${path}: canonical changed`);
}
export function assetPaths(html) {
  const paths = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1].replaceAll("&amp;", "&"))
    .map(p => new URL(p, origin)).filter(u => u.origin === origin &&
      /^\/(?:_next\/static\/|language-school-signup\/.*\.(?:js|css|png|webp|svg)|assets\/|fonts\/)/.test(u.pathname));
  return [...new Set(paths.map(u => u.pathname + u.search))];
}
function assertAsset(result, path) {
  assert.equal(result.status, 200, `Signup asset failed: ${path}`);
  assert(result.body.length > 0 && !result.type.includes("text/html"), `Invalid asset: ${path}`);
  if (/\.m?js(?:\?|$)/.test(path)) assert.match(result.type, /javascript/);
  if (/\.css(?:\?|$)/.test(path)) assert.match(result.type, /text\/css/);
}
export async function publicSmoke({ legacy = false, previous } = {}) {
  const home = await request("/");
  const signup = await request("/language-school-signup/");
  assertPage(home, "/");
  assertPage(signup, "/language-school-signup/");
  const bare = await request("/language-school-signup?utm_source=production-smoke");
  assert.equal(bare.status, 200);
  assert.equal(bare.path, "/language-school-signup/?utm_source=production-smoke");
  assert(bare.redirects.length > 0, "Bare signup must preserve slash redirect");
  const head = await request("/language-school-signup/", { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(head.body, "");
  const assets = assetPaths(signup.body);
  assert(assets.length > 0, "No signup assets discovered");
  if (!legacy) assert(assets.some(p => p.startsWith("/_next/static/")), "Signup is not the Next.js frontend");
  for (const path of assets) {
    const asset = await request(path);
    assertAsset(asset, path);
    const assetHead = await request(path, { method: "HEAD" });
    assert.equal(assetHead.status, 200, `Asset HEAD failed: ${path}`);
    assert.equal(assetHead.body, "");
  }
  const turnstile = await request("/language-school-signup/api/turnstile-config");
  assert.equal(turnstile.status, 200);
  const config = JSON.parse(turnstile.body);
  assert(typeof config.siteKey === "string" && config.siteKey.length > 0 && config.action === "application_submit");
  // Empty JSON is rejected before Turnstile egress, D1, Queue, Gmail or Notion.
  const refused = await request("/language-school-signup/api/applications", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
  });
  assert.equal(refused.status, 403, "Missing Turnstile must be rejected");
  assert.equal(JSON.parse(refused.body).error.code, "turnstile_failed");
  const regression = {};
  for (const path of ["/wp-json/", "/cart/", "/checkout/", "/robots.txt", "/sitemap_index.xml"]) {
    const result = await request(path);
    assert(result.status >= 200 && result.status < 400, `WordPress/SEO route failed: ${path}`);
    if (path === "/wp-json/") assert.match(result.type, /json/);
    regression[path] = { status: result.status, path: result.path, type: result.type, redirects: result.redirects };
  }
  if (previous) assert.deepEqual(regression, previous.regression, "WordPress/WooCommerce/SEO routing changed");
  return { legacy, regression, signupAssets: assets, checkedAt: new Date().toISOString() };
}
export async function bindingSmoke({ platformOnly = false } = {}) {
  const log = openSync(".cloudflare/release/probe.log", "a");
  const child = spawn(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "dev", "--config",
    "cloudflare/production-release-probe.jsonc", "--ip", "127.0.0.1", "--port", "8798",
    "--inspector-port", "0", "--show-interactive-dev-session=false"], { stdio: ["ignore", log, log] });
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetch("http://127.0.0.1:8798/platform/", { signal: AbortSignal.timeout(3000) });
        if (response.status === 200) { await response.body?.cancel(); break; }
        await response.body?.cancel();
      } catch { /* local harness is starting */ }
      assert(attempt < 40 && child.exitCode === null, "Remote binding harness did not become ready");
      await delay(1000);
    }
    for (const target of platformOnly ? ["platform"] : ["platform", "signup"]) {
      const response = await fetch(`http://127.0.0.1:8798/${target}/language-school-signup/`, { signal: AbortSignal.timeout(30000) });
      const body = await response.text();
      assertPage({ status: response.status, type: response.headers.get("content-type"), body }, "/language-school-signup/");
      assert(assetPaths(body).some(p => p.startsWith("/_next/static/")), `${target}: Next signup missing`);
      const head = await fetch(`http://127.0.0.1:8798/${target}/language-school-signup/`, { method: "HEAD", signal: AbortSignal.timeout(30000) });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), "");
      // Shared root assets are owned by Platform/Router, not the signup route.
      if (target === "platform") for (const path of assetPaths(body)) {
        const asset = await fetch(`http://127.0.0.1:8798/platform${path}`, { signal: AbortSignal.timeout(30000) });
        assertAsset({ status: asset.status, type: asset.headers.get("content-type") ?? "", body: await asset.text() }, path);
        const assetHead = await fetch(`http://127.0.0.1:8798/platform${path}`, { method: "HEAD", signal: AbortSignal.timeout(30000) });
        assert.equal(assetHead.status, 200);
        assert.equal(await assetHead.text(), "");
      }
    }
  } finally {
    child.kill();
    closeSync(log);
  }
}
