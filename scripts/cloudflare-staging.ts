import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertDeploymentEnvironment } from "../src/lib/deployment";

const action = process.argv[2];
assert(["build", "dry-run", "bootstrap-access", "deploy"].includes(action),
  "Expected build, dry-run, bootstrap-access or deploy");
assertDeploymentEnvironment();
assert.equal(process.env.SITE_DEPLOYMENT_ENV, "staging", "Set SITE_DEPLOYMENT_ENV=staging");
assert.equal(process.env.EVENT_DEPLOYMENT_ENV, "preview", "Set EVENT_DEPLOYMENT_ENV=preview");
assert(process.env.EVENTS_INCLUDE_DRAFTS !== "true", "This staging pipeline excludes drafts");

const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
assert.equal(config.name, "lilai-web-platform-staging", "Unexpected staging Worker name");
assert.equal(config.workers_dev, true, "Staging must use only its workers.dev URL");
assert.equal(config.preview_urls, false, "Version preview URLs must stay disabled");
assert.deepEqual(config.routes, [], "Staging must not attach to a zone route or custom domain");
for (const key of ["WORDPRESS_ORIGIN", "WORDPRESS_API_BASE", "WOOCOMMERCE_STORE_API_BASE"] as const) {
  assert.equal(config.vars[key], undefined, `${key} must not be bound in standalone staging`);
}
if (action === "deploy") {
  assert.equal(process.env.GITHUB_REF, "refs/heads/develop", "Deploy through the develop GitHub workflow");
  assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID, config.account_id, "Verified staging account required");
  assert.equal(process.env.CLOUDFLARE_ACCESS_CONFIRMED, "true",
    "Protect the existing staging Worker with Cloudflare Access before deployment");
  assert(process.env.CLOUDFLARE_API_TOKEN, "CLOUDFLARE_API_TOKEN is required in the staging environment");
} else if (action === "bootstrap-access") {
  assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID, config.account_id, "Verified staging account required");
  assert.equal(process.env.CLOUDFLARE_BOOTSTRAP_CONFIRMED, config.name,
    "Set CLOUDFLARE_BOOTSTRAP_CONFIRMED to the exact Worker name after explicit authorization");
  assert(process.env.CLOUDFLARE_API_TOKEN, "CLOUDFLARE_API_TOKEN is required for the Access bootstrap");
  // Create the one staging Worker without any public endpoint. The operator can
  // then attach Worker-level Access before the normal deploy enables workers.dev.
  config.workers_dev = false;
}

config.main = resolve(config.main);
config.assets.directory = resolve(config.assets.directory);
config.$schema = resolve("node_modules/wrangler/config-schema.json");
mkdirSync(".cloudflare", { recursive: true });
const localTempPath = resolve(".cloudflare/tmp");
if (process.platform === "win32") mkdirSync(localTempPath, { recursive: true });
const configPath = ".cloudflare/wrangler-staging.json";
writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

const commandEnv = {
  ...process.env,
  ...config.vars,
  ...(process.platform === "win32" ? { TEMP: localTempPath, TMP: localTempPath } : {}),
  WRANGLER_SEND_METRICS: "false",
};

function run(entry: string, args: string[]) {
  const result = spawnSync(process.execPath, [entry, ...args], { stdio: "inherit", env: commandEnv });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${entry} failed`);
}

if (action === "deploy") {
  const existing = spawnSync(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "deployments", "list",
    "--name", config.name, "--json"], {
    encoding: "utf8",
    env: commandEnv,
  });
  if (existing.error) throw existing.error;
  assert.equal(existing.status, 0,
    `The Access-protected placeholder Worker must exist before deployment: ${existing.stderr}`);
  const deployments = JSON.parse(existing.stdout);
  assert(Array.isArray(deployments) && deployments.length > 0,
    "The Access-protected placeholder Worker must have an existing deployment");
}

// Always rebuild with the same values that will become Worker runtime vars.
// No production artifact can be promoted into staging by changing runtime vars.
run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["build", "--config", configPath]);
// OpenNext's static-assets cache must be populated before plain Wrangler can
// serve prerendered pages. This target only copies local files; no remote cache.
run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["populateCache", "local", "--config", configPath]);
if (action === "deploy" || action === "bootstrap-access") {
  run("node_modules/@opennextjs/cloudflare/dist/cli/index.js", ["deploy", "--config", configPath]);
} else if (action === "dry-run") {
  run("node_modules/wrangler/bin/wrangler.js", ["deploy", "--config", configPath,
    "--dry-run"]);
}
