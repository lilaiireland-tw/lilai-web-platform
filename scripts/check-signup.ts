import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdirSync, writeFileSync } from "node:fs";
import next from "next";
import { chromium, expect, type Page } from "@playwright/test";

// Isolated localhost QA. All browser egress and submissions use fixtures.
process.env.SITE_DEPLOYMENT_ENV = "staging";
process.env.EVENT_DEPLOYMENT_ENV = "preview";
process.env.SIGNUP_LOCAL_PREVIEW = "1";
delete process.env.SIGNUP_LOCAL_BACKEND_ORIGIN;
const baseURL = "http://127.0.0.1:3130";
const artifactDir = ".next/signup-qa-artifacts";

async function main() {
  const app = next({ dev: true, webpack: true, hostname: "127.0.0.1", port: 3130 });
  await app.prepare();
  const server = createServer(app.getRequestHandler());
  await new Promise<void>(resolve => server.listen(3130, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  mkdirSync(artifactDir, { recursive: true });
  try {
    for (const [source, status, destination] of [
      ["/language-school-signup/", 200, null],
      ["/language-school-signup?gclid=local-test&utm_source=qa", 308, "/language-school-signup/?gclid=local-test&utm_source=qa"],
      ["/consult/", 308, "/consult"], ["/events/", 308, "/events"],
      ["/ireland-25-plus-8/", 308, "/ireland-25-plus-8"],
    ] as const) {
      const response = await fetch(baseURL + source, { redirect: "manual" });
      assert.equal(response.status, status, source);
      assert.equal(response.headers.get("location"), destination, source);
      if (status === 200) {
        const html = await response.text();
        assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
        assert(html.includes('href="https://lilaiireland.com/language-school-signup/"'));
        assert(html.includes('content="noindex, nofollow"'));
      }
    }
    const offlineApi = await fetch(baseURL + "/language-school-signup/api/turnstile-config");
    assert.equal(offlineApi.status, 503);
    assert.equal((await fetch(baseURL + "/language-school-signup/api/applications", { method: "POST", body: "{}" })).status, 503);
    console.log("PASS original slash URL, canonical, staging noindex, existing redirects and offline API guard");

    for (const width of [375, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: width === 1440 ? "no-preference" : "reduce", serviceWorkers: "block" });
      const page = await context.newPage();
      const errors: string[] = [];
      const assets = new Set<string>();
      const submissions: Array<{ body: Record<string, unknown>; key?: string }> = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => {
        // The deliberate first-submit 403 fixture also emits a browser network error.
        if (message.type() === "error" && message.text() !== "Failed to load resource: the server responded with a status of 403 (Forbidden)") errors.push(message.text());
      });
      page.on("response", response => {
        if (new URL(response.url()).pathname.startsWith("/language-school-signup/lilai-assets/") && response.status() >= 400) assets.add(response.url());
      });
      await page.route("**/*", async route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.pathname === "/language-school-signup/api/turnstile-config") {
          await route.fulfill({ json: { siteKey: "local-fixture", action: "application_submit" } });
        } else if (url.hostname === "challenges.cloudflare.com") {
          await route.fulfill({ contentType: "application/javascript", body: `window.turnstile = {
            render(container, options) { window.__signupToken = options.callback; setTimeout(() => options.callback('local-fixture-token'), 0); return 'fixture'; },
            reset() { setTimeout(() => window.__signupToken('local-fixture-token'), 0); }, remove() {}
          };` });
        } else if (url.pathname === "/language-school-signup/api/applications") {
          submissions.push({ body: request.postDataJSON(), key: request.headers()["idempotency-key"] });
          if (submissions.length === 1) await route.fulfill({ status: 403, json: { error: { message: "安全驗證失敗，請重新驗證後再試。" } } });
          else {
            await new Promise(resolve => setTimeout(resolve, 200));
            await route.fulfill({ status: 201, json: { ok: true, submissionId: "ST-123456" } });
          }
        } else if (url.origin === baseURL) await route.continue();
        else if (request.resourceType() === "image") {
          await route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>' });
        } else if (request.method() === "GET") await route.fulfill({ body: "" });
        else throw new Error("Unexpected external write: " + url.origin);
      });

      await page.goto(baseURL + "/language-school-signup/?utm_source=local-qa&gclid=local-test");
      await expect(page.locator('input[name="utmSource"]')).toHaveValue("local-qa");
      await expect(page.locator("body > header")).toHaveCount(1);
      await expect(page.locator("body > footer")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://lilaiireland.com/language-school-signup/");
      const imagePaths = await page.locator('img[src^="/language-school-signup/"]').evaluateAll(images => [...new Set(images.map(image => image.getAttribute("src")!))]);
      for (const imagePath of imagePaths) assert.equal((await fetch(baseURL + imagePath)).status, 200, imagePath);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `overflow at ${width}`);
      for (const y of [0, 2000, 5000, 8000]) {
        await page.evaluate(y => window.scrollTo(0, y), y);
        await page.waitForTimeout(100);
      }
      assert.deepEqual([...assets], [], `broken local assets at ${width}`);
      await page.evaluate(() => window.scrollTo(0, 0));
      writeFileSync(`${artifactDir}/signup-${width}.png`, await page.screenshot({ caret: "initial" }));
      if (width === 375) {
        await page.evaluate(() => {
          const notice = document.createElement("div");
          notice.id = "lilai-cookie-title";
          document.body.appendChild(notice);
        });
        await expect(page.locator(".sticky-mobile-cta")).toBeHidden();
        await page.evaluate(() => document.getElementById("lilai-cookie-title")?.remove());
        await expect(page.locator(".sticky-mobile-cta")).toBeVisible();
      }

      await page.getByRole("tab", { name: /Cork/ }).click();
      await expect(page.locator("#partner-school-panel")).toContainText("SEDA College");
      await expect(page.locator("#partner-school-panel")).not.toContainText("ICOT");
      const faq = page.locator("#faq summary").first();
      await faq.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#faq details").first()).toHaveAttribute("open", "");

      await page.locator(".hero-actions").getByRole("link", { name: "預約一對一語校諮詢" }).click();
      await expect(page.locator("#direct-application-form h2")).toHaveText("預約一對一語校諮詢");
      await page.getByRole("button", { name: /我已大致選好/ }).click();
      await page.getByRole("button", { name: /下一步/ }).click();
      await expect(page.getByText("請完成此欄位").first()).toBeVisible();
      await fillContact(page);
      await page.getByRole("button", { name: /下一步/ }).click();
      await page.locator("#preferredCity").selectOption("Dublin");
      await page.locator("#preferredSchool").selectOption({ label: "ISI Dublin" });
      await page.locator("#courseType").selectOption({ index: 1 });
      await page.locator("#expectedStartMonth").fill("2027-06");
      await page.locator("#courseDuration").selectOption({ index: 1 });
      await page.locator("#accommodationNeeded").selectOption({ label: "不需要" });
      await page.getByRole("button", { name: /下一步/ }).click();
      await page.locator('input[name="decisionStage"]').first().check();
      await page.locator("#budgetRange").selectOption({ index: 1 });
      for (const checkbox of await page.locator('.agreements input[type="checkbox"]').all()) await checkbox.check();
      const submit = page.getByRole("button", { name: "提交直接報名需求", exact: true });
      await submit.click();
      await expect(page.getByText("安全驗證失敗，請重新驗證後再試。", { exact: true })).toBeVisible();
      await submit.click();
      await page.locator("form.application-form").evaluate(form => {
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      });
      await expect(page.getByRole("heading", { name: "已收到你的直接報名需求" })).toBeVisible();
      assert.equal(submissions.length, 2);
      assert.equal(submissions[1].body.serviceType, "direct_application");
      assert.equal(submissions[1].body.turnstileToken, "local-fixture-token");
      assert.equal(submissions[1].body.utmSource, "local-qa");
      assert.equal(submissions[1].body.gclid, "local-test");
      assert.match(submissions[1].key!, /^[0-9a-f-]{36}$/);
      assert.equal(submissions[1].body.consultationGoal, "");

      // Mode switching still clears direct-only values and submits to the same API.
      await page.locator(".hero-actions").getByRole("link", { name: "預約一對一語校諮詢" }).click();
      await fillContact(page);
      await page.getByRole("button", { name: /下一步/ }).click();
      await page.locator("#preferredCity").selectOption({ label: "尚未確定" });
      await page.locator("#courseType").selectOption({ label: "尚未確定／希望諮詢" });
      await page.locator("#expectedStartMonth").selectOption({ label: "尚未確定" });
      await page.locator("#courseDuration").selectOption({ label: "尚未確定" });
      await page.locator("#accommodationNeeded").selectOption({ label: "不需要" });
      await page.getByRole("button", { name: /下一步/ }).click();
      await page.locator('input[name="consultationGoal"]').first().check();
      await page.locator("#budgetRange").selectOption({ index: 1 });
      for (const checkbox of await page.locator('.agreements input[type="checkbox"]').all()) await checkbox.check();
      await page.getByRole("button", { name: "送出一對一諮詢需求", exact: true }).click();
      await expect(page.getByRole("heading", { name: "已收到你的一對一諮詢需求" })).toBeVisible();
      assert.equal(submissions.length, 3);
      assert.equal(submissions[2].body.serviceType, "consultation");
      assert.equal(submissions[2].body.preferredSchool, "");
      assert.equal(submissions[2].body.isicInitiallyEligible, false);
      if (width === 375) {
        await page.locator("body > footer").scrollIntoViewIfNeeded();
        await expect(page.locator(".sticky-mobile-cta")).toBeHidden();
      }
      assert.deepEqual(errors, [], `browser errors at ${width}`);
      console.log(`PASS ${width}px: shared shell, assets, overflow, school tabs, FAQ keyboard, direct/consultation forms, retry, attribution and success`);
      await context.close();
    }
  } finally {
    await browser.close();
    server.closeAllConnections();
    server.close();
    await app.close();
  }
}

async function fillContact(page: Page) {
  await page.locator("#chineseName").fill("本機測試");
  await page.locator("#email").fill("local-test@example.invalid");
  await page.locator("#phone").fill("0900000000");
  await page.locator("#currentLocation").selectOption({ label: "台灣" });
}

main().then(() => process.exit(0), error => { console.error(error); process.exit(1); });
