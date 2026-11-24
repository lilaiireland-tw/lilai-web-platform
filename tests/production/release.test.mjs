import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { baseline, production, migrationHashes, assertMigrations, assertInfrastructure, activeVersion, assertConfigs, api, root } from "../../scripts/production/lib.mjs";
import { assetPaths, assertPage, publicSmoke, request } from "../../scripts/production/smoke.mjs";
import probe from "../../cloudflare/production-release-probe.js";

function fixture(first = false) {
  const bindings = [
    ...production.secrets.required.map(name => ({ name, type: "secret_text" })),
    { name: "DB", type: "d1", id: baseline.database_id },
    { name: "INTEGRATION_QUEUE", type: "queue", queue_name: production.queues.producers[0].queue },
    { name: "APPLICATION_RATE_LIMITER", type: "ratelimit", namespace_id: "76082801", simple: { limit: 30, period: 60 } },
    ...(!first ? [{ name: "PLATFORM", type: "service", service: baseline.platform }] : []),
  ];
  return { routes: structuredClone(baseline.routes), domains: [], database: { uuid: baseline.database_id, name: baseline.database_name },
    migrations: structuredClone(baseline.migrations), migrationHashes: migrationHashes(),
    workers: Object.fromEntries([baseline.platform, baseline.backend, baseline.router].map(name => [name, {
      exposure: structuredClone(baseline.exposure[name]), crons: name === baseline.backend ? ["*/10 * * * *"] : [],
      bindings: name === baseline.backend ? bindings : name === baseline.platform ? [{ name: "ASSETS", type: "assets" }] : [{ name: "PLATFORM", type: "service", service: baseline.platform }],
    }])), queues: Object.entries(baseline.queues).map(([queue_name, queue_id]) => ({ queue_name, queue_id,
      producers: queue_name.endsWith("-dlq") ? [] : [{ script: baseline.backend, type: "worker" }],
      consumers: queue_name.endsWith("-dlq") ? [] : [{ script: baseline.backend, dead_letter_queue: "lilai-application-integrations-dlq",
        settings: { batch_size: 5, max_retries: 5, max_wait_time_ms: 5000, retry_delay: 60 } }],
    })) };
}
test("production drift fails closed; cutover and integrated states are distinct", () => {
  assertInfrastructure(fixture());
  assertInfrastructure(fixture(true), true);
  assert.throws(() => assertInfrastructure(fixture(true)), /binding mismatch/);
  assert.throws(() => assertInfrastructure(fixture(), true), /audited legacy/);
  const mutations = [
    s => s.routes.pop(), s => s.domains.push({ service: baseline.platform }),
    s => { s.database.uuid = "staging"; }, s => { s.workers[baseline.backend].exposure.enabled = false; },
    s => { s.workers[baseline.backend].crons = []; }, s => s.workers[baseline.backend].bindings.shift(),
    s => { s.workers[baseline.backend].bindings.find(b => b.name === "PLATFORM").service = "staging"; },
    s => { s.queues[0].queue_id = "new"; }, s => { s.queues[0].consumers[0].settings.max_retries = 0; },
    s => s.migrations.pop(), s => { s.migrationHashes.new = "new"; },
  ];
  for (const mutate of mutations) { const s = fixture(); mutate(s); assert.throws(() => assertInfrastructure(s)); }
});
test("applied migrations cannot be edited; split deployments stop releases", () => {
  assertConfigs();
  assertMigrations(baseline.migrations, migrationHashes());
  assert.throws(() => assertMigrations(baseline.migrations, {}));
  assert.equal(activeVersion({ deployments: [{ versions: [{ version_id: "v1", percentage: 100 }] }] }), "v1");
  assert.throws(() => activeVersion({ deployments: [{ versions: [{ percentage: 50 }, { percentage: 50 }] }] }));
});
test("Cloudflare helper rejects all writes except exact migration SELECT and version activation", async () => {
  const previous = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "mock-token";
  try {
    await assert.rejects(() => api(`${root}/queues`, { queue_name: "new" }), /Forbidden API mutation/);
    await assert.rejects(() => api(`${root}/workers/scripts/${baseline.router}/deployments`, {}), /Forbidden API mutation/);
    await assert.rejects(() => api(`${root}/d1/database/${baseline.database_id}/query`, { sql: "DELETE FROM applications" }), /Forbidden API mutation/);
  } finally {
    if (previous === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = previous;
  }
});
test("SEO and asset guards reject noindex and unrelated origins", () => {
  const home = { status: 200, type: "text/html", body: '<link rel="canonical" href="https://lilaiireland.com">' };
  assertPage(home, "/");
  assert.throws(() => assertPage({ ...home, body: home.body.replace('.com"', '.com/"') }, "/"), /canonical changed/);
  const body = '<link rel="canonical" href="https://lilaiireland.com/language-school-signup/"><script src="/_next/static/app.js"></script><img src="https://outside.invalid/assets/a.png">';
  assertPage({ status: 200, type: "text/html", body }, "/language-school-signup/");
  assert.throws(() => assertPage({ status: 200, type: "text/html", body: body.replace('signup/"', 'signup"') }, "/language-school-signup/"), /canonical changed/);
  assert.deepEqual(assetPaths(body), ["/_next/static/app.js"]);
  assert.throws(() => assertPage({ status: 200, type: "text/html", body, robots: "noindex" }, "/language-school-signup/"));
});
test("mock smoke only sends empty refusal POST and blocks offsite redirects", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(input);
    calls.push({ url, init });
    const path = url.pathname;
    if (path === "/offsite") return new Response(null, { status: 302, headers: { location: "https://outside.invalid" } });
    if (path === "/language-school-signup") return new Response(null, { status: 301, headers: { location: `/language-school-signup/${url.search}` } });
    if (path.endsWith("/applications")) {
      assert.equal(init.method, "POST"); assert.equal(init.body, "{}");
      return Response.json({ error: { code: "turnstile_failed" } }, { status: 403 });
    }
    if (path.endsWith("/turnstile-config")) return Response.json({ siteKey: "mock", action: "application_submit" });
    if (path === "/wp-json/") return Response.json({ namespaces: [] });
    if (path.startsWith("/_next/")) return new Response(init.method === "HEAD" ? null : "asset", { headers: { "content-type": "text/javascript" } });
    return new Response(init.method === "HEAD" ? null : `<link rel="canonical" href="https://lilaiireland.com${path === "/" ? "" : path}"><script src="/_next/static/app.js"></script>`, { headers: { "content-type": "text/html" } });
  };
  try {
    const smoke = await publicSmoke();
    await publicSmoke({ previous: smoke });
    assert.equal(calls.filter(c => c.init.method === "POST").length, 2);
    assert(calls.every(c => c.url.origin === "https://lilaiireland.com"));
    await assert.rejects(() => request("/offsite"), /outside production/);
  } finally { globalThis.fetch = original; }
});
test("local binding probe permits page/asset GET and HEAD, blocks mutations and APIs", async () => {
  const calls = [];
  const binding = { fetch: async req => { calls.push(req); return new Response(null, { status: 200 }); } };
  const env = { PLATFORM: binding, SIGNUP: binding };
  for (const path of ["/platform/language-school-signup/", "/signup/language-school-signup/", "/platform/_next/static/a.js"]) {
    assert.equal((await probe.fetch(new Request(`http://localhost${path}`, { method: "HEAD" }), env)).status, 200);
  }
  assert(calls.every(req => req.url.startsWith("https://lilaiireland.com/") && req.method === "HEAD"));
  for (const [path, method] of [["/signup/language-school-signup/", "POST"], ["/signup/language-school-signup/api/admin/applications", "GET"], ["/platform/wp-admin/", "GET"]]) {
    assert.equal((await probe.fetch(new Request(`http://localhost${path}`, { method }), env)).status, 405);
  }
  assert.equal(calls.length, 3);
});
test("workflow saves recovery evidence before activation; release code never reconciles triggers", () => {
  const source = readFileSync("scripts/production/release.mjs", "utf8");
  assert(source.includes('const token = await api(`accounts/${baseline.account_id}/tokens/verify`);'));
  assert(source.includes('assert.equal(token.status, "active", "Cloudflare token is inactive");'));
  assert.doesNotMatch(source, /user\/tokens\/verify/);
  assert.match(source, /run\(\["versions", "upload"/);
  assert.doesNotMatch(source, /run\(\["deploy"|migrations.*apply|secret.*put/);
  const workflow = readFileSync(".github/workflows/production-deploy.yml", "utf8");
  const steps = ["name: Validate", "name: Preflight", "name: production-evidence", "name: Deploy Platform", "name: Deploy Signup Backend", "name: Verify Production", "name: production-verified", "name: Release Summary"];
  const positions = steps.map(step => workflow.indexOf(step));
  assert(positions.every(p => p >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});
