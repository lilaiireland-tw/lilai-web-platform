import { expect, test } from "./local-test";
import type { Page } from "@playwright/test";
import { ADS_HOST_FRAGMENTS, GAS_HOSTS, attachDiagnostics, attachWriteRequestDiagnostics, blockUnexpectedWrites, expectNoUnexpectedWrites, installDiagnostics } from "./helpers";
import { assessmentFormContract, options } from "../../src/components/consult/consult-content";
import { calcDimensions, classifyLead, classifyStage, getRouteRecommendation } from "../../src/lib/consult/assessment";

test.use({ viewport: { width: 375, height: 812 } });

async function choose(page: Page, name: string, index = 0) {
  const input = page.locator(`input[name="${name}"]`).nth(index);
  await input.evaluate((element: HTMLInputElement) => element.click());
  await expect(input).toBeChecked();
  await page.waitForTimeout(100);
}

async function acceptConsents(page: Page) {
  const consents = page.locator('input[name="contactConsent"], input[name="marketingConsent"]');
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

async function completeFormToStepFive(page: Page, optionalAnswers = true) {
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
  if (optionalAnswers) {
    await page.locator("#lifeChange").fill("這是只存在於自動化瀏覽器中的合成長文字，用來確認欄位可以正常換行並在返回前一步後保留內容。".repeat(3));
    await page.locator("#lifeChange").press("End");
    await page.locator("#lifeChange").press("Enter");
    await expect(page.locator("#lifeChange")).toHaveValue(/\n/);
    await expect(page.getByText("SECTION 03 / 05")).toBeVisible();
  }
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
  await expect(page.locator("#lifeChange")).toHaveValue(optionalAnswers ? /合成長文字/ : "");
  await continueTo(page, 4);
  await continueTo(page, 5);
  if (optionalAnswers) await choose(page, "webinar");
}

async function interceptGas(page: Page, mode: "success" | "failure") {
  const intercepted: string[] = [];
  const payloads: Record<string, unknown>[] = [];
  const unexpectedWrites: string[] = [];
  let releaseResponse: () => void = () => {};
  const responseGate = new Promise<void>(resolve => { releaseResponse = resolve; });
  await page.route("**/*", async route => {
    const request = route.request();
    if (["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)) {
      await route.fallback();
      return;
    }
    const url = new URL(request.url());
    if (GAS_HOSTS.has(url.hostname)) {
      intercepted.push(`${request.method()} ${request.url()}`);
      payloads.push(JSON.parse(request.postData() ?? "{}"));
      if (mode === "success") {
        await responseGate;
        await route.fulfill({ status: 200, contentType: "text/plain", body: "mocked-ok" });
      }
      else await route.abort("failed");
      return;
    }
    if (!["GET", "HEAD"].includes(request.method())) {
      unexpectedWrites.push(`${request.method()} ${request.url()}`);
      await route.abort("blockedbyclient");
      return;
    }
    await route.fallback();
  });
  return { intercepted, payloads, unexpectedWrites: { unexpected: unexpectedWrites, intentionallyBlockedExternal: [] }, releaseResponse };
}

test("consult validation, optional fields, state retention, selection limits and FAQ", async ({ page }, testInfo) => {
  const unexpectedWrites = await blockUnexpectedWrites(page);
  await page.goto("/consult");
  await waitForConsultHydration(page);
  await expect(page.locator("form#consult-assessment")).toHaveAttribute("novalidate", "");
  await page.locator("#name").press("Enter");
  await expect(page.getByText("SECTION 01 / 05")).toBeVisible();
  await expect(page.locator("#name-error")).not.toBeVisible();
  await page.getByRole("button", { name: /繼續/ }).click();
  await expect(page.locator("#name-error")).toBeVisible();
  await page.locator("#name").fill("Playwright 測試");
  await page.locator("#nickname").fill("QA");
  await page.locator("#email").fill("invalid-email");
  await choose(page, "location");
  await page.getByRole("button", { name: /繼續/ }).click();
  await expect(page.locator("#email-error")).toBeVisible();
  await page.locator("#email").fill("playwright@example.test");
  await page.locator("#email").press("Enter");
  await expect(page.getByText("SECTION 01 / 05")).toBeVisible();
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
  await attachWriteRequestDiagnostics(testInfo, unexpectedWrites);
  expectNoUnexpectedWrites(unexpectedWrites);
});

test("mocked successful submission renders result once with no Ads traffic", async ({ page }, testInfo) => {
  const { intercepted, unexpectedWrites, releaseResponse } = await interceptGas(page, "success");
  const diagnostics = installDiagnostics(page);
  await page.goto("/consult");
  await waitForConsultHydration(page);
  await completeFormToStepFive(page);
  const submit = page.locator('#form button[type="submit"]');
  await expect(submit).toHaveText(/取得我的出發評估/);
  await acceptConsents(page);
  await submit.focus();
  await submit.press("Enter");
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
  await attachWriteRequestDiagnostics(testInfo, unexpectedWrites);
  expectNoUnexpectedWrites(unexpectedWrites);
});

test("mocked failed submission remains retryable and never emits Ads traffic", async ({ page }, testInfo) => {
  const { intercepted, payloads, unexpectedWrites } = await interceptGas(page, "failure");
  const adsRequests: string[] = [];
  page.on("request", request => {
    if (ADS_HOST_FRAGMENTS.some(host => request.url().includes(host))) adsRequests.push(request.url());
  });
  page.on("dialog", dialog => dialog.accept());
  await page.goto("/consult");
  await waitForConsultHydration(page);
  await completeFormToStepFive(page);
  const submit = page.locator('#form button[type="submit"]');
  await expect(submit).toHaveText(/取得我的出發評估/);
  await acceptConsents(page);
  await submit.click();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect.poll(() => intercepted.length).toBe(2);
  expect(payloads[0].submissionId).toBe(payloads[1].submissionId);
  expect(adsRequests).toEqual([]);
  await expect(page.getByRole("heading", { name: "你的出發評估來了" })).toHaveCount(0);
  await attachWriteRequestDiagnostics(testInfo, unexpectedWrites);
  expectNoUnexpectedWrites(unexpectedWrites);
});

test("validation and navigation never contact GAS or Google Ads", async ({ page }, testInfo) => {
  const unexpectedWrites = await blockUnexpectedWrites(page);
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
  await attachWriteRequestDiagnostics(testInfo, unexpectedWrites);
  expectNoUnexpectedWrites(unexpectedWrites);
});

test("explicit unknown remains distinct from unanswered sources and permits independent Dcard exposure", async ({ page }) => {
  const { payloads, releaseResponse, unexpectedWrites } = await interceptGas(page, "success");
  await page.goto("/consult");
  await waitForConsultHydration(page);
  await completeFormToStepFive(page, false);
  await page.locator('input[name="discoveryChannels"][value="unknown"]').evaluate((input: HTMLInputElement) => input.click());
  await page.locator('input[name="dcardExposure"][value="yes"]').evaluate((input: HTMLInputElement) => input.click());
  releaseResponse();
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole("heading", { name: "你的出發評估來了" })).toBeVisible();
  expect(payloads[0]).toMatchObject({ discoveryChannels: ["unknown"], discoveryOther: "", dcardExposure: "yes", contactConsent: false, marketingConsent: false });
  expectNoUnexpectedWrites(unexpectedWrites);
});

for (const width of [375, 1440]) {
  for (const [contactConsent, marketingConsent] of [[false, false], [true, false], [false, true], [true, true]]) {
    test(`${width}px optional answers empty, contact=${contactConsent}, marketing=${marketingConsent}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const { payloads, releaseResponse, unexpectedWrites } = await interceptGas(page, "success");
      const diagnostics = installDiagnostics(page);
      await page.goto("/consult");
      await waitForConsultHydration(page);
      await expect(page.getByRole("link", { name: /個人資料蒐集告知聲明/ })).toHaveAttribute("href", "https://lilaiireland.com/agreement/");
      await completeFormToStepFive(page, false);
      await expect(page.locator('input[name="contactConsent"]')).not.toBeChecked();
      await expect(page.locator('input[name="marketingConsent"]')).not.toBeChecked();
      if (contactConsent) await page.locator('input[name="contactConsent"]').check();
      if (marketingConsent) await page.locator('input[name="marketingConsent"]').check();
      await page.getByRole("button", { name: /返回/ }).click();
      await continueTo(page, 5);
      await expect(page.locator('input[name="contactConsent"]')).toBeChecked({ checked: contactConsent });
      await expect(page.locator('input[name="marketingConsent"]')).toBeChecked({ checked: marketingConsent });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      releaseResponse();
      await page.locator('button[type="submit"]').click();
      await expect(page.getByRole("heading", { name: "你的出發評估來了" })).toBeVisible();
      expect(payloads).toHaveLength(1);
      expect(payloads[0]).toMatchObject({ ...assessmentFormContract, contactConsent, marketingConsent, lifeChange: "", webinar: "", discoveryChannels: [], discoveryOther: "", dcardExposure: null });
      expect(payloads[0].submissionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(payloads[0]).not.toHaveProperty("consent1");
      expect(payloads[0]).not.toHaveProperty("consent2");
      expect(payloads[0]).not.toHaveProperty("consentTimestamp");
      expect(diagnostics.consoleErrors).toEqual([]);
      expect(diagnostics.pageErrors).toEqual([]);
      await attachDiagnostics(testInfo, diagnostics);
      expectNoUnexpectedWrites(unexpectedWrites);
    });
  }

  test(`${width}px survey codes, exclusivity, clearing, keyboard and retained answers`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const { payloads, releaseResponse, unexpectedWrites } = await interceptGas(page, "success");
    await page.goto("/consult");
    await waitForConsultHydration(page);
    await completeFormToStepFive(page);
    const channels = page.locator('input[name="discoveryChannels"]');
    const exposure = page.locator('input[name="dcardExposure"]');
    expect(await channels.evaluateAll(inputs => inputs.map(input => (input as HTMLInputElement).value))).toEqual(["instagram", "threads", "google_website", "dcard", "facebook", "accupass", "referral", "youtube", "other", "unknown"]);
    expect(await exposure.evaluateAll(inputs => inputs.map(input => (input as HTMLInputElement).value))).toEqual(["yes", "maybe_dcard", "maybe_other", "no_recall"]);
    const channel = (value: string) => page.locator(`input[name="discoveryChannels"][value="${value}"]`);
    await channel("other").focus();
    await channel("other").press("Space");
    await expect(page.locator("#discoveryOther")).toHaveAttribute("maxlength", "200");
    await page.locator("#discoveryOther").fill("  Synthetic source  ");
    await channel("other").press("Space");
    await expect(page.locator("#discoveryOther")).toHaveCount(0);
    await channel("other").press("Space");
    await expect(page.locator("#discoveryOther")).toHaveValue("");
    await page.locator("#discoveryOther").fill("cleared by unknown");
    await channel("unknown").focus();
    await channel("unknown").press("Space");
    await expect(page.locator('input[name="discoveryChannels"]:checked')).toHaveCount(1);
    await expect(channel("unknown")).toBeChecked();
    await expect(page.locator("#discoveryOther")).toHaveCount(0);
    await channel("unknown").press("Space");
    await expect(page.locator('input[name="discoveryChannels"]:checked')).toHaveCount(0);
    await channel("unknown").press("Space");
    await channel("instagram").focus();
    await channel("instagram").press("Space");
    await expect(channel("unknown")).not.toBeChecked();
    await channel("other").focus();
    await channel("other").press("Space");
    await expect(page.locator("#discoveryOther")).toHaveValue("");
    await page.locator("#discoveryOther").fill("  Synthetic source  ");
    for (const value of options.dcardExposure) {
      const input = page.locator(`input[name="dcardExposure"][value="${value}"]`);
      await input.focus();
      await input.press("Space");
      await expect(input).toBeChecked();
      await expect(page.locator('input[name="dcardExposure"]:checked')).toHaveCount(1);
    }
    await page.locator('input[name="contactConsent"]').focus();
    await page.locator('input[name="contactConsent"]').press("Space");
    await expect(page.locator('input[name="contactConsent"]')).toBeChecked();
    await page.getByRole("button", { name: /返回/ }).click();
    await continueTo(page, 5);
    await expect(channel("instagram")).toBeChecked();
    await expect(channel("other")).toBeChecked();
    await expect(page.locator("#discoveryOther")).toHaveValue("  Synthetic source  ");
    await expect(exposure.last()).toBeChecked();
    await expect(page.locator('input[name="webinar"]').first()).toBeChecked();
    await expect(page.getByRole("link", { name: /個人資料蒐集告知聲明/ })).toHaveAttribute("href", "https://lilaiireland.com/agreement/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#form").screenshot({ path: testInfo.outputPath(`step-five-${width}.png`) });
    releaseResponse();
    await page.locator('button[type="submit"]').click();
    await expect(page.getByRole("heading", { name: "你的出發評估來了" })).toBeVisible();
    expect(payloads[0]).toMatchObject({ discoveryChannels: ["instagram", "other"], discoveryOther: "Synthetic source", dcardExposure: "no_recall", contactConsent: true, marketingConsent: false });
    const { discoveryChannels, discoveryOther, dcardExposure, contactConsent, marketingConsent, ...assessment } = payloads[0];
    const changedPreferences: Record<string, unknown> = { ...assessment, discoveryChannels: ["unknown"], discoveryOther: "", dcardExposure: "yes", contactConsent: false, marketingConsent: true };
    for (const score of [calcDimensions, classifyLead, classifyStage, getRouteRecommendation]) {
      expect(score(payloads[0])).toEqual(score(assessment));
      expect(score(changedPreferences)).toEqual(score(assessment));
    }
    expectNoUnexpectedWrites(unexpectedWrites);
  });
}
