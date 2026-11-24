import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

export const baseline = JSON.parse(readFileSync("cloudflare/production-baseline.json", "utf8"));
export const platformConfig = "cloudflare/production-platform.jsonc";
export const backendConfig = "cloudflare/signup-backend/wrangler.jsonc";
export const backend = JSON.parse(readFileSync(backendConfig, "utf8").replace(/^\/\/.*$/gm, ""));
export const production = backend.env.production;
export const root = `accounts/${baseline.account_id}`;
export const scriptPath = name => `${root}/workers/scripts/${name}`;
export const sorted = items => [...items].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
export const read = file => JSON.parse(readFileSync(file, "utf8"));
export function save(file, value) {
  mkdirSync(".cloudflare/release", { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}
export function run(args, env = {}) {
  const result = spawnSync(process.execPath, ["node_modules/wrangler/bin/wrangler.js", ...args], { stdio: "inherit", env: { ...process.env, ...env } });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `Wrangler ${args.slice(0, 2).join(" ")} failed`);
}
export function uploadedVersion(output, name) {
  const uploads = output.trim().split(/\r?\n/).map(line => JSON.parse(line))
    .filter(entry => entry.type === "version-upload");
  assert.equal(uploads.length, 1, "Expected one Wrangler version upload");
  assert.equal(uploads[0].version, 1, "Unsupported Wrangler output schema");
  assert.equal(uploads[0].worker_name, name, "Uploaded Worker mismatch");
  assert.match(uploads[0].version_id ?? "", /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i, "Missing/invalid uploaded version ID");
  return uploads[0].version_id;
}
export function assertCiRun(run, sha, workflow) {
  assert(run, `No main push CI run for ${workflow} at ${sha}`);
  assert.equal(run.head_sha, sha, "CI SHA mismatch");
  assert.equal(run.head_branch, "main");
  assert.equal(run.event, "push");
  assert.equal(run.path, `.github/workflows/${workflow}`);
  assert.equal(run.status, "completed", `${workflow}: CI is not complete`);
  assert.equal(run.conclusion, "success", `${workflow}: CI must pass before release`);
}
export async function api(path, body) {
  assert(process.env.CLOUDFLARE_API_TOKEN, "Cloudflare token required");
  // The only write allowed here is a Worker version activation; D1 is SELECT-only.
  if (body) assert([baseline.platform, baseline.backend].some(name => path === `${scriptPath(name)}/deployments`) ||
    (path === `${root}/d1/database/${baseline.database_id}/query` &&
      body.sql === "SELECT id, name, applied_at FROM d1_migrations ORDER BY id"), "Forbidden API mutation");
  const response = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000),
  });
  const value = await response.json();
  assert(response.ok && value.success, `Cloudflare ${path}: HTTP ${response.status}; codes ${value.errors?.map(e => e.code)}`);
  return value.result;
}
export async function github(path) {
  const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/${path}`, {
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(30000),
  });
  assert(response.ok, `GitHub ${path}: HTTP ${response.status}`);
  return response.json();
}
export function migrationHashes() {
  return Object.fromEntries(readdirSync("migrations/signup").filter(f => f.endsWith(".sql")).sort().map(f =>
    [f, createHash("sha256").update(readFileSync(`migrations/signup/${f}`, "utf8").replaceAll("\r\n", "\n")).digest("hex")]));
}
export function activeVersion(value) {
  const versions = value.deployments[0]?.versions;
  assert(versions?.length === 1 && versions[0].percentage === 100, "Split/missing deployment: stop release");
  return versions[0].version_id;
}
export function assertMigrations(history, hashes) {
  assert.deepEqual(history, baseline.migrations, "Migration history changed: separate backup/compatibility approval required");
  assert.deepEqual(hashes, baseline.migration_hashes, "Migration added/edited: release cannot apply schema changes");
}
export function assertConfigs() {
  const platform = read(platformConfig);
  assert.equal(platform.name, baseline.platform);
  assert.equal(platform.account_id, baseline.account_id);
  assert.equal(platform.main, "production-platform-worker.ts");
  assert.equal(platform.assets.binding, "ASSETS");
  assert.equal(platform.assets.directory, "../.open-next/assets");
  assert.deepEqual(platform.routes, []);
  assert.equal(platform.workers_dev, false);
  assert.equal(platform.preview_urls, false);
  assert.equal(platform.vars.NEXT_PUBLIC_SITE_URL, "https://lilaiireland.com");
  assert.equal(platform.vars.NEXT_PUBLIC_GA4_MEASUREMENT_ID, "G-06M3GS0WS0");
  assert.equal(backend.main, "../../worker/signup/index.ts");
  assert.equal(production.name, baseline.backend);
  assert.equal(production.d1_databases.length, 1);
  assert.equal(production.d1_databases[0].database_id, baseline.database_id);
  assert.equal(production.d1_databases[0].database_name, baseline.database_name);
  assert.deepEqual(production.services, [{ binding: "PLATFORM", service: baseline.platform }]);
  assert.deepEqual(production.routes.map(({ pattern }) => pattern).sort(), baseline.routes.filter(r => r.script === baseline.backend).map(r => r.pattern).sort());
  assert.deepEqual(production.queues.producers, [{ binding: "INTEGRATION_QUEUE", queue: "lilai-application-integrations" }]);
  assert.deepEqual(production.queues.consumers, [{ queue: "lilai-application-integrations", dead_letter_queue: "lilai-application-integrations-dlq", max_batch_size: 5, max_batch_timeout: 5, max_retries: 5, retry_delay: 60 }]);
  assert.deepEqual(production.triggers.crons, ["*/10 * * * *"]);
  assert.deepEqual(production.ratelimits, [{ name: "APPLICATION_RATE_LIMITER", namespace_id: "76082801", simple: { limit: 30, period: 60 } }]);
  assert.deepEqual([...production.secrets.required].sort(), ["ADMIN_API_TOKEN", "GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN", "GMAIL_SENDER_EMAIL", "NOTION_TOKEN", "NOTION_DATABASE_ID", "TURNSTILE_SECRET", "TURNSTILE_SITE_KEY", "TURNSTILE_HOSTNAMES"].sort());
  assert(!/staging|mock/i.test(JSON.stringify(production)), "Production config references staging/mock");
}
export function assertInfrastructure(snapshot, first = false) {
  assert.deepEqual(sorted(snapshot.routes), sorted(baseline.routes), "Route drift: stop; do not repair routes here");
  assert.deepEqual(snapshot.domains, [], "Unexpected custom domain");
  assert.equal(snapshot.database.uuid, baseline.database_id);
  assert.equal(snapshot.database.name, baseline.database_name);
  assertMigrations(snapshot.migrations, snapshot.migrationHashes);
  for (const name of [baseline.platform, baseline.backend, baseline.router]) {
    const worker = snapshot.workers[name];
    assert(!/staging|mock/i.test(JSON.stringify(worker.bindings)), `${name}: unexpected staging/mock binding`);
    assert.deepEqual(worker.exposure, baseline.exposure[name], `${name}: unexpected public exposure`);
    assert.deepEqual(worker.crons, name === baseline.backend ? production.triggers.crons : [], `${name}: Cron drift`);
  }
  const bindings = snapshot.workers[baseline.backend].bindings;
  for (const name of production.secrets.required) assert(bindings.some(b => b.name === name && b.type === "secret_text"), `Missing secret name ${name}`);
  assert.equal(bindings.find(b => b.name === "DB")?.id, baseline.database_id);
  assert.equal(bindings.find(b => b.name === "INTEGRATION_QUEUE")?.queue_name, production.queues.producers[0].queue);
  const limiter = bindings.find(b => b.name === "APPLICATION_RATE_LIMITER");
  assert.equal(limiter?.namespace_id, production.ratelimits[0].namespace_id);
  assert.deepEqual(limiter.simple, production.ratelimits[0].simple);
  const service = bindings.find(b => b.name === "PLATFORM");
  if (first) assert.equal(service, undefined, "First cutover requires the audited legacy backend");
  else {
    assert.equal(service?.service, baseline.platform, "Backend PLATFORM binding mismatch");
    assert(!service.environment || service.environment === "production", "Backend PLATFORM environment mismatch");
  }
  const routerService = snapshot.workers[baseline.router].bindings.find(b => b.name === "PLATFORM");
  assert.equal(routerService?.service, baseline.platform);
  assert(!routerService.environment || routerService.environment === "production", "Router PLATFORM environment mismatch");
  assert(snapshot.workers[baseline.platform].bindings.some(b => b.name === "ASSETS" && b.type === "assets"), "Platform Static Assets binding missing");
  for (const [name, id] of Object.entries(baseline.queues)) {
    const queue = snapshot.queues.find(q => q.queue_name === name);
    assert.equal(queue?.queue_id, id, `Queue identity drift: ${name}`);
    if (name.endsWith("-dlq")) {
      assert.deepEqual(queue.consumers, []);
      assert.deepEqual(queue.producers, []);
    } else {
      assert.deepEqual(queue.producers.map(p => ({ script: p.script, type: p.type })), [{ script: baseline.backend, type: "worker" }]);
      assert.equal(queue.consumers.length, 1);
      const consumer = queue.consumers[0];
      assert.equal(consumer.script, baseline.backend);
      assert.equal(consumer.dead_letter_queue, production.queues.consumers[0].dead_letter_queue);
      assert.deepEqual(consumer.settings, { batch_size: 5, max_retries: 5, max_wait_time_ms: 5000, retry_delay: 60 });
    }
  }
}
export async function capture() {
  const workers = {};
  // Sequential requests keep the inventory below Cloudflare API burst limits.
  for (const name of [baseline.platform, baseline.backend, baseline.router]) {
    const prefix = scriptPath(name);
    const version = activeVersion(await api(`${prefix}/deployments`));
    const active = await api(`${prefix}/versions/${version}`);
    const bindings = active.resources.bindings.map(binding => {
      // Never persist plaintext variables or any secret material.
      const { text, json, ...safe } = binding;
      return safe;
    });
    workers[name] = { version, bindings,
      crons: (await api(`${prefix}/schedules`)).schedules.map(s => s.cron).sort(),
      exposure: await api(`${prefix}/subdomain`) };
  }
  const query = await api(`${root}/d1/database/${baseline.database_id}/query`, {
    sql: "SELECT id, name, applied_at FROM d1_migrations ORDER BY id",
  });
  assert(query[0]?.success, "D1 migration SELECT failed");
  const queues = [];
  for (const id of Object.values(baseline.queues)) queues.push(await api(`${root}/queues/${id}`));
  return { capturedAt: new Date().toISOString(), commit: null, executionCommit: process.env.GITHUB_SHA, workers,
    routes: (await api(`zones/${baseline.zone_id}/workers/routes`)).map(({ pattern, script }) => ({ pattern, script })),
    domains: (await api(`${root}/workers/domains`)).filter(d => Object.keys(workers).includes(d.service)),
    database: await api(`${root}/d1/database/${baseline.database_id}`),
    migrations: query[0].results, migrationHashes: migrationHashes(), queues };
}
export function assertSource() {
  assertConfigs();
  assert.equal(process.env.GITHUB_EVENT_NAME, "workflow_dispatch");
  assert.equal(process.env.GITHUB_REF, "refs/heads/main");
  assert.match(process.env.GITHUB_SHA ?? "", /^[a-f0-9]{40}$/);
  const head = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  assert.equal(head.status, 0);
  assert.equal(head.stdout.trim(), process.env.GITHUB_SHA, "Checkout SHA mismatch");
  assert.equal(process.env.CLOUDFLARE_ACCOUNT_ID, baseline.account_id);
}
