import { expect, type Page, type TestInfo } from "@playwright/test";

export const EXPECTED_UPSTREAM = "remote-service-binding:lilai-web-platform-router";
export const GAS_HOSTS = new Set(["script.google.com", "script.googleusercontent.com"]);
export const ADS_HOST_FRAGMENTS = ["googleadservices.com", "googlesyndication.com", "googletagmanager.com", "doubleclick.net"];

export type Diagnostics = {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  badResponses: string[];
  adsRequests: string[];
  unmatchedGasRequests: string[];
};

export type WriteRequestDiagnostics = {
  unexpected: string[];
  intentionallyBlockedExternal: string[];
};

function isKnownExternalPlayerWrite(method: string, url: string) {
  const parsed = new URL(url);
  return method === "POST" && (
    (parsed.hostname === "jnn-pa.googleapis.com" && parsed.pathname === "/$rpc/google.internal.waa.v1.Waa/GenerateIT") ||
    (parsed.hostname === "www.youtube.com" && ["/youtubei/v1/log_event", "/api/stats/atr"].includes(parsed.pathname))
  );
}

function isKnownBlockedPlayerConsoleError(message: string) {
  return message.includes("Cross-Origin Request Blocked") &&
    message.includes("https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT");
}

export function installDiagnostics(page: Page): Diagnostics {
  const result: Diagnostics = {
    consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [], adsRequests: [], unmatchedGasRequests: [],
  };
  page.on("console", message => {
    if (message.type() === "error") result.consoleErrors.push(message.text());
  });
  page.on("pageerror", error => result.pageErrors.push(error.stack || error.message));
  page.on("requestfailed", request => {
    const failure = request.failure()?.errorText || "unknown";
    result.failedRequests.push(`${request.method()} ${request.url()} :: ${failure}`);
  });
  page.on("response", response => {
    if (response.status() >= 400) result.badResponses.push(`${response.status()} ${response.request().method()} ${response.url()}`);
  });
  page.on("request", request => {
    const url = new URL(request.url());
    if (ADS_HOST_FRAGMENTS.some(fragment => url.hostname.includes(fragment))) result.adsRequests.push(`${request.method()} ${request.url()}`);
    if (GAS_HOSTS.has(url.hostname)) result.unmatchedGasRequests.push(`${request.method()} ${request.url()}`);
  });
  return result;
}

export async function attachDiagnostics(testInfo: TestInfo, diagnostics: Diagnostics) {
  await testInfo.attach("browser-diagnostics", {
    body: JSON.stringify(diagnostics, null, 2),
    contentType: "application/json",
  });
}

export async function expectCleanPage(
  page: Page,
  diagnostics: Diagnostics,
  expectedStatuses: number[] = [],
  intentionallyBlockedExternalWrites: string[] = [],
) {
  await page.waitForTimeout(500);
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => {
    const root = document.documentElement;
    const overflow = root.scrollWidth - root.clientWidth;
    const brokenImages = [...document.images]
      .filter(image => image.complete && image.naturalWidth === 0)
      .map(image => image.currentSrc || image.src);
    const clippedText = [...document.querySelectorAll<HTMLElement>("h1,h2,h3,p,a,button,label")]
      .filter(element => {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;
        return element.scrollWidth > element.clientWidth + 2 && style.overflowX === "hidden";
      })
      .map(element => (element.textContent || "").trim().slice(0, 100));
    return { overflow, brokenImages, clippedText, fonts: document.fonts.status };
  });
  expect(layout.overflow, "document horizontal overflow in CSS pixels").toBeLessThanOrEqual(1);
  expect(layout.brokenImages, "broken rendered images").toEqual([]);
  expect(layout.clippedText, "text clipped by hidden horizontal overflow").toEqual([]);
  expect(layout.fonts).toBe("loaded");
  expect(diagnostics.pageErrors, "uncaught page exceptions").toEqual([]);
  const unexpectedConsoleErrors = diagnostics.consoleErrors.filter(message =>
    !message.includes("Failed to load resource") &&
    !message.includes("Permissions policy violation: compute-pressure is not allowed in this document") &&
    !(message.includes("Cookie “__Secure-") && message.includes("youtube.com/embed/")) &&
    !isKnownBlockedPlayerConsoleError(message),
  );
  expect(unexpectedConsoleErrors, "unexpected application console errors").toEqual([]);
  const unexpectedFailedRequests = diagnostics.failedRequests.filter(failure =>
    !intentionallyBlockedExternalWrites.some(request => failure.startsWith(`${request} ::`)),
  );
  expect(unexpectedFailedRequests, "failed network requests excluding intentionally blocked third-party player telemetry").toEqual([]);
  expect(diagnostics.badResponses.filter(line => !expectedStatuses.some(status => line.startsWith(`${status} `))), "unexpected HTTP errors").toEqual([]);
}

export async function scrollThroughPage(page: Page) {
  const dimensions = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    viewport: window.innerHeight,
  }));
  const step = Math.max(dimensions.viewport * 0.8, 400);
  const positions: number[] = [];
  for (let y = 0; y < dimensions.height; y += step) positions.push(y);
  const sampled = positions.length <= 16
    ? positions
    : Array.from({ length: 16 }, (_, index) => Math.round((dimensions.height - dimensions.viewport) * index / 15));
  for (const y of sampled) {
    await page.evaluate(scrollY => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(75);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  await expect(page.locator("main")).toBeVisible();
}

export async function expectShell(page: Page) {
  await expect(page.locator('[data-site-top-strip="true"]')).toHaveCount(1);
  await expect(page.locator("body > header, header")).toHaveCount(1);
  await expect(page.locator("body > footer, footer")).toHaveCount(1);
}

export async function expectStickyShell(page: Page) {
  const before = await page.locator("header").boundingBox();
  await page.evaluate(() => window.scrollTo(0, Math.min(900, document.documentElement.scrollHeight - innerHeight)));
  await page.waitForTimeout(250);
  const strip = await page.locator('[data-site-top-strip="true"]').boundingBox();
  const header = await page.locator("header").boundingBox();
  expect(strip?.y ?? 999).toBeLessThanOrEqual(1);
  expect(header?.y ?? 999).toBeGreaterThanOrEqual((strip?.height || 0) - 1);
  expect(header?.y ?? 999).toBeLessThanOrEqual((strip?.height || 0) + 1);
  expect(before).not.toBeNull();
}

export async function expectKeyboardFocus(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  const skipLink = page.locator('a[href="#site-content"]');
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  let focusVisible = false;
  let keyboardReachable = false;
  const focusHistory: string[] = [];
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press("Tab");
    const state = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) return { reachable: false, visible: false };
      const style = getComputedStyle(element);
      return {
        reachable: true,
        visible: (style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none",
        description: `${element.tagName.toLowerCase()} ${element.getAttribute("href") || element.getAttribute("aria-label") || ""}`.trim(),
      };
    });
    focusHistory.push("description" in state ? state.description ?? "body" : "body");
    keyboardReachable ||= state.reachable && await page.evaluate(() => document.activeElement !== document.querySelector('a[href="#site-content"]'));
    focusVisible ||= state.visible;
    if (focusVisible) break;
  }
  expect(keyboardReachable, `Tab moves focus to an interactive element; history=${focusHistory.join(" -> ")}`).toBe(true);
  expect(focusVisible, `a keyboard reachable element has a visible focus outline; history=${focusHistory.join(" -> ")}`).toBe(true);
}

export async function expectMobileMenu(page: Page) {
  const toggle = page.getByLabel("網站導覽選單");
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator("#mobile-navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-navigation")).toBeHidden();
}

export async function blockUnexpectedWrites(page: Page) {
  const writes: WriteRequestDiagnostics = { unexpected: [], intentionallyBlockedExternal: [] };
  await page.route("**/*", async route => {
    const request = route.request();
    if (!["GET", "HEAD"].includes(request.method())) {
      const record = `${request.method()} ${request.url()}`;
      if (isKnownExternalPlayerWrite(request.method(), request.url())) writes.intentionallyBlockedExternal.push(record);
      else writes.unexpected.push(record);
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });
  return writes;
}

export function expectNoUnexpectedWrites(writes: WriteRequestDiagnostics) {
  expect(writes.unexpected, `Unexpected unsafe request(s): ${writes.unexpected.join(", ")}`).toEqual([]);
}

export async function attachWriteRequestDiagnostics(testInfo: TestInfo, writes: WriteRequestDiagnostics) {
  await testInfo.attach("write-request-diagnostics", {
    body: JSON.stringify(writes, null, 2),
    contentType: "application/json",
  });
}
