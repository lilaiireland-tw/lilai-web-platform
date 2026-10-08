import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertDeploymentEnvironment } from "../src/lib/deployment";

const EXPECTED_PRODUCTION_ACCOUNT_ID = "622900d9297cd7c09cad966aaae64617";
const config = JSON.parse(readFileSync("cloudflare/production-platform.jsonc", "utf8"));
const router = JSON.parse(readFileSync("cloudflare/production-router.jsonc", "utf8"));
assert.equal(config.name, "lilai-web-platform-production", "Unexpected production platform Worker name");
assert.equal(config.account_id, EXPECTED_PRODUCTION_ACCOUNT_ID, "Production Platform must target the approved Cloudflare account");
assert.equal(router.account_id, EXPECTED_PRODUCTION_ACCOUNT_ID, "Production Router must target the approved Cloudflare account");
assert.equal(config.workers_dev, false, "Production platform Worker must not have a workers.dev endpoint");
assert.equal(config.preview_urls, false, "Production platform version preview URLs must stay disabled");
assert.deepEqual(config.routes, [], "Production platform Worker must not attach a public route");
assert.equal(config.vars.SITE_DEPLOYMENT_ENV, "production");
assert.equal(config.vars.EVENT_DEPLOYMENT_ENV, "production");
assert.equal(config.vars.EVENTS_INCLUDE_DRAFTS, "false");
assert.equal(config.vars.NEXT_PUBLIC_SITE_URL, "https://lilaiireland.com");

const commandEnv = {
  ...process.env,
  ...config.vars,
  WRANGLER_SEND_METRICS: "false",
};
assertDeploymentEnvironment(commandEnv);

config.main = resolve("cloudflare", config.main);
config.assets.directory = resolve("cloudflare", config.assets.directory);
config.$schema = resolve("node_modules/wrangler/config-schema.json");
mkdirSync(".cloudflare", { recursive: true });
const localTempPath = resolve(".cloudflare/tmp");
if (process.platform === "win32") mkdirSync(localTempPath, { recursive: true });
const configPath = ".cloudflare/wrangler-production-platform.json";
writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
if (process.platform === "win32") {
  commandEnv.TEMP = localTempPath;
  commandEnv.TMP = localTempPath;
}

function run(entry: string, args: string[]) {
  const result = spawnSync(process.execPath, [entry, ...args], { stdio: "inherit", env: commandEnv });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${entry} failed`);
}

function build() {
  run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["build", "--config", configPath]);
  run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["populateCache", "local", "--config", configPath]);
}

function deployPrivate() {
  assert.equal(process.argv[3], "--confirm-private-production-deploy",
    "Private production deploy requires --confirm-private-production-deploy");
  assert(process.env.CLOUDFLARE_API_TOKEN, "CLOUDFLARE_API_TOKEN is required");
  assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID, EXPECTED_PRODUCTION_ACCOUNT_ID,
    "CLOUDFLARE_ACCOUNT_ID must match the approved production account");
  assert.equal(router.name, "lilai-web-platform-router");
  assert.equal(router.account_id, EXPECTED_PRODUCTION_ACCOUNT_ID,
    "Production Router must target the approved Cloudflare account");
  assert.equal(router.workers_dev, false);
  assert.equal(router.preview_urls, false);
  assert.deepEqual(router.routes, [], "Router must have no public route during private deployment");
  assert.deepEqual(router.services, [{ binding: "PLATFORM", service: config.name }]);
  assertDeploymentEnvironment({ ...process.env, ...config.vars });

  const wrangler = resolve("node_modules/wrangler/bin/wrangler.js");
  run(wrangler, ["deploy", "--config", "cloudflare/production-platform.jsonc"]);
  run(wrangler, ["deploy", "--config", "cloudflare/production-router.jsonc"]);
}

const action = process.argv[2];
if (action === "build") build();
else if (action === "deploy-private") deployPrivate();
else throw new Error("Use 'build' or 'deploy-private --confirm-private-production-deploy'");
