import assert from "node:assert/strict";
import test from "node:test";
import { createSignupTestBackend } from "./fixture.ts";

const direct = {
  serviceType: "direct_application", chineseName: "本地測試", email: "local@example.invalid", phone: "0900000000",
  currentLocation: "台灣", preferredCity: "Dublin", preferredSchool: "ISI Dublin", courseType: "25+8 長期語言課程",
  expectedStartMonth: "2027-01", courseDuration: "25+8 課程", classSchedule: "上午", accommodationNeeded: "不需要",
  budgetRange: "NT$200,000–250,000", decisionStage: "已確認", agreements: { terms: true, isic: true },
  turnstileToken: "local-fixture-token", utmSource: "local-qa", gclid: "fixture",
  landingPageUrl: "https://lilaiireland.com/language-school-signup/?utm_source=local-qa#form",
};

test("migrated Worker uses real local D1, API, Queue and Cron with blocked external egress", async t => {
  const { mf, db, state } = await createSignupTestBackend();
  const worker = await mf.getWorker();
  const id = crypto.randomUUID();
  const post = (body, key = id) => mf.dispatchFetch("http://localhost/language-school-signup/api/applications", {
    method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(body),
  });
  const admin = (path = "", init = {}) => mf.dispatchFetch("http://localhost/api/admin/applications" + path, {
    ...init, headers: { "Authorization": "Bearer local-admin-fixture", "Content-Type": "application/json" },
  });
  const jobs = async (applicationId = id) => (await db.prepare("SELECT * FROM integration_jobs WHERE application_id = ?1").bind(applicationId).all()).results;
  const queue = (applicationId = id) => worker.queue("signup-test", [{ id: crypto.randomUUID(), timestamp: new Date(), attempts: 1, body: { applicationId } }]);
  try {
    await t.test("routing and request guards preserve original status codes", async () => {
      assert.equal((await mf.dispatchFetch("http://localhost/language-school-signup/api/turnstile-config")).status, 200);
      assert.equal((await mf.dispatchFetch("http://localhost/api/applications")).status, 405);
      assert.equal((await mf.dispatchFetch("http://localhost/language-school-signup/api/admin/applications")).status, 404);
      assert.equal((await mf.dispatchFetch("http://localhost/api/unknown")).status, 404);
      assert.equal((await mf.dispatchFetch("http://localhost/other")).status, 404);
      const localPage = await mf.dispatchFetch("http://localhost/language-school-signup/?utm_source=test");
      assert.equal(localPage.status, 200);
      assert.equal(localPage.headers.get("x-robots-tag"), "noindex, nofollow");
      assert.equal(state.platformRequests[0], "http://localhost/language-school-signup/?utm_source=test");
      assert.equal((await mf.dispatchFetch("https://lilaiireland.com/language-school-signup/")).headers.get("x-robots-tag"), null);
      assert.equal((await mf.dispatchFetch("https://site-creator-vinext-starter.lilaiireland.workers.dev/language-school-signup/")).headers.get("x-robots-tag"), "noindex, nofollow");
      assert.equal(await (await mf.dispatchFetch("http://localhost/language-school-signup/", { method: "HEAD" })).text(), "");
      assert.equal((await mf.dispatchFetch("http://localhost/language-school-signup/", { method: "POST" })).status, 404);
      assert.equal((await mf.dispatchFetch("http://localhost/api/applications", { method: "POST", body: "{}" })).status, 415);
      assert.equal((await mf.dispatchFetch("http://localhost/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" })).status, 400);
      assert.equal((await mf.dispatchFetch("http://localhost/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: "x".repeat(33000) })).status, 413);
    });
    await t.test("Turnstile and validation reject before D1 or Queue writes", async () => {
      for (const token of ["", "invalid", "wrong-action", "wrong-host", "unavailable"]) assert.equal((await post({ ...direct, turnstileToken: token })).status, 403);
      assert.equal((await post({ ...direct, preferredCity: "尚未確定" })).status, 422);
      assert.equal((await post({ ...direct, agreements: { terms: true } })).status, 422);
      assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM applications").first()).n, 0);
      assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM integration_jobs").first()).n, 0);
    });
    await t.test("direct submission is atomic, assigns the existing ST code and deduplicates", async () => {
      const response = await post(direct);
      assert.equal(response.status, 201);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.deepEqual(await response.json(), { ok: true, submissionId: "ST-000001", duplicate: false });
      const row = await db.prepare("SELECT * FROM applications WHERE id = ?1").bind(id).first();
      assert.equal(row.utm_source, "local-qa");
      assert.equal(row.gclid, "fixture");
      assert.equal(row.landing_page_url, "https://lilaiireland.com/language-school-signup/");
      assert.equal(row.isic_initially_eligible, 1);
      assert.equal((await jobs()).length, 3);
      assert.equal((await post(direct)).status, 200);
      assert.equal((await jobs()).length, 3);
      assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM applications").first()).n, 1);
    });
    await t.test("consultation removes stale direct fields and admin auth/update still work", async () => {
      const consultationId = crypto.randomUUID();
      assert.equal((await post({ ...direct, serviceType: "consultation", consultationGoal: "比較城市", preferredCity: "尚未確定" }, consultationId)).status, 201);
      const row = await db.prepare("SELECT * FROM applications WHERE id = ?1").bind(consultationId).first();
      assert.equal(row.reference_code, "ST-000002");
      assert.equal(row.preferred_school, "");
      assert.equal(row.decision_stage, "");
      assert.equal(row.isic_initially_eligible, 0);
      assert.equal(JSON.parse(row.agreements_json).isic, undefined);
      assert.equal((await mf.dispatchFetch("http://localhost/api/admin/applications")).status, 401);
      const list = await (await admin("?q=ST-000001")).json();
      assert.equal(list.total, 1);
      assert.equal(list.applications[0].id, id);
      assert.equal((await admin("/" + id, { method: "PATCH", body: JSON.stringify({ crmStatus: "contacted", internalNotes: "本地 QA" }) })).status, 200);
      assert.equal((await (await admin("/" + id)).json()).application.crm_status, "contacted");
      assert.equal((await admin("/" + id, { method: "PATCH", body: JSON.stringify({ email: "forbidden@example.invalid" }) })).status, 422);
    });
    await t.test("Queue completes three jobs and redelivery does not send them again", async () => {
      assert.equal((await queue()).outcome, "ok");
      assert((await jobs()).every(row => row.status === "succeeded" && row.attempts === 1));
      assert.equal(state.gmailSends, 2);
      assert.equal(state.notionCreates, 1);
      await queue();
      assert.equal(state.gmailSends, 2);
      assert.equal(state.notionCreates, 1);
    });
    await t.test("provider failure retries, Cron reconciles, and fifth failure becomes dead letter", async () => {
      const retryId = crypto.randomUUID();
      await post(direct, retryId);
      state.emailStatus = 503;
      state.existingNotionPage = true;
      const first = await queue(retryId);
      assert.equal(first.retryMessages.length, 1);
      let rows = await jobs(retryId);
      assert.equal(rows.filter(row => row.status === "failed" && row.attempts === 1 && row.next_retry_at).length, 2);
      assert.equal(rows.find(row => row.job_type === "notion_sync").notion_page_id, "existing-local-page");
      await db.prepare("UPDATE integration_jobs SET next_retry_at = NULL WHERE application_id = ?1").bind(retryId).run();
      await worker.scheduled({ cron: "*/10 * * * *", scheduledTime: Date.now() });
      state.emailStatus = 200;
      await queue(retryId);
      rows = await jobs(retryId);
      assert(rows.every(row => row.status === "succeeded"));
      assert.equal(rows.find(row => row.job_type === "student_email").attempts, 2);
      await db.prepare("UPDATE integration_jobs SET status = 'processing', updated_at = '2000-01-01T00:00:00.000Z' WHERE application_id = ?1 AND job_type = 'student_email'").bind(retryId).run();
      await worker.scheduled({ cron: "*/10 * * * *", scheduledTime: Date.now() });
      assert.equal((await jobs(retryId)).find(row => row.job_type === "student_email").status, "failed");
      await db.prepare("UPDATE integration_jobs SET status = 'failed', attempts = 4, next_retry_at = NULL WHERE application_id = ?1 AND job_type = 'student_email'").bind(retryId).run();
      state.emailStatus = 503;
      await queue(retryId);
      assert.equal((await jobs(retryId)).find(row => row.job_type === "student_email").status, "dead_letter");
      const sends = state.gmailSends;
      await queue(retryId);
      assert.equal(state.gmailSends, sends);
    });
    await t.test("global application rate limiter still returns 429 without writing", async () => {
      let status = 0;
      for (let i = 0; i < 31 && status !== 429; i++) status = (await post({ ...direct, turnstileToken: "" })).status;
      assert.equal(status, 429);
      assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM applications").first()).n, 3);
    });
    assert.deepEqual(state.unexpected, []);
  } finally {
    await mf.dispose();
  }
});
