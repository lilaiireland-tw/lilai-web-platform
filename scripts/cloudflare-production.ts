import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertDeploymentEnvironment } from "../src/lib/deployment";
import { assertProductionRouteSafety } from "./production-route-safety";

const config = JSON.parse(readFileSync("cloudflare/production-platform.jsonc", "utf8"));
const router = JSON.parse(readFileSync("cloudflare/production-router.jsonc", "utf8"));
assertProductionRouteSafety(config, router);

const commandEnv = {
  ...process.env,
  ...config.vars,
  WRANGLER_SEND_METRICS: "false",
};
assertDeploymentEnvironment(commandEnv);
assert.equal(commandEnv.NEXT_PUBLIC_GA4_MEASUREMENT_ID, "G-06M3GS0WS0",
  "Production build must use the existing linked GA4 destination");

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

const action = process.argv[2];
if (action === "build") build();
else throw new Error("Use build. Deploy through the unified Production Deploy workflow.");
