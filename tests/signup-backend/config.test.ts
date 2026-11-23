import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function config() {
  return JSON.parse((await readFile("cloudflare/signup-backend/wrangler.jsonc", "utf8")).replace(/^\/\/.*$/gm, ""));
}

test("default local and staging cannot use production signup resources or consumers", async () => {
  const local = await config();
  const production = local.env.production;
  for (const isolated of [local, local.env.staging]) {
    assert.deepEqual(isolated.routes, []);
    assert.deepEqual(isolated.queues.consumers, []);
    assert.deepEqual(isolated.triggers.crons, []);
    assert.deepEqual(isolated.secrets.required, []);
    assert.notEqual(isolated.d1_databases[0].database_id, production.d1_databases[0].database_id);
    assert.notEqual(isolated.queues.producers[0].queue, production.queues.producers[0].queue);
    assert.notEqual(isolated.ratelimits[0].namespace_id, production.ratelimits[0].namespace_id);
    assert(!isolated.services);
  }
  assert.equal(local.d1_databases[0].remote, false);
  assert.equal(local.env.staging.vars.NEXT_PUBLIC_NOINDEX, "true");
});

test("future production config retains existing identity, data, queue, schedule, rate limit and routes", async () => {
  const local = await config();
  const production = local.env.production;
  assert.equal(local.compatibility_date, "2026-08-22");
  assert.equal(production.name, "site-creator-vinext-starter");
  assert.equal(production.d1_databases[0].database_id, "d7b4209c-fce2-4f0d-9b18-3f19c183b430");
  assert.equal(production.d1_databases[0].migrations_dir, "../../migrations/signup");
  assert.equal(production.queues.producers[0].queue, "lilai-application-integrations");
  assert.equal(production.queues.consumers[0].dead_letter_queue, "lilai-application-integrations-dlq");
  assert.equal(production.queues.consumers[0].max_retries, 5);
  assert.deepEqual(production.triggers.crons, ["*/10 * * * *"]);
  assert.equal(production.ratelimits[0].namespace_id, "76082801");
  assert.deepEqual(production.routes.map((route: { pattern: string }) => route.pattern), ["lilaiireland.com/language-school-signup", "lilaiireland.com/language-school-signup/*"]);
  assert.deepEqual(production.services, [{ binding: "PLATFORM", service: "lilai-web-platform-production" }]);
  assert.equal(production.secrets.required.length, 10);
});
