import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertDeploymentEnvironment } from "../src/lib/deployment";
import { assertProductionRouteSafety, platformOnlyDeployArgs, PRODUCTION_ACCOUNT_ID } from "./production-route-safety";

const config = JSON.parse(readFileSync("cloudflare/production-platform.jsonc", "utf8"));
const router = JSON.parse(readFileSync("cloudflare/production-router.jsonc", "utf8"));
assertProductionRouteSafety(config, router);

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

function deployPlatform() {
  assert.deepEqual(process.argv.slice(2), ["deploy-platform", "--confirm-platform-only-deploy"],
    "Explicit confirmation required: deploy-platform --confirm-platform-only-deploy");
  assert(process.env.CLOUDFLARE_API_TOKEN, "CLOUDFLARE_API_TOKEN is required");
  assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID, PRODUCTION_ACCOUNT_ID,
    "Cloudflare account mismatch: refusing production deployment");
  assertDeploymentEnvironment({ ...process.env, ...config.vars });
  // Does not deploy Router, update Service Binding, or declare any live public Route.
  const wrangler = resolve("node_modules/wrangler/bin/wrangler.js");
  run(wrangler, platformOnlyDeployArgs());
}

const action = process.argv[2];
if (action === "build") build();
else if (action === "deploy-platform") deployPlatform();
else throw new Error("Use build or deploy-platform --confirm-platform-only-deploy. Router deployment is disabled.");
