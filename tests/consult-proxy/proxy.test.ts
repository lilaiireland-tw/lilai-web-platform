import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { proxyConsultation } from "../../src/lib/consult/proxy";
import { CONSULT_SUBMISSIONS_PATH, CONSULT_FEEDBACK_PATH } from "../../src/lib/consult/ack";
import { assessmentFormContract } from "../../src/components/consult/consult-content";
import { productionRouteOwner } from "../../cloudflare/production-routing-policy";
import { routeProductionRequest } from "../../cloudflare/production-router";
import { runConsultationSubmission } from "../../src/lib/consult/submission";
import { requestConsultation } from "../../src/lib/consult/request";

const id = "11111111-1111-4111-8111-111111111111";
const jobId = "22222222-2222-4222-8222-222222222222";
const endpoint = "https://script.google.com/macros/s/CONTROLLED_MOCK_ONLY/exec";
const ack = { status: "ok", accepted: true, jobId };
const payload = { ...assessmentFormContract, submissionId: id, name: "Synthetic", nickname: "QA", email: "qa@example.test",
  contactConsent: false, marketingConsent: false, discoveryChannels: [], discoveryOther: "", dcardExposure: null, wantWork: false };
const feedback = { submissionId: id, jobId, type: "accuracy_feedback", name: "Synthetic", nickname: "QA", email: "qa@example.test", accuracyAnswer: "還好" };
function request(body: unknown = payload, headers: Record<string, string> = {}) {
  return new Request(`https://lilaiireland.com${CONSULT_SUBMISSIONS_PATH}`, { method: "POST", body: JSON.stringify(body), headers: {
    Origin: "https://lilaiireland.com", "Content-Type": "application/json", "X-Consult-Request": "1", ...headers,
  } });
}
const respond = (value: unknown, status = 200): typeof fetch => async () => Response.json(value, { status });

test("existing ACK; four opt-ins preserve the complete payload, false and unanswered survey", async () => {
  for (const contactConsent of [false, true]) for (const marketingConsent of [false, true]) {
    const body = { ...payload, contactConsent, marketingConsent };
    const response = await proxyConsultation(request(body), false, endpoint, async (url, init) => {
      assert.equal(String(url), endpoint);
      assert.equal(init?.redirect, "manual");
      assert.deepEqual(JSON.parse(String(init?.body)), body);
      assert.deepEqual(init?.headers, { "Content-Type": "text/plain;charset=utf-8" });
      return Response.json(ack);
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ...ack, submissionId: id });
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

test("HTTP 200 cannot complete gate for error/HTML/missing or malformed jobId/false/IN_FLIGHT/mismatched ID", async () => {
  for (const value of [{ status: "error" }, "<html>error</html>", { status: "ok", accepted: true },
    { ...ack, jobId: "IN_FLIGHT" }, { ...ack, jobId: " " }, { ...ack, accepted: false },
    { ...ack, status: "IN_FLIGHT" }, { status: "ok", accepted: true, deduplicated: true },
    { ...ack, submissionId: jobId }, { ...ack, submissionId: null }]) {
    const gate = { completed: false, inFlight: false };
    let successes = 0;
    await assert.rejects(runConsultationSubmission({ gate, validate: () => true,
      request: async () => {
        const response = await proxyConsultation(request(), false, endpoint, typeof value === "string" ? async () => new Response(value) : respond(value));
        assert.equal(response.status, 502);
        throw new Error("invalid ACK");
      }, onResolved: () => { successes++; },
    }));
    assert.deepEqual(gate, { completed: false, inFlight: false });
    assert.equal(successes, 0);
  }
  assert.equal((await proxyConsultation(request(), false, endpoint, respond(ack, 500))).status, 502);
  assert.equal((await proxyConsultation(request(), false, endpoint, async () => { throw new Error("network"); })).status, 502);
});

test("only one ContentService 302/303 GET redirect; no forwarded body, credentials or headers", async () => {
  for (const status of [302, 303]) {
    let calls = 0;
    const response = await proxyConsultation(request(), false, endpoint, async (_url, init) => {
      if (++calls === 1) return new Response(null, { status, headers: { Location: "https://script.googleusercontent.com/macros/echo?user_content_key=mock" } });
      assert.equal(init?.method, "GET");
      assert.equal(init?.body, undefined);
      assert.equal(init?.headers, undefined);
      return Response.json(ack);
    });
    assert.equal(response.status, 200);
    assert.equal(calls, 2);
  }
  for (const location of ["https://evil.test/", "https://script.googleusercontent.com.evil.test/macros/echo", "http://script.googleusercontent.com/macros/echo",
    "https://script.googleusercontent.com:444/macros/echo", "https://user:secret@script.googleusercontent.com/macros/echo", "https://script.google.com/macros/s/OTHER/exec", "/macros/echo", "https://script.googleusercontent.com/other"]) {
    let calls = 0;
    assert.equal((await proxyConsultation(request(), false, endpoint, async () => { calls++; return new Response(null, { status: 302, headers: { Location: location } }); })).status, 502);
    assert.equal(calls, 1);
  }
  let calls = 0;
  assert.equal((await proxyConsultation(request(), false, endpoint, async () => {
    calls++; return new Response(null, { status: 302, headers: { Location: "https://script.googleusercontent.com/macros/echo?k=mock" } });
  })).status, 502);
  assert.equal(calls, 2);
  assert.equal((await proxyConsultation(request(), false, endpoint, async () => new Response(null, { status: 307, headers: { Location: "https://script.googleusercontent.com/macros/echo" } }))).status, 502);
});

test("timeout covers stalled upstream and ACK body; never retries", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0;
  const response = proxyConsultation(request(), false, endpoint, async () => { calls++; return new Promise<Response>(() => {}); });
  // Let the bounded request stream finish before advancing time.
  await new Promise<void>(resolve => setImmediate(resolve));
  t.mock.timers.tick(15_000);
  assert.equal((await response).status, 504);
  assert.equal(calls, 1);
  const stalledBody = proxyConsultation(request(), false, endpoint, async () => new Response(new ReadableStream({ start() {} })));
  await new Promise<void>(resolve => setImmediate(resolve));
  t.mock.timers.tick(15_000);
  assert.equal((await stalledBody).status, 504);
});

test("trust boundaries reject cross-origin, simple requests, unsupported actions, unbounded bodies and endpoints", async () => {
  let calls = 0;
  const upstream: typeof fetch = async () => { calls++; return Response.json(ack); };
  for (const [req, expected] of [[request(payload, { Origin: "https://evil.test" }), 403],
    [request(payload, { "Sec-Fetch-Site": "cross-site" }), 403], [request(payload, { "X-Consult-Request": "" }), 415],
    [request(payload, { "Content-Type": "text/plain" }), 415], [request({ ...payload, type: "send_25plus8_greeting" }), 400],
    [request({ ...payload, _stepState: { email: true } }), 400], [request({ ...payload, url: "https://evil.test" }), 400],
    [request({ ...payload, discoveryChannels: ["unrecognized"] }), 400], [request({ ...payload, contractVersion: "unrecognized" }), 400],
    [request({ ...payload, marketingConsent: "false" }), 400], [request({ ...payload, name: "x".repeat(33 * 1024) }), 413]] as const) {
    assert.equal((await proxyConsultation(req, false, endpoint, upstream)).status, expected);
  }
  for (const target of [undefined, "invalid", "https://evil.test/", `${endpoint}?url=evil`, "http://script.google.com/macros/s/mock/exec"]) {
    assert.equal((await proxyConsultation(request(), false, target, upstream)).status, 503);
  }
  assert.equal(calls, 0);
  const localRequest = new Request("http://localhost:3100/api/consult/submissions", { method: "POST", body: JSON.stringify(payload),
    headers: { Host: "127.0.0.1:3100", Origin: "http://127.0.0.1:3100", "Content-Type": "application/json", "X-Consult-Request": "1" } });
  assert.equal((await proxyConsultation(localRequest, false, endpoint, respond(ack))).status, 200);
  assert.equal((await proxyConsultation(request(payload, { "X-Forwarded-Host": "evil.test", Origin: "https://evil.test" }), false, endpoint, upstream)).status, 403);
  assert.equal((await proxyConsultation(request(), false, endpoint, async () => new Response("x".repeat(17 * 1024)))).status, 502);
});

test("browser ACK parser rejects raw HTML/invalid JSON, failed status, network and missing fields before completing gate", async t => {
  for (const response of [new Response("<html>error</html>"), new Response("{"), Response.json({ status: "error" }),
    Response.json({ status: "ok", accepted: true }), Response.json(ack, { status: 503 })]) {
    t.mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(requestConsultation(payload));
    t.mock.restoreAll();
  }
  t.mock.method(globalThis, "fetch", async () => { throw new DOMException("timeout", "TimeoutError"); });
  await assert.rejects(requestConsultation(payload));
  t.mock.restoreAll();
  t.mock.method(globalThis, "fetch", async () => Response.json({ status: "error" }));
  await assert.rejects(requestConsultation(feedback, true));
  t.mock.restoreAll();
});

test("feedback follows actual status:ok ACK, keeps original IDs and rejects urgent client authorization", async () => {
  assert.equal((await proxyConsultation(request(feedback), true, endpoint, respond({ status: "ok" }))).status, 200);
  for (const value of [{ status: "error" }, { status: "ok", accepted: false }, { status: "ok", accepted: "false" }, { status: "ok", submissionId: jobId }, {}]) {
    assert.equal((await proxyConsultation(request(feedback), true, endpoint, respond(value))).status, 502);
  }
  assert.equal((await proxyConsultation(request({ ...feedback, urgentFollowUp: true }), true, endpoint, respond({ status: "ok" }))).status, 400);
});

test("only exact API ownership reaches existing platform binding; method/body preserved; staging dispatch precedes read-only guard", async () => {
  for (const path of [CONSULT_SUBMISSIONS_PATH, CONSULT_FEEDBACK_PATH]) {
    assert.equal(productionRouteOwner(path), "platform");
    const req = new Request(`https://lilaiireland.com${path}`, request());
    const response = await routeProductionRequest(req, { platform: { async fetch(received) {
      assert.equal(received, req); assert.equal(received.method, "POST"); assert.deepEqual(await received.json(), payload); return Response.json(ack);
    } }, originFetch: async () => { throw new Error("wrong owner"); } });
    assert.equal(response.status, 200);
  }
  for (const path of ["/api/consult", `${CONSULT_SUBMISSIONS_PATH}/`, `${CONSULT_SUBMISSIONS_PATH}/child`, "/api/revalidate", "/api/other", "/wp-json/", "/shop/"]) assert.equal(productionRouteOwner(path), "wordpress");
  assert.equal(productionRouteOwner(`${CONSULT_SUBMISSIONS_PATH}?rest_route=/wp/v2/posts`), "platform");
  assert.equal(productionRouteOwner(`https://other.test${CONSULT_SUBMISSIONS_PATH}`), "wordpress");
  assert.equal(productionRouteOwner("/"), "platform");
  assert.equal(productionRouteOwner("/language-school-signup/api/applications"), "signup");
  const staging = readFileSync("cloudflare/staging-worker.ts", "utf8");
  assert(staging.indexOf("if (isConsultApiPath(url.pathname))") < staging.indexOf('if (!["GET", "HEAD"]'));
});
