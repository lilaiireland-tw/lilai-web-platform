import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { createUnsubscribeToken, readUnsubscribeToken } from "../../src/lib/consult/unsubscribe-token";
import { unsubscribe } from "../../src/lib/consult/unsubscribe";
import { productionRouteOwner } from "../../cloudflare/production-routing-policy";
import { CONSULT_UNSUBSCRIBE_PATH } from "../../src/lib/consult/ack";
import { harness, payload, secret, id, source, Sheet } from "./gas-harness";

const key = "a1".repeat(32);
const config = { secret: key, credential: secret, endpoint: "https://script.google.com/macros/s/ISOLATED/exec" };
const url = `https://lilaiireland.com${CONSULT_UNSUBSCRIBE_PATH}`;
const post = (token: string, extra = "", origin = "https://lilaiireland.com") => new Request(url, { method: "POST", headers: { origin, "content-type": "application/x-www-form-urlencoded" }, body: `token=${token}&confirm=unsubscribe${extra}` });
function submit(h: ReturnType<typeof harness>, changes: Record<string, unknown> = {}) {
  const data = { ...payload, marketingConsent: true, ...changes };
  const ack = h.post({ ...data, _serverCredential: secret });
  assert.equal(ack.status, "ok");
  const queue = h.sheets.get("報告佇列")!;
  return JSON.parse(queue.rows.find(row => row[0] === ack.jobId)![4]);
}
function cell(h: ReturnType<typeof harness>, submissionId: string, field: string, value?: unknown) {
  const sheet = h.sheets.get("填表資料")!;
  const row = sheet.rows.find(row => row[sheet.rows[0].indexOf("submissionId")] === submissionId)!;
  const index = sheet.rows[0].indexOf(field);
  assert.ok(index >= 0);
  if (arguments.length === 4) row[index] = value;
  return row[index];
}

test("#63 uses the exact PR75 baseline, candidate helper and no changed core function", () => {
  assert.ok(process.env.GAS_PR75_PATH, "Set explicit GAS_PR75_PATH; never skip private snapshot tests");
  const before = readFileSync(process.env.GAS_PR75_PATH, "utf8");
  assert.equal(createHash("sha256").update(before).digest("hex"), "04aeef14fab2af70d521233a3c60b4c4b02d5243cc6cf47e39f8dddfb502a343");
  const marker = "// Non-secret support functions appended";
  assert.equal(source.slice(0, source.indexOf(marker)), before.slice(0, before.indexOf(marker)));
  assert.ok(source.endsWith(readFileSync("scripts/gas/assessment-compat.js", "utf8").replace(/\r\n/g, "\n")));
});

test("purpose-bound opaque tokens validate; forged, feedback, raw IDs, other key and malformed tokens fail", async () => {
  const token = await createUnsubscribeToken(id, key);
  assert.equal(await readUnsubscribeToken(token, key), id);
  assert.equal(token.includes(id), false);
  assert.notEqual(token, await createUnsubscribeToken(id, key));
  for (const bad of [id, "feedback.v1|" + id, token.slice(0, -2) + "AA", token + "=", "<script>"]) await assert.rejects(readUnsubscribeToken(bad, key));
  await assert.rejects(readUnsubscribeToken(token, "b2".repeat(32)));
  await assert.rejects(createUnsubscribeToken(id, "short"));
  const cryptoKey = await crypto.subtle.importKey("raw", Buffer.from(key, "hex"), "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrongPurpose = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode("feedback.v1") }, cryptoKey, new TextEncoder().encode(id));
  await assert.rejects(readUnsubscribeToken(Buffer.concat([iv, Buffer.from(wrongPurpose)]).toString("base64url"), key));
});

test("GET/scanner only displays confirmation with no upstream calls or PII; invalid POST never reaches GAS", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => { calls++; return Response.json({ status: "ok" }); };
  const token = await createUnsubscribeToken(id, key);
  const response = await unsubscribe(new Request(`${url}?token=${token}`), config, upstream);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /method="post"/);
  for (const privateValue of [id, payload.email, secret, key, config.endpoint]) assert.equal(html.includes(privateValue), false);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.match(response.headers.get("content-security-policy")!, /default-src 'none'/);
  assert.equal((await unsubscribe(post(token, "", "https://other.test"), config, upstream)).status, 403);
  assert.equal((await unsubscribe(post(token, "&purpose=contact"), config, upstream)).status, 400);
  assert.equal((await unsubscribe(post("forged"), config, upstream)).status, 400);
  assert.equal((await unsubscribe(post(token, "&x=" + "x".repeat(600)), config, upstream)).status, 413);
  assert.equal(calls, 0);
});

test("explicit POST invokes actual protected GAS withdrawal; repeats preserve first time, service and contact", async () => {
  const h = harness(), data = submit(h), token = await createUnsubscribeToken(id, key);
  const originalTime = cell(h, id, "consentTimestamp");
  const upstream: typeof fetch = async (_target, init) => {
    const input = JSON.parse(String(init?.body));
    assert.equal(input.purpose, "marketing");
    return Response.json(h.post(input));
  };
  assert.equal((await unsubscribe(post(token), config, upstream)).status, 200);
  const first = cell(h, id, "marketingUnsubscribedAt");
  assert.ok(first);
  assert.equal((await unsubscribe(post(token), config, upstream)).status, 200);
  assert.equal(cell(h, id, "marketingUnsubscribedAt"), first);
  assert.equal(cell(h, id, "consentTimestamp"), originalTime);
  assert.equal(cell(h, id, "marketingConsent"), true);
  assert.equal(h.ctx.assessmentConsent(data, "marketing"), false);
  assert.equal(h.ctx.assessmentConsent(data, "contact"), true);
  h.ctx.sendEmailToUser(data, "https://drive.google.com/file/d/REVIEW_FAKE_PDF_123456789012345/view");
  assert.equal(h.mails.length, 1);
});

test("withdrawal failure, malformed ACK and missing config never claim success or leak upstream data", async () => {
  const token = await createUnsubscribeToken(id, key);
  for (const ack of [{ status: "error", error: payload.email }, { status: "ok", accepted: false }, { status: "ok", submissionId: randomUUID() }]) {
    const result = await unsubscribe(post(token), config, async () => Response.json(ack));
    assert.equal(result.status, 502);
    assert.equal((await result.text()).includes(payload.email), false);
  }
  assert.equal((await unsubscribe(post(token), { ...config, secret: undefined })).status, 503);
});

test("eligible minimal export deduplicates normalized Email; false/unknown/legacy/invalid evidence fail closed", () => {
  const h = harness(), data = submit(h);
  submit(h, { submissionId: randomUUID(), email: " QA@EXAMPLE.TEST " });
  assert.equal(h.ctx.exportAssessmentMarketingList().length, 1);
  assert.deepEqual(Object.keys(h.ctx.exportAssessmentMarketingList()[0]).sort(), ["email", "submissionId"]);
  for (const [field, value] of [["marketingConsent", false], ["marketingConsent", "true"], ["marketingConsentState", "unknown"], ["marketingConsentState", "withdrawn"], ["consentTimestamp", "invalid"], ["consentTimestamp", "2999-01-01T00:00:00.000Z"], ["consentSource", "other"], ["privacyNoticeVersion", "unapproved"], ["consentTextVersion", "other"], ["contractVersion", "legacy"]] as const) {
    const before = cell(h, id, field);
    cell(h, id, field, value);
    assert.equal(h.ctx.assessmentConsent(data, "marketing"), false, field);
    cell(h, id, field, before);
  }
  delete h.props.CONSULT_APPROVED_POLICY_VERSION;
  assert.equal(h.ctx.exportAssessmentMarketingList().length, 0);
});

test("contact-only is excluded; marketing-only has no individual follow-up; contact withdrawal preserves marketing", () => {
  const h = harness();
  const contact = submit(h, { marketingConsent: false });
  assert.equal(h.ctx.exportAssessmentMarketingList().length, 0);
  const marketing = submit(h, { submissionId: randomUUID(), email: "marketing@example.test", contactConsent: false });
  h.ctx.createCalendarEvent(marketing); h.ctx.create25plus8CalendarEvent(marketing); h.ctx.sendTeam25plus8Alert(marketing); h.ctx.send25plus8Greeting(marketing);
  assert.equal(h.events.length, 0); assert.equal(h.mails.length, 0);
  h.ctx.withdrawAssessmentConsent(contact.submissionId, "contact");
  assert.equal(h.ctx.assessmentConsent(marketing, "marketing"), true);
});

test("anonymous refill never clears normalized-email historical suppression; export rechecks current state", () => {
  const h = harness(), data = submit(h);
  assert.equal(h.ctx.exportAssessmentMarketingList().length, 1);
  h.ctx.withdrawAssessmentConsent(id, "marketing");
  const next = submit(h, { submissionId: randomUUID(), email: "QA@EXAMPLE.TEST" });
  assert.equal(h.ctx.assessmentConsent(next, "marketing"), false);
  assert.equal(h.ctx.exportAssessmentMarketingList().length, 0);
  assert.equal(h.ctx.assessmentConsent(data, "contact"), true);
});

test("controlled verified re-subscription appends evidence, preserves withdrawal, and later unsubscribe suppresses all rows again", () => {
  const h = harness(); submit(h);
  h.ctx.withdrawAssessmentConsent(id, "marketing");
  // Deterministic older withdrawal; no sleeping and no formal resource access.
  cell(h, id, "marketingUnsubscribedAt", "2025-01-01T00:00:00.000Z");
  const original = [...h.sheets.get("填表資料")!.rows[2]];
  const next = submit(h, { submissionId: randomUUID() });
  assert.equal(h.ctx.assessmentConsent(next, "marketing"), false);
  assert.throws(() => h.ctx.recordVerifiedMarketingResubscription(next.submissionId, "", "operator"));
  h.ctx.recordVerifiedMarketingResubscription(next.submissionId, "private-request-001", "alex-test");
  assert.equal(h.ctx.assessmentConsent(next, "marketing"), true);
  assert.deepEqual(h.sheets.get("填表資料")!.rows[2], original);
  assert.equal(h.sheets.get("行銷授權紀錄")!.rows.length, 2);
  assert.throws(() => h.ctx.recordVerifiedMarketingResubscription(next.submissionId, "private-request-001", "alex-test"));
  h.ctx.withdrawAssessmentConsent(id, "marketing"); // Old Email link still works after verified resubscription.
  assert.equal(h.ctx.assessmentConsent(next, "marketing"), false);
  assert.equal(cell(h, id, "marketingUnsubscribedAt"), "2025-01-01T00:00:00.000Z");
  const events = h.sheets.get("行銷授權紀錄")!;
  assert.equal(events.rows[2][2], "withdraw");
  h.ctx.withdrawAssessmentConsent(id, "marketing");
  assert.equal(events.rows.length, 3);
  assert.equal(h.ctx.exportAssessmentMarketingList().length, 0);
});

test("no public grant action; failed/damaged evidence or untrusted original cannot restore subscription", () => {
  const h = harness(); submit(h, { marketingConsent: false });
  assert.throws(() => h.ctx.recordVerifiedMarketingResubscription(id, "private-request-002", "alex-test"));
  assert.throws(() => h.post({ type: "resubscribe", submissionId: id, _serverCredential: secret }), /Invalid type/);
  const data = submit(h, { submissionId: randomUUID(), email: "new@example.test" });
  h.ctx.recordVerifiedMarketingResubscription(data.submissionId, "private-request-003", "alex-test");
  h.sheets.get("行銷授權紀錄")!.rows[0][0] = "damaged";
  assert.equal(h.ctx.assessmentConsent(data, "marketing"), false);
  const failed = harness(); submit(failed);
  failed.ctx.withdrawAssessmentConsent(id, "marketing");
  cell(failed, id, "marketingUnsubscribedAt", "2025-01-01T00:00:00.000Z");
  const next = submit(failed, { submissionId: randomUUID() });
  const broken = new Sheet(); broken.failAppend = true;
  failed.sheets.set("行銷授權紀錄", broken);
  assert.throws(() => failed.ctx.recordVerifiedMarketingResubscription(next.submissionId, "private-request-004", "alex-test"));
  assert.equal(failed.ctx.assessmentConsent(next, "marketing"), false);
});

test("only exact unsubscribe ownership changes; adjacent APIs and WordPress/Signup retain ownership", () => {
  assert.equal(productionRouteOwner(CONSULT_UNSUBSCRIBE_PATH + "?token=test"), "platform");
  for (const path of [CONSULT_UNSUBSCRIBE_PATH + "/", CONSULT_UNSUBSCRIBE_PATH + "/other", "/api/consult/resubscribe", "/api/other", "/agreement/", "/wp-json/"]) assert.equal(productionRouteOwner(path), "wordpress");
  assert.equal(productionRouteOwner("/language-school-signup/api/applications"), "signup");
});

test("operator link tool exports only email/link, refuses questionnaire dumps, duplicates and overwrite; never sends", async () => {
  const dir = mkdtempSync(join(tmpdir(), "consent63-")), input = join(dir, "input.json"), output = join(dir, "output.csv");
  const run = () => spawnSync(process.execPath, ["--import", "tsx", "scripts/create-unsubscribe-links.ts", input, output], { encoding: "utf8", env: { ...process.env, CONSULT_UNSUBSCRIBE_SECRET: key } });
  try {
    writeFileSync(input, JSON.stringify([{ email: payload.email, submissionId: id }]));
    assert.equal(run().status, 0);
    const csv = readFileSync(output, "utf8");
    assert.match(csv, /^email,unsubscribeUrl\n/);
    assert.equal(csv.includes(id), false); assert.equal(csv.includes(key), false);
    const match = csv.match(/token=([A-Za-z0-9_-]+)/)!;
    assert.equal(await readUnsubscribeToken(match[1], key), id);
    assert.notEqual(run().status, 0);
    assert.equal(readFileSync(output, "utf8"), csv);
    rmSync(output);
    for (const rows of [[{ email: payload.email, submissionId: id, name: "unnecessary" }], [{ email: "=bad@example.test", submissionId: id }], [{ email: payload.email, submissionId: id }, { email: payload.email, submissionId: id }]]) {
      writeFileSync(input, JSON.stringify(rows));
      assert.notEqual(run().status, 0);
      assert.equal(existsSync(output), false);
    }
  } finally {
    assert.ok(dir.startsWith(join(tmpdir(), "consent63-")));
    rmSync(dir, { recursive: true, force: true });
  }
});
