import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { assertDeploymentEnvironment } from "../src/lib/deployment";
import { stagingResponse } from "../cloudflare/staging-response";
import {
  isStandaloneFrontendPath,
  isStandaloneStaticAssetPath,
  stagingUnavailableResponse,
} from "../cloudflare/staging-policy";
import { getPageBySlug } from "../src/lib/wordpress";
import { getProductBySlug } from "../src/lib/woocommerce";
import nextConfig from "../next.config";

async function main() {
  for (const site of [undefined, "preview", "staging", "invalid", "production"]) {
    for (const event of [undefined, "preview", "invalid", "production"]) {
      const check = () => assertDeploymentEnvironment({ SITE_DEPLOYMENT_ENV: site, EVENT_DEPLOYMENT_ENV: event });
      if ((site === "production") !== (event === "production")) assert.throws(check, /mismatch/);
      else assert.doesNotThrow(check);
    }
  }
  // Exercise the actual Next build entry, not only the helper. It must fail
  // during config loading, before compiling pages or making CMS requests.
  for (const [site, event] of [["production", "preview"], ["staging", "production"]]) {
    const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
      encoding: "utf8", timeout: 30000,
      env: { ...process.env, SITE_DEPLOYMENT_ENV: site, EVENT_DEPLOYMENT_ENV: event },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, /SITE_DEPLOYMENT_ENV \/ EVENT_DEPLOYMENT_ENV mismatch/);
  }
  console.log("PASS deployment matrix and both Next build mismatch directions");

  const stagingEnv = {
    ...process.env, SITE_DEPLOYMENT_ENV: "staging", EVENT_DEPLOYMENT_ENV: "preview",
    EVENTS_INCLUDE_DRAFTS: "false",
  };
  for (const [action, overrides, expected] of [
    ["deploy", { GITHUB_REF: "refs/heads/main" }, /develop GitHub workflow/],
    ["deploy", { GITHUB_REF: "refs/heads/develop", CLOUDFLARE_ACCOUNT_ID: "" }, /Verified staging account/],
    ["deploy", {
      GITHUB_REF: "refs/heads/develop", CLOUDFLARE_ACCOUNT_ID: "622900d9297cd7c09cad966aaae64617",
      CLOUDFLARE_ACCESS_CONFIRMED: "",
    }, /Protect the existing staging Worker with Cloudflare Access/],
    ["bootstrap-access", {
      CLOUDFLARE_ACCOUNT_ID: "622900d9297cd7c09cad966aaae64617",
      CLOUDFLARE_BOOTSTRAP_CONFIRMED: "",
    }, /exact Worker name after explicit authorization/],
  ] as const) {
    const result = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/cloudflare-staging.ts", action], {
      encoding: "utf8", timeout: 15000, env: { ...stagingEnv, ...overrides },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, expected);
    assert(!result.stdout.includes("OpenNext"), "Guard must reject before building or deploying");
  }
  console.log("PASS remote staging actions reject main, missing account, Access and bootstrap confirmation");

  for (const status of [200, 301, 302, 304, 404, 405, 500, 503]) {
    const body = status === 304 ? null : "fixture";
    const response = await stagingResponse(async () => new Response(body, { status, headers: {
      Location: "/fixture", "Set-Cookie": "fixture=1; HttpOnly", "X-Robots-Tag": "index",
    } }));
    assert.equal(response.status, status);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    assert.equal(response.headers.get("location"), "/fixture");
    assert.equal(response.headers.get("set-cookie"), "fixture=1; HttpOnly");
    assert.equal(await response.text(), body ?? "");
  }
  const failure = await stagingResponse(async () => { throw new Error("private detail"); });
  assert.equal(failure.status, 500);
  assert.equal(failure.headers.get("x-robots-tag"), "noindex, nofollow");
  assert(!(await failure.text()).includes("private detail"));
  console.log("PASS noindex on success, redirect, not-modified, error and thrown responses");

  const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
  assert.deepEqual(config.routes, []);
  assert.equal(config.workers_dev, true);
  assert.equal(config.preview_urls, false);
  assert.equal(config.assets.run_worker_first, true);
  assert.equal(config.vars.SITE_DEPLOYMENT_ENV, "staging");
  assert.equal(config.vars.EVENT_DEPLOYMENT_ENV, "preview");
  for (const key of ["WORDPRESS_ORIGIN", "WORDPRESS_API_BASE", "WOOCOMMERCE_STORE_API_BASE"]) {
    assert.equal(config.vars[key], undefined, `Unexpected standalone CMS binding: ${key}`);
  }
  for (const key of ["env", "services", "r2_buckets", "d1_databases", "kv_namespaces", "queues"]) {
    assert.equal(config[key], undefined, `Unexpected production/shared resource configuration: ${key}`);
  }
  console.log("PASS isolated staging config with no zone routes or shared resource bindings");

  const originalSiteForRewrites = process.env.SITE_DEPLOYMENT_ENV;
  process.env.SITE_DEPLOYMENT_ENV = "staging";
  try {
    assert.deepEqual(await nextConfig.rewrites!(), []);
  } finally {
    if (originalSiteForRewrites === undefined) delete process.env.SITE_DEPLOYMENT_ENV;
    else process.env.SITE_DEPLOYMENT_ENV = originalSiteForRewrites;
  }
  console.log("PASS standalone staging build omits WordPress rewrites");

  for (const path of ["/", "/events", "/events/", "/events/daydream-adventure-2027",
    "/events/daydream-adventure-2027/", "/robots.txt", "/sitemap.xml"]) {
    assert(isStandaloneFrontendPath(path), path);
  }
  for (const path of ["/events/example", "/events-other", "/product/example", "/wp-json/", "/about/", "/api/revalidate"]) {
    assert(!isStandaloneFrontendPath(path), path);
  }
  for (const path of ["/_next/static/example.js", "/assets/example.png", "/fonts/example.woff2",
    "/events/example", "/events/daydream-adventure-2027/missing.png"]) {
    assert(isStandaloneStaticAssetPath(path), path);
  }
  const unavailable = stagingUnavailableResponse("GET");
  assert.equal(unavailable.status, 503);
  assert.match(await unavailable.text(), /unavailable in standalone staging/);
  assert.equal(stagingUnavailableResponse("HEAD").body, null);
  console.log("PASS standalone frontend allowlist and explicit CMS/Woo unavailable response");

  const originalSiteEnv = process.env.SITE_DEPLOYMENT_ENV;
  process.env.SITE_DEPLOYMENT_ENV = "staging";
  try {
    await assert.rejects(getPageBySlug("must-not-fetch"), /WordPress is unavailable/);
    await assert.rejects(getProductBySlug("must-not-fetch"), /WooCommerce is unavailable/);
  } finally {
    if (originalSiteEnv === undefined) delete process.env.SITE_DEPLOYMENT_ENV;
    else process.env.SITE_DEPLOYMENT_ENV = originalSiteEnv;
  }
  console.log("PASS staging data clients fail before any production CMS request");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
