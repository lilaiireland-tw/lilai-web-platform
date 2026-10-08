import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertDeploymentEnvironment } from "../src/lib/deployment";

assert.equal(process.argv[2], "build", "Only the non-deploying production build is supported");

const config = JSON.parse(readFileSync("cloudflare/production-platform.jsonc", "utf8"));
assert.equal(config.name, "lilai-web-platform-production", "Unexpected production platform Worker name");
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

run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["build", "--config", configPath]);
run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["populateCache", "local", "--config", configPath]);
