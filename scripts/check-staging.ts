import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { assertDeploymentEnvironment } from "../src/lib/deployment";
import { stagingResponse } from "../cloudflare/staging-response";
import { isWordPressRewrite, wordpressRewritePrefixes } from "../src/config/wordpress-rewrites";

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

  const fixtureEnv = {
    ...process.env, SITE_DEPLOYMENT_ENV: "staging", EVENT_DEPLOYMENT_ENV: "preview",
    EVENTS_INCLUDE_DRAFTS: "false", WORDPRESS_ORIGIN: "https://fixture.invalid",
    WORDPRESS_API_BASE: "https://fixture.invalid/wp-json/wp/v2",
    WOOCOMMERCE_STORE_API_BASE: "https://fixture.invalid/wp-json/wc/store/v1",
  };
  for (const [action, overrides, expected] of [
    ["build", { WORDPRESS_ORIGIN: "" }, /Set WORDPRESS_ORIGIN/],
    ["build", { WORDPRESS_ORIGIN: "https://cms.lilaiireland.com" }, /production domain/],
    ["build", { WORDPRESS_API_BASE: "https://lilaiireland.com/wp-json" }, /production domain/],
    ["deploy", { WORDPRESS_ORIGIN: "http://127.0.0.1:9" }, /cannot use a loopback fixture/],
    ["deploy", { GITHUB_REF: "refs/heads/main" }, /develop GitHub workflow/],
    ["deploy", { GITHUB_REF: "refs/heads/develop", CLOUDFLARE_ACCOUNT_ID: "" }, /Verified staging account/],
  ] as const) {
    const result = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/cloudflare-staging.ts", action], {
      encoding: "utf8", timeout: 15000, env: { ...fixtureEnv, ...overrides },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, expected);
    assert(!result.stdout.includes("OpenNext"), "Guard must reject before building or deploying");
  }
  console.log("PASS staging rejects missing/production origins, deployed loopback, main and missing account");

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
  for (const key of ["env", "services", "r2_buckets", "d1_databases", "kv_namespaces", "queues"]) {
    assert.equal(config[key], undefined, `Unexpected production/shared resource configuration: ${key}`);
  }
  console.log("PASS isolated staging config with no zone routes or shared resource bindings");
  for (const prefix of wordpressRewritePrefixes) {
    assert(isWordPressRewrite(prefix));
    assert(isWordPressRewrite(`${prefix}/child`));
    assert(!isWordPressRewrite(`${prefix}-other`));
  }
  console.log("PASS existing rewrite bare, descendant and prefix-boundary matching");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
