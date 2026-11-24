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
  assert(result.body.length > 0 && !/text\/html/i.test(result.type) && !/^\s*(?:<!doctype html|<html)/i.test(result.body), `Invalid asset: ${path}`);
  if (!/javascript|css/i.test(result.type)) console.warn(`WARNING asset Content-Type ${result.type}: ${path}`);
}
export async function preflightSmoke({ previous } = {}) {
  const home = await request("/");
  const signup = await request("/language-school-signup/");
  assertPage(home, "/");
  assertPage(signup, "/language-school-signup/");
  const regression = {};
  for (const path of ["/wp-json/", "/cart/", "/checkout/", "/robots.txt", "/sitemap_index.xml"]) {
    const result = await request(path);
    assert.equal(result.status, 200, `WordPress/SEO route failed: ${path}`);
    assert(result.body.length > 0, `Empty WordPress/SEO response: ${path}`);
    if (path === "/wp-json/") assert(Array.isArray(JSON.parse(result.body).namespaces), "WordPress REST API unavailable");
    if (path === "/robots.txt") assert(/user-agent\s*:/i.test(result.body), "Invalid robots.txt");
    if (path === "/sitemap_index.xml") assert(/<(?:sitemapindex|urlset)\b/i.test(result.body), "Invalid sitemap");
    regression[path] = { status: result.status, path: result.path };
    if (previous?.regression?.[path] && previous.regression[path].path !== result.path) {
      console.warn(`WARNING ${path}: final path changed from ${previous.regression[path].path} to ${result.path}`);
    }
  }
  return { regression, homeAssets: assetPaths(home.body), signupAssets: assetPaths(signup.body), checkedAt: new Date().toISOString() };
}
export async function publicSmoke({ legacy = false, previous } = {}) {
  const smoke = await preflightSmoke({ previous });
  const bare = await request("/language-school-signup?utm_source=production-smoke");
  assert.equal(bare.status, 200);
  assert.equal(bare.path, "/language-school-signup/?utm_source=production-smoke");
  assert(bare.redirects.length > 0, "Bare signup must preserve slash redirect");
  const assets = new Set();
  for (const paths of [smoke.homeAssets, smoke.signupAssets]) {
    for (const extension of [/\.m?js(?:\?|$)/, /\.css(?:\?|$)/]) {
      const path = paths.find(path => extension.test(path));
      assert(path, `Missing main JS/CSS asset: ${extension}`);
      assets.add(path);
    }
  }
  for (const path of assets) assertAsset(await request(path), path);
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
  return { ...smoke, legacy, checkedAssets: [...assets] };
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
    }
  } finally {
    child.kill();
    closeSync(log);
  }
}
