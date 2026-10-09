import { expect, test, type Page } from "@playwright/test";
import { ADS_HOST_FRAGMENTS, GAS_HOSTS, attachDiagnostics, installDiagnostics } from "./helpers";

test.use({ viewport: { width: 375, height: 812 } });

async function choose(page: Page, name: string, index = 0) {
  const input = page.locator(`input[name="${name}"]`).nth(index);
  await input.evaluate((element: HTMLInputElement) => element.click());
  await expect(input).toBeChecked();
  await page.waitForTimeout(100);
}

async function acceptConsents(page: Page) {
  const consents = page.locator('button[role="checkbox"]');
  await expect(consents).toHaveCount(2);
  await consents.nth(0).click();
  await consents.nth(1).click();
}

async function continueTo(page: Page, step: number) {
  await page.getByRole("button", { name: /繼續/ }).click();
  const heading = page.getByText(`SECTION 0${step} / 05`);
  await page.waitForTimeout(150);
  if (!(await heading.isVisible())) await page.getByRole("button", { name: /繼續/ }).click();
  await expect(heading).toBeVisible();
}

async function waitForConsultHydration(page: Page) {
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll("button")].find(element => element.textContent?.includes("繼續"));
    return Boolean(button && Object.keys(button).some(key => key.startsWith("__reactProps$")));
  });
}

async function completeFormToStepFive(page: Page) {
  await page.locator("#name").fill("Playwright 測試");
  await page.locator("#nickname").fill("QA");
  await page.locator("#email").fill("playwright@example.test");
  await page.locator("#instagram").fill("qa_handle");
  await page.locator("#lineId").fill("synthetic-line-id");
  await choose(page, "location");
  await continueTo(page, 2);
  await choose(page, "awareness");
  await choose(page, "timeline");
  await choose(page, "plan");
  await continueTo(page, 3);
  await choose(page, "workIntention");
  await choose(page, "goals");
  await choose(page, "englishGoal");
  await page.locator("#lifeChange").fill("這是只存在於自動化瀏覽器中的合成長文字，用來確認欄位可以正常換行並在返回前一步後保留內容。".repeat(3));
  await continueTo(page, 4);
  await choose(page, "barriers", 0);
  await choose(page, "barriers", 1);
  await choose(page, "barriers", 2);
  await page.locator('input[name="barriers"]').nth(3).click({ force: true });
  await expect(page.locator('input[name="barriers"]:checked')).toHaveCount(3);
  await choose(page, "cityPreference");
  await choose(page, "budget");
  await choose(page, "resources");
  await page.getByRole("button", { name: /返回/ }).click();
  await expect(page.locator("#lifeChange")).toHaveValue(/合成長文字/);
  await continueTo(page, 4);
  await continueTo(page, 5);
  await choose(page, "webinar");
}

async function interceptGas(page: Page, mode: "success" | "failure") {
  const intercepted: string[] = [];
  let releaseResponse: () => void = () => {};
  const responseGate = new Promise<void>(resolve => { releaseResponse = resolve; });
  await page.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (GAS_HOSTS.has(url.hostname)) {
      intercepted.push(`${request.method()} ${request.url()}`);
      if (mode === "success") {
        await responseGate;
        await route.fulfill({ status: 200, contentType: "text/plain", body: "mocked-ok" });
      }
      else await route.abort("failed");
      return;
    }
    if (!["GET", "HEAD"].includes(request.method())) throw new Error(`Unsafe unmatched request: ${request.method()} ${request.url()}`);
    await route.continue();
  });
  return { intercepted, releaseResponse };
}

test("consult validation, optional fields, state retention, selection limits and FAQ", async ({ page }) => {
  await page.goto("/consult");
  await waitForConsultHydration(page);
  await page.getByRole("button", { name: /繼續/ }).click();
  await expect(page.locator("#name-error")).toBeVisible();
  await page.locator("#name").fill("Playwright 測試");
  await page.locator("#nickname").fill("QA");
  await page.locator("#email").fill("invalid-email");
  await choose(page, "location");
  await page.getByRole("button", { name: /繼續/ }).click();
  await expect(page.locator("#email-error")).toBeVisible();
  await page.locator("#email").fill("playwright@example.test");
  await page.getByRole("button", { name: /繼續/ }).click();
  await expect(page.getByText("SECTION 02 / 05")).toBeVisible();
  await page.getByRole("button", { name: /返回/ }).click();
  await expect(page.locator("#name")).toHaveValue("Playwright 測試");
  expect(await page.locator("#instagram").inputValue()).toBe("");
  expect(await page.locator("#lineId").inputValue()).toBe("");
  const faq = page.getByRole("button", { name: /《哩來出發計畫》是報名表嗎/ });
  await faq.scrollIntoViewIfNeeded();
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
});

test("mocked successful submission renders result once with no Ads traffic", async ({ page }, testInfo) => {
  const { intercepted, releaseResponse } = await interceptGas(page, "success");
  const diagnostics = installDiagnostics(page);
  await page.goto("/consult");
  await waitForConsultHydration(page);
  await completeFormToStepFive(page);
  const submit = page.locator('#form button[type="button"]').last();
  await expect(submit).toHaveText(/取得我的出發評估/);
  await submit.click();
  await expect(page.locator("#consent-error")).toBeVisible();
  expect(intercepted).toHaveLength(0);
  await acceptConsents(page);
  await submit.evaluate((element: HTMLButtonElement) => element.click());
  await expect(submit).toBeDisabled();
  await expect.poll(() => intercepted.length).toBe(1);
  await submit.evaluate((element: HTMLButtonElement) => element.click());
  expect(intercepted).toHaveLength(1);
  releaseResponse();
  await expect(page.getByRole("heading", { name: "你的出發評估來了" })).toBeVisible();
  expect(intercepted).toHaveLength(1);
  expect(diagnostics.adsRequests.filter(url => ADS_HOST_FRAGMENTS.some(host => url.includes(host)))).toEqual([]);
  const resultLinks = await page.locator('a[href^="https://"]').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href));
  expect(resultLinks.some(url => url.includes("language-school-signup") || url.includes("portaly.cc"))).toBe(true);
  await attachDiagnostics(testInfo, diagnostics);
});

test("mocked failed submission remains retryable and never emits Ads traffic", async ({ page }) => {
  const { intercepted } = await interceptGas(page, "failure");
  const adsRequests: string[] = [];
  page.on("request", request => {
    if (ADS_HOST_FRAGMENTS.some(host => request.url().includes(host))) adsRequests.push(request.url());
  });
  page.on("dialog", dialog => dialog.accept());
  await page.goto("/consult");
  await waitForConsultHydration(page);
  await completeFormToStepFive(page);
  const submit = page.locator('#form button[type="button"]').last();
  await expect(submit).toHaveText(/取得我的出發評估/);
  await acceptConsents(page);
  await submit.click();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect.poll(() => intercepted.length).toBe(2);
  expect(adsRequests).toEqual([]);
  await expect(page.getByRole("heading", { name: "你的出發評估來了" })).toHaveCount(0);
});

test("validation and navigation never contact GAS or Google Ads", async ({ page }) => {
  const gas: string[] = [];
  const ads: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if (GAS_HOSTS.has(url.hostname)) gas.push(request.url());
    if (ADS_HOST_FRAGMENTS.some(host => url.hostname.includes(host))) ads.push(request.url());
  });
  await page.goto("/consult");
  await waitForConsultHydration(page);
  await page.getByRole("button", { name: /繼續/ }).click();
  await page.locator("#email").fill("bad");
  await page.getByRole("button", { name: /繼續/ }).click();
  expect(gas).toEqual([]);
  expect(ads).toEqual([]);
  expect(await page.evaluate(() => ({ configured: window.__lilaiGoogleAdsConfigured, dataLayer: window.dataLayer }))).toEqual({ configured: undefined, dataLayer: undefined });
});
