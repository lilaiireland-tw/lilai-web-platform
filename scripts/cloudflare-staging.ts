import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertDeploymentEnvironment } from "../src/lib/deployment";

const action = process.argv[2];
assert(["build", "dry-run", "deploy"].includes(action), "Expected build, dry-run or deploy");
assertDeploymentEnvironment();
assert.equal(process.env.SITE_DEPLOYMENT_ENV, "staging", "Set SITE_DEPLOYMENT_ENV=staging");
assert.equal(process.env.EVENT_DEPLOYMENT_ENV, "preview", "Set EVENT_DEPLOYMENT_ENV=preview");
assert(process.env.EVENTS_INCLUDE_DRAFTS !== "true", "This staging pipeline excludes drafts");

const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
for (const key of ["WORDPRESS_ORIGIN", "WORDPRESS_API_BASE", "WOOCOMMERCE_STORE_API_BASE"] as const) {
  const value = process.env[key];
  assert(value, `Set ${key} to a verified nonproduction origin (no production defaults)`);
  const url = new URL(value);
  assert(!url.username && !url.password && !url.search && !url.hash, `${key}: invalid URL`);
  assert(url.hostname !== "lilaiireland.com" && !url.hostname.endsWith(".lilaiireland.com"),
    `${key}: production domain and CMS origin are forbidden in this staging pipeline`);
  const local = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  assert(url.protocol === "https:" || (local && url.protocol === "http:"), `${key}: HTTPS required`);
  if (action === "deploy") assert(!local, `${key}: a deployed Worker cannot use a loopback fixture`);
  if (key === "WORDPRESS_ORIGIN") assert.equal(url.pathname, "/", "WORDPRESS_ORIGIN must be an origin without a path");
  config.vars[key] = key === "WORDPRESS_ORIGIN" ? url.origin : value;
}
if (action === "deploy") {
  assert.equal(process.env.GITHUB_REF, "refs/heads/develop", "Deploy through the develop GitHub workflow");
  assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID, config.account_id, "Verified staging account required");
  assert(process.env.CLOUDFLARE_API_TOKEN, "CLOUDFLARE_API_TOKEN is required in the staging environment");
}

config.main = resolve(config.main);
config.assets.directory = resolve(config.assets.directory);
config.$schema = resolve("node_modules/wrangler/config-schema.json");
mkdirSync(".cloudflare", { recursive: true });
const configPath = ".cloudflare/wrangler-staging.json";
writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

function run(entry: string, args: string[]) {
  const result = spawnSync(process.execPath, [entry, ...args], { stdio: "inherit", env: {
    ...process.env, ...config.vars, WRANGLER_SEND_METRICS: "false",
  } });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${entry} failed`);
}

// Always rebuild with the same values that will become Worker runtime vars.
// No production artifact can be promoted into staging by changing runtime vars.
run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["build", "--config", configPath]);
// OpenNext's static-assets cache must be populated before plain Wrangler can
// serve prerendered pages. This target only copies local files; no remote cache.
run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["populateCache", "local", "--config", configPath]);
if (action === "deploy") {
  run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["deploy", "--config", configPath]);
} else if (action === "dry-run") {
  run("node_modules/wrangler/bin/wrangler.js", ["deploy", "--config", configPath,
    "--dry-run"]);
}
