import assert from "node:assert/strict";
import test from "node:test";
import { forwardLocalSignupRequest } from "../../src/lib/language-school-signup/local-backend";
import { submitDirectApplication } from "../../src/lib/language-school-signup/api";
import type { DirectApplicationFormData } from "../../src/lib/language-school-signup/types";

test("local bridge rejects missing, nonlocal and production targets without fetching", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  globalThis.fetch = async () => { throw new Error("Network must not be reached"); };
  try {
    for (const [mode, origin] of [
      ["development", ""], ["production", "http://127.0.0.1:8787"],
      ["development", "https://lilaiireland.com"], ["development", "http://localhost.evil.test"],
      ["development", "http://user:password@localhost"], ["development", "http://localhost/other"],
    ]) {
      Object.assign(process.env, { NODE_ENV: mode, SIGNUP_LOCAL_BACKEND_ORIGIN: origin });
      const result = await forwardLocalSignupRequest(new Request("http://localhost/language-school-signup/api/applications", { method: "POST" }), "applications");
      assert.equal(result.status, 503);
      assert.equal(result.headers.get("Cache-Control"), "no-store");
    }
  } finally {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
  }
});

test("local bridge preserves original API path, body, idempotency, errors and retry headers", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };
  Object.assign(process.env, { NODE_ENV: "development", SIGNUP_LOCAL_BACKEND_ORIGIN: "http://127.0.0.1:8787" });
  const payload = JSON.stringify({ serviceType: "consultation", turnstileToken: "local-test" });
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "http://127.0.0.1:8787/language-school-signup/api/applications");
      assert.equal(init?.method, "POST");
      assert.equal(init?.body, payload);
      assert.equal(new Headers(init?.headers).get("Idempotency-Key"), "existing-key");
      assert.equal(new Headers(init?.headers).get("Authorization"), null);
      assert.equal(init?.redirect, "manual");
      return Response.json({ error: { message: "rate limited" } }, { status: 429, headers: { "Retry-After": "60" } });
    };
    const response = await forwardLocalSignupRequest(new Request("http://localhost/language-school-signup/api/applications", {
      method: "POST", body: payload,
      headers: { "Content-Type": "application/json", "Idempotency-Key": "existing-key", Authorization: "must-not-forward" },
    }), "applications");
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("Retry-After"), "60");
    assert.deepEqual(await response.json(), { error: { message: "rate limited" } });

    globalThis.fetch = async input => {
      assert.equal(String(input), "http://127.0.0.1:8787/language-school-signup/api/turnstile-config");
      return Response.json({ siteKey: "local-test", action: "application_submit" });
    };
    assert.equal((await forwardLocalSignupRequest(new Request("http://localhost/config"), "turnstile-config")).status, 200);
    globalThis.fetch = async () => new Response(null, { status: 302, headers: { Location: "https://lilaiireland.com" } });
    assert.equal((await forwardLocalSignupRequest(new Request("http://localhost/config"), "turnstile-config")).status, 503);
    globalThis.fetch = async () => { throw new Error("offline"); };
    assert.equal((await forwardLocalSignupRequest(new Request("http://localhost/config"), "turnstile-config")).status, 503);
  } finally {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
  }
});

test("frontend retains API contract and validates successful reference codes", async () => {
  const originalFetch = globalThis.fetch;
  const form = { serviceType: "direct_application" } as DirectApplicationFormData;
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(input, "/language-school-signup/api/applications");
      assert.match(new Headers(init?.headers).get("Idempotency-Key")!, /^[0-9a-f-]{36}$/);
      assert.deepEqual(JSON.parse(String(init?.body)), { ...form, turnstileToken: "test-token" });
      return Response.json({ submissionId: "ST-123456" });
    };
    assert.equal((await submitDirectApplication(form, "test-token")).submissionId, "ST-123456");
    globalThis.fetch = async () => Response.json({ submissionId: "invalid" });
    await assert.rejects(submitDirectApplication(form, "test-token"), /申請編號格式不正確/);
    globalThis.fetch = async () => Response.json({ error: { message: "安全驗證失敗" } }, { status: 403 });
    await assert.rejects(submitDirectApplication(form, "test-token"), /安全驗證失敗/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
