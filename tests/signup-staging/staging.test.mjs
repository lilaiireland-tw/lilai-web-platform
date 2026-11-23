import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createStagingFixture } from "./fixture.mjs";
import { forwardStagingSignupRequest, STAGING_SIGNUP_ORIGIN as origin, SIGNUP_APPLICATIONS_PATH as path } from "../../cloudflare/staging-signup.ts";
import { assertStagingSignupConfig } from "../../scripts/staging-signup-config.ts";

const direct = {
  serviceType: "direct_application", chineseName: "測試", email: "qa@example.invalid", phone: "0900000000",
  currentLocation: "台灣", preferredCity: "Dublin", preferredSchool: "ISI Dublin", courseType: "25+8 長期語言課程",
  expectedStartMonth: "2027-01", courseDuration: "25+8 課程", classSchedule: "上午", accommodationNeeded: "不需要",
  budgetRange: "已確認", decisionStage: "已確認", agreements: { terms: true, isic: true },
};
const headers = key => ({ "Content-Type": "application/json", "Idempotency-Key": key, Origin: origin });
const token = () => "valid-" + crypto.randomUUID();

test("staging deployment contract fixes both service targets and only the staging database", () => {
  assertStagingSignupConfig();
  const platform = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
  const backend = JSON.parse(readFileSync("cloudflare/signup-staging.jsonc", "utf8"));
  for (const patch of [
    { name: "site-creator-vinext-starter" },
    { main: "../worker/signup/index.ts" },
    { d1_databases: [{ ...backend.d1_databases[0], database_name: "lilai-applications-production" }] },
    { d1_databases: [{ ...backend.d1_databases[0], database_id: "wrong-id" }] },
    { services: [{ binding: "PLATFORM", service: "lilai-web-platform-production" }] },
    { queues: { producers: [{ binding: "INTEGRATION_QUEUE", queue: "lilai-application-integrations" }], consumers: [] } },
    { triggers: { crons: ["*/10 * * * *"] } }, { workers_dev: true },
  ]) assert.throws(() => assertStagingSignupConfig(platform, { ...backend, ...patch }));
});

test("staging proxy fails closed, strips credentials, preserves errors and never retries POST", async () => {
  const request = () => new Request(origin + path, { method: "POST", headers: { ...headers(crypto.randomUUID()), Authorization: "Bearer must-not-forward", Cookie: "must-not-forward=1" }, body: "{}" });
  assert.equal((await forwardStagingSignupRequest(request())).status, 503);
  let calls = 0;
  const unavailable = await forwardStagingSignupRequest(request(), { fetch: async forwarded => {
    calls++;
    assert.equal(forwarded.headers.get("Authorization"), null);
    assert.equal(forwarded.headers.get("Cookie"), null);
    throw Error("private detail");
  } });
  assert.equal(unavailable.status, 503);
  assert.equal(calls, 1);
  assert(!(await unavailable.text()).includes("private detail"));
  const redirect = await forwardStagingSignupRequest(request(), { fetch: async () => new Response(null, { status: 302, headers: { Location: "https://lilaiireland.com" } }) });
  assert.equal(redirect.status, 502);
  assert.equal(redirect.headers.get("Location"), null);
  const limited = await forwardStagingSignupRequest(request(), { fetch: async () => Response.json({ error: "limited" }, { status: 429, headers: { "Retry-After": "60" } }) });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("Retry-After"), "60");
  assert.equal(limited.headers.get("Cache-Control"), "no-store");
});

test("actual staging Workers exchange requests over Service Bindings and use local simulated staging D1", async t => {
  const { mf, db, state, backend } = await createStagingFixture();
  const fetch = (url, init) => mf.dispatchFetch(origin + url, init);
  const post = (body, key = crypto.randomUUID(), extra = {}) => fetch(path, { method: "POST", headers: { ...headers(key), ...extra }, body: JSON.stringify(body) });
  const count = async () => (await db.prepare("SELECT COUNT(*) AS n FROM applications").first()).n;
  try {
    await t.test("exact pages/assets are allowed; static assets cannot expose WordPress or admin routes", async () => {
      for (const url of ["/language-school-signup/", "/language-school-signup/og.png", "/language-school-signup/favicon.svg", "/language-school-signup/lilai-assets/schools/logo-atc-language-schools.png", "/_next/static/fixture.js", "/fonts/fixture.woff2"]) {
        const r = await fetch(url);
        assert.equal(r.status, 200, url);
        assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
      }
      for (const url of ["/language-school-signup-other", "/language-school-signup/wp-admin/", "/language-school-signup/api/admin/applications", "/api/admin/applications", "/wp-json/", "/checkout/", "/about/"]) {
        const before = state.assets.length;
        assert.equal((await fetch(url)).status, 503, url);
        assert.equal(state.assets.length, before, "blocked paths must never reach assets or Next");
        assert.equal((await fetch(url, { method: "POST", body: "{}" })).status, 405);
      }
      assert.match(await (await backend.fetch(origin + "/language-school-signup/")).text(), /frontend fixture/);
      assert.equal((await backend.fetch(origin + "/api/admin/applications")).status, 404);
    });
    await t.test("GET config works but methods, origin, content type, size and UUID are guarded", async () => {
      const config = await fetch("/language-school-signup/api/turnstile-config");
      assert.deepEqual(await config.json(), { siteKey: "stage-fixture", action: "application_submit" });
      for (const method of ["GET", "HEAD", "PUT", "DELETE", "OPTIONS"]) assert.equal((await fetch(path, { method })).status, 405);
      assert.equal((await post(direct, crypto.randomUUID(), { Origin: "https://lilaiireland.com" })).status, 403);
      assert.equal((await post(direct, crypto.randomUUID(), { Origin: "" })).status, 403);
      assert.equal((await post(direct, crypto.randomUUID(), { "Sec-Fetch-Site": "cross-site" })).status, 403);
      assert.equal((await post(direct, crypto.randomUUID(), { "Content-Type": "text/plain" })).status, 415);
      assert.equal((await post(direct, "not-a-uuid")).status, 400);
      assert.equal((await post({ additionalNotes: "x".repeat(33000) })).status, 413);
      const oversized = new Request(origin + path, { method: "POST", headers: headers(crypto.randomUUID()), body: new ReadableStream({ start(c) { c.enqueue(new Uint8Array(33000)); c.close(); } }), duplex: "half" });
      assert.equal((await forwardStagingSignupRequest(oversized)).status, 413);
      assert.equal(state.siteverify, 0);
      assert.equal(await count(), 0);
    });
    await t.test("Turnstile host/action/replay, invalid JSON and schema errors never write D1", async () => {
      for (const value of ["", "invalid", "valid-wrong-host", "valid-wrong-action", "unavailable"]) {
        assert.equal((await post({ ...direct, turnstileToken: value })).status, 403);
      }
      assert.equal((await fetch(path, { method: "POST", headers: headers(crypto.randomUUID()), body: "{" })).status, 400);
      assert.equal((await post({ ...direct, turnstileToken: token(), email: "invalid" })).status, 422);
      assert.equal((await post({ ...direct, turnstileToken: token(), preferredCity: "尚未確定" })).status, 422);
      assert.equal(await count(), 0);
    });
    await t.test("POST persists original ST codes and jobs; fresh-token duplicate is idempotent; notifications remain mocked", async () => {
      const key = crypto.randomUUID();
      const used = token();
      const created = await post({ ...direct, turnstileToken: used }, key);
      assert.equal(created.status, 201);
      assert.deepEqual(await created.json(), { ok: true, submissionId: "ST-000001", duplicate: false });
      assert.equal((await post({ ...direct, turnstileToken: used }, key)).status, 403, "spent token must fail before deduplication");
      const duplicate = await post({ ...direct, turnstileToken: token() }, key);
      assert.equal(duplicate.status, 200);
      assert.equal((await duplicate.json()).duplicate, true);
      const consult = await post({ ...direct, serviceType: "consultation", consultationGoal: "比較城市", preferredCity: "尚未確定", turnstileToken: token() });
      assert.equal(consult.status, 201);
      assert.equal((await consult.json()).submissionId, "ST-000002");
      assert.equal(await count(), 2);
      const jobs = await db.prepare("SELECT * FROM integration_jobs").all();
      assert.equal(jobs.results.length, 6);
      assert(jobs.results.every(row => row.status === "pending" && row.attempts === 0));
      assert.deepEqual(state.unexpected, []);
    });
    await t.test("D1 batch failures roll back application/jobs and a fresh-token retry succeeds", async () => {
      const key = crypto.randomUUID();
      await db.prepare("CREATE TRIGGER qa_fail_job BEFORE INSERT ON integration_jobs BEGIN SELECT RAISE(ABORT, 'local fixture failure'); END").run();
      const failure = await post({ ...direct, turnstileToken: token() }, key);
      assert.equal(failure.status, 500);
      assert.equal((await failure.json()).error.code, "application_create_failed");
      assert.equal(await count(), 2);
      assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM integration_jobs").first()).n, 6);
      await db.prepare("DROP TRIGGER qa_fail_job").run();
      assert.equal((await post({ ...direct, turnstileToken: token() }, key)).status, 201);
      assert.equal(await count(), 3);
    });
    await t.test("backend rate limiting still returns 429 and Retry-After", async () => {
      let response;
      for (let i = 0; i < 31; i++) {
        response = await post({ ...direct, turnstileToken: "" });
        if (response.status === 429) break;
      }
      assert.equal(response.status, 429);
      assert.equal(response.headers.get("Retry-After"), "60");
      assert.equal(await count(), 3);
    });
    assert.deepEqual(state.unexpected, []);
  } finally { await mf.dispose(); }
});
