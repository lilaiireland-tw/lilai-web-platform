import { expect, test } from "@playwright/test";
import { EXPECTED_UPSTREAM } from "../precutover/helpers";

const cases = [
  "/study-in-ireland-guide/",
  "/about/",
  "/wp-json/",
  "/robots.txt",
  "/sitemap_index.xml",
  "/post-sitemap.xml",
  "/page-sitemap.xml",
  "/language-school-signup",
  "/language-school-signup/",
  "/language-school-signup/?utm_source=playwright-qa",
] as const;

test("WordPress and signup routes remain readable through Router probe", async ({ request }, testInfo) => {
  const results = [];
  for (const path of cases) {
    const response = await request.get(path, { maxRedirects: 0 });
    const location = response.headers().location || "";
    const requestUrl = response.headers()["x-lilai-runtime-probe-request-url"] || "";
    results.push({ path, status: response.status(), location, requestUrl, upstream: response.headers()["x-lilai-runtime-probe-upstream"] });
    expect(response.headers()["x-lilai-runtime-probe-upstream"]).toBe(EXPECTED_UPSTREAM);
    expect([200, 301, 302, 307, 308]).toContain(response.status());
    if (path.includes("utm_source")) {
      expect(new URL(requestUrl).searchParams.get("utm_source")).toBe("playwright-qa");
      if (location) expect(location).toContain("utm_source=playwright-qa");
    }
  }
  await testInfo.attach("compatibility-results", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
});

test("HEAD requests are read-only and supported", async ({ request }) => {
  for (const path of ["/about/", "/robots.txt", "/language-school-signup/"]) {
    const response = await request.head(path, { maxRedirects: 0 });
    expect(response.headers()["x-lilai-runtime-probe-upstream"]).toBe(EXPECTED_UPSTREAM);
    expect(response.status()).toBeLessThan(400);
  }
});
