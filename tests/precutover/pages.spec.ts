import { expect, test } from "./local-test";
import {
  attachDiagnostics, attachWriteRequestDiagnostics, blockUnexpectedWrites, expectCleanPage, expectKeyboardFocus,
  expectMobileMenu, expectNoUnexpectedWrites, expectShell, expectStickyShell, installDiagnostics, scrollThroughPage,
} from "./helpers";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1440, height: 900 },
  ...(process.env.PRECUTOVER_FULL_MATRIX === "1" ? [{ name: "tablet", width: 768, height: 1024 }] : []),
] as const;

const pages = [
  { name: "home", path: "/" },
  { name: "home-utm", path: "/?utm_source=playwright-qa" },
  { name: "events", path: "/events" },
  { name: "events-slash", path: "/events/" },
  { name: "daydream", path: "/events/daydream-adventure-2027" },
  { name: "daydream-slash", path: "/events/daydream-adventure-2027/" },
  { name: "consult", path: "/consult" },
  { name: "consult-slash", path: "/consult/" },
  { name: "consult-query", path: "/consult/?gclid=playwright-qa&utm_source=test" },
] as const;

for (const viewport of viewports) {
  test.describe(`${viewport.name} viewport`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });
    for (const target of pages) {
      test(`${target.name} renders cleanly at ${viewport.name}`, async ({ page }, testInfo) => {
      const unexpectedWrites = await blockUnexpectedWrites(page);
      const diagnostics = installDiagnostics(page);
      const response = await page.goto(target.path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);
      await expectShell(page);
      await scrollThroughPage(page);
      const webkitLinkOnlyKeyboardBlock = testInfo.project.name === "webkit" && viewport.name === "desktop" && ["events", "events-slash"].includes(target.name);
      if (webkitLinkOnlyKeyboardBlock) {
        testInfo.annotations.push({
          type: "blocked",
          description: "Headless WebKit on Windows does not advance focus from the skip link with Tab on the link-only Events index.",
        });
        await testInfo.attach("keyboard-blocked", {
          body: "Plain Tab remained on document.body after the skip link on WebKit/Windows. Chromium and Firefox plain-Tab coverage passed; public Safari hardware verification remains required.",
          contentType: "text/plain",
        });
      } else {
        await expectKeyboardFocus(page);
      }
      if (viewport.name === "mobile") await expectMobileMenu(page);
      if (target.name === "home" && viewport.name === "desktop") await expectStickyShell(page);
      if (["mobile", "desktop"].includes(viewport.name) && ["home", "events", "daydream", "consult"].includes(target.name)) {
        await page.screenshot({
          path: `artifacts/precutover-playwright/screenshots/${testInfo.project.name}-${target.name}-${viewport.width}x${viewport.height}.png`,
          fullPage: true,
        });
      }
      await attachDiagnostics(testInfo, diagnostics);
      await attachWriteRequestDiagnostics(testInfo, unexpectedWrites);
      expectNoUnexpectedWrites(unexpectedWrites);
      await expectCleanPage(page, diagnostics, [], unexpectedWrites.intentionallyBlockedExternal);
      });
    }
  });
}

test("homepage internal navigation reaches events and consult", async ({ page }, testInfo) => {
  const unexpectedWrites = await blockUnexpectedWrites(page);
  await page.goto("/");
  const consultLink = page.locator('a[href="/consult"]').first();
  await expect(consultLink).toBeVisible();
  await consultLink.click();
  await expect(page).toHaveURL(/\/consult$/);
  await page.goto("/events");
  await expect(page).toHaveURL(/\/events$/);
  await attachWriteRequestDiagnostics(testInfo, unexpectedWrites);
  expectNoUnexpectedWrites(unexpectedWrites);
});

test("slash redirects are canonical and preserve consultation attribution", async ({ page, request }, testInfo) => {
  const unexpectedWrites = await blockUnexpectedWrites(page);
  for (const [source, destination] of [
    ["/events/", "/events"],
    ["/events/daydream-adventure-2027/", "/events/daydream-adventure-2027"],
    ["/consult/", "/consult"],
  ]) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers().location, "http://127.0.0.1:3100").pathname).toBe(destination);
  }
  await page.goto("/consult/?gclid=playwright-qa&utm_source=test");
  expect(new URL(page.url()).pathname).toBe("/consult");
  expect(new URL(page.url()).searchParams.get("gclid")).toBe("playwright-qa");
  expect(new URL(page.url()).searchParams.get("utm_source")).toBe("test");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://lilaiireland.com/consult");
  await attachWriteRequestDiagnostics(testInfo, unexpectedWrites);
  expectNoUnexpectedWrites(unexpectedWrites);
});

test("events metadata, local staging sitemap behavior, listing, registration target and FAQ", async ({ page, request }, testInfo) => {
  const unexpectedWrites = await blockUnexpectedWrites(page);
  await page.goto("/events");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://lilaiireland.com/events");
  await page.getByRole("link", { name: /白日夢冒險王/ }).first().click();
  await expect(page).toHaveURL(/\/events\/daydream-adventure-2027$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://lilaiireland.com/events/daydream-adventure-2027");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex, follow/i);
  const registration = page.locator('a[href="https://forms.gle/isPDKepgK9BsPpg86"]');
  expect(await registration.count()).toBeGreaterThan(0);
  const faq = page.locator("#faq button").first();
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "false");

  const sitemapResponse = await request.get("/events-sitemap.xml");
  expect(sitemapResponse.status()).toBe(404);
  await attachWriteRequestDiagnostics(testInfo, unexpectedWrites);
  expectNoUnexpectedWrites(unexpectedWrites);
});

test("unknown event returns expected 404", async ({ page }, testInfo) => {
  const unexpectedWrites = await blockUnexpectedWrites(page);
  const diagnostics = installDiagnostics(page);
  const response = await page.goto("/events/definitely-not-a-real-event", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await attachDiagnostics(testInfo, diagnostics);
  await attachWriteRequestDiagnostics(testInfo, unexpectedWrites);
  expectNoUnexpectedWrites(unexpectedWrites);
  await expectCleanPage(page, diagnostics, [404]);
});
