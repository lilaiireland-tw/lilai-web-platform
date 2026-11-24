import { test as base, expect, type Page } from "@playwright/test";

const landing = "https://lilaiireland.com/consult?utm_source=instagram&utm_medium=social&utm_campaign=consult&utm_content=ig_bio";
const destination = "G-06M3GS0WS0";
// Real production hostname in the browser, but ALL requests are intercepted.
// Application documents/assets come from loopback; no Google script is executed.
const test = base.extend<{ gas: string[]; ack: { value: unknown; status: number } }>({
  ack: async ({}, use) => { await use({ value: { status: "ok", accepted: true, jobId: "11111111-1111-4111-8111-111111111111" }, status: 200 }); },
  gas: async ({ page, ack }, use) => {
    const writes: string[] = [];
    await page.route("**/*", async route => {
      const url = new URL(route.request().url());
      if (url.hostname === "lilaiireland.com" &&
          (url.pathname === "/consult" || url.pathname === "/consult/" || url.pathname.startsWith("/_next/"))) {
        const response = await route.fetch({ url: `http://127.0.0.1:3101${url.pathname}${url.search}`, maxRedirects: 0 });
        await route.fulfill({ response });
      } else if (url.hostname === "lilaiireland.com" && url.pathname.startsWith("/api/consult/")) {
        writes.push(route.request().postData() ?? "");
        await route.fulfill({ status: ack.status, contentType: "application/json", body: JSON.stringify(ack.value) });
      } else {
        await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
      }
    });
    await use(writes);
  },
});

async function commands(page: Page) {
  return page.evaluate(() => (window.dataLayer ?? []).map(command => Array.from(command as IArguments))) as Promise<[string, string, Record<string, unknown>][]>;
}
async function events(page: Page) {
  return (await commands(page)).filter(command => command[0] === "event" && command[1].startsWith("consult_"));
}
async function consent(page: Page, value = "v1.100") {
  await page.context().addCookies([{ name: "lilai_consent_v1", value, domain: "lilaiireland.com", path: "/", secure: true }]);
}
async function choose(page: Page, field: string) {
  await page.locator(`input[name="${field}"]`).first().evaluate((input: HTMLInputElement) => input.click());
}
async function next(page: Page, step: number) {
  await page.getByRole("button", { name: /繼續/ }).click();
  await expect(page.getByText(`SECTION 0${step} / 05`)).toBeVisible();
}
async function firstStep(page: Page) {
  await page.locator("#name").fill("Synthetic private name");
  await page.locator("#nickname").fill("Synthetic nickname");
  await page.locator("#email").fill("synthetic@example.test");
  await page.locator("#instagram").fill("private_ig");
  await page.locator("#lineId").fill("private_line");
  await choose(page, "location");
  await next(page, 2);
}

test("UTM landing: step 2 view without completion, no replay on back, consented missing-gtag queue", async ({ page, gas }) => {
  await consent(page);
  await page.goto(landing);
  await expect.poll(async () => (await events(page)).length).toBe(1);
  expect((await events(page))[0].slice(1)).toEqual(["consult_step_view", { send_to: destination, form_id: "consult-assessment", step_number: 1 }]);
  await page.locator("#name").focus();
  await page.locator("#name").fill("   ");
  expect((await events(page)).filter(e => e[1] === "consult_form_start")).toHaveLength(0);
  await page.evaluate(() => { delete window.gtag; });
  await firstStep(page);
  await expect.poll(async () => (await events(page)).filter(e => e[1] === "consult_step_view").length).toBe(2);
  expect((await events(page)).filter(e => e[1] === "consult_step_complete").map(e => e[2].step_number)).toEqual([1]);
  await page.getByRole("button", { name: /返回/ }).click();
  await next(page, 2);
  expect((await events(page)).filter(e => e[1] === "consult_step_view").map(e => e[2].step_number)).toEqual([1, 2]);
  expect((await events(page)).filter(e => e[1] === "consult_form_start")).toHaveLength(1);
  expect(page.url()).toBe(landing);
  expect(gas).toHaveLength(0);
  const calls = await commands(page);
  expect(calls.filter(c => c[0] === "js")).toHaveLength(1);
  expect(calls.filter(c => c[0] === "config").map(c => c[1])).toEqual(["AW-17610996814"]);
  expect(calls.filter(c => ["page_view", "session_start", "form_start"].includes(c[1]))).toHaveLength(0);
});

test("full funnel preserves GA4 destination, private values, UTM and exactly one existing Ads conversion after valid ACK", async ({ page, gas, ack }) => {
  await consent(page);
  await page.goto(landing);
  await expect.poll(async () => (await events(page)).length).toBe(1);
  await page.getByRole("button", { name: /繼續/ }).click();
  await firstStep(page);
  for (const field of ["awareness", "timeline", "plan"]) await choose(page, field);
  await next(page, 3);
  for (const field of ["workIntention", "goals", "englishGoal"]) await choose(page, field);
  await page.locator("#lifeChange").fill("Private free text never sent to analytics");
  await next(page, 4);
  for (const field of ["barriers", "cityPreference", "budget", "resources"]) await choose(page, field);
  await next(page, 5);
  await choose(page, "webinar");
  await page.locator('input[name="discoveryChannels"][value="other"]').evaluate((input: HTMLInputElement) => input.click());
  await page.locator("#discoveryOther").fill("Private discovery free text");
  await page.locator('input[name="contactConsent"]').check();
  await page.locator('input[name="marketingConsent"]').check();
  for (const value of [{ status: "error" }, "<html>error</html>", { status: "ok", accepted: true },
    { status: "ok", accepted: false }, { status: "IN_FLIGHT" }, { error: "receipt_unconfirmed" }]) {
    ack.value = value;
    ack.status = "error" in Object(value) && (value as { error?: string }).error === "receipt_unconfirmed" ? 504 : 200;
    const before = gas.length;
    await page.locator('button[type="submit"]').evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
    await expect.poll(() => gas.length).toBe(before + 1);
    await expect(page.locator("#form").getByRole("alert")).toContainText("尚未確認是否成功接收");
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
    expect((await events(page)).filter(e => e[1] === "consult_submit_success")).toHaveLength(0);
    expect((await commands(page)).filter(c => c[1] === "conversion")).toHaveLength(0);
  }
  ack.value = { status: "ok", accepted: true, jobId: "11111111-1111-4111-8111-111111111111" };
  ack.status = 200;
  await page.locator('button[type="submit"]').evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
  await expect(page.getByRole("heading", { name: "你的出發評估來了" })).toBeVisible();
  expect(gas).toHaveLength(7);
  expect(new Set(gas).size).toBe(1); // Manual retries preserve the exact payload and original ID.
  const recorded = await events(page);
  for (const name of ["consult_step_view", "consult_step_complete"]) {
    expect(recorded.filter(e => e[1] === name).map(e => e[2].step_number)).toEqual([1, 2, 3, 4, 5]);
  }
  expect(recorded.filter(e => e[1] === "consult_form_start")).toHaveLength(1);
  expect(recorded.filter(e => e[1] === "consult_submit_attempt")).toHaveLength(7);
  expect(recorded.filter(e => e[1] === "consult_submit_success")).toHaveLength(1);
  expect(recorded.filter(e => e[1] === "consult_validation_error").map(e => e[2].step_number)).toEqual([1]);
  for (const [, , params] of recorded) {
    expect(params.send_to).toBe(destination);
    expect(Object.keys(params).every(key => ["send_to", "form_id", "step_number"].includes(key))).toBe(true);
  }
  expect(JSON.stringify(recorded)).not.toMatch(/Synthetic|synthetic@|private_ig|private_line|Private free text|Private discovery|contactConsent|marketingConsent|submissionId|utm_/);
  const conversions = (await commands(page)).filter(c => c[1] === "conversion");
  expect(conversions).toEqual([["event", "conversion", { send_to: "AW-17610996814/Ynp6CPHkhe4cEM74yc1B" }]]);
  expect(page.url()).toBe(landing);
});

test("no pre-consent collection; granting analytics records current view; withdrawal stops events", async ({ page, gas }) => {
  await page.goto(landing);
  await expect(page.getByRole("button", { name: "自訂設定" })).toBeVisible();
  await page.locator("#name").fill("before consent");
  expect(await events(page)).toEqual([]);
  await page.getByRole("button", { name: "自訂設定" }).click();
  await page.getByLabel("網站分析", { exact: true }).check();
  await page.getByRole("button", { name: "儲存我的選擇" }).click();
  await expect.poll(async () => (await events(page)).length).toBe(1);
  expect((await events(page))[0][1]).toBe("consult_step_view");
  await page.locator("#name").fill("after consent");
  expect((await events(page)).filter(e => e[1] === "consult_form_start")).toHaveLength(1);
  await consent(page, "v1.011");
  const before = await events(page);
  await page.getByRole("button", { name: /繼續/ }).click();
  expect(await events(page)).toEqual(before);
  expect(gas).toHaveLength(0);
});

test("actual Next Route Handlers fail closed without server endpoint and reject cross-origin", async ({ request }) => {
  for (const path of ["/api/consult/submissions", "/api/consult/accuracy-feedback"]) {
    const response = await request.post(`http://127.0.0.1:3101${path}`, { data: {}, headers: { Origin: "http://127.0.0.1:3101", "X-Consult-Request": "1" } });
    expect(response.status(), await response.text()).toBe(503);
    expect(await response.json()).toEqual({ error: "not_configured" });
    expect((await request.get(`http://127.0.0.1:3101${path}`)).status()).toBe(405);
    const foreign = await request.post(`http://127.0.0.1:3101${path}`, { data: {}, headers: { Origin: "https://evil.test", "X-Consult-Request": "1" } });
    expect(foreign.status()).toBe(403);
  }
});
