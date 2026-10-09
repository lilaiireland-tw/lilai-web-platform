import { expect, test as base } from "@playwright/test";

// Prevent browser requests from escaping localhost. Test-specific GAS handlers can
// intercept first; otherwise GAS is blocked like every other external service.
const transparentPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/" +
    "l2kAAAAASUVORK5CYII=",
  "base64",
);

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("**/*", async route => {
      const requestUrl = new URL(route.request().url());
      if (["127.0.0.1", "localhost"].includes(requestUrl.hostname)) {
        await route.continue();
      } else if (requestUrl.hostname === "script.google.com" || requestUrl.hostname === "script.googleusercontent.com") {
        await route.abort("blockedbyclient");
      } else if (route.request().resourceType() === "image") {
        await route.fulfill({ status: 200, contentType: "image/png", body: transparentPng });
      } else if (["GET", "HEAD"].includes(route.request().method())) {
        const type = route.request().resourceType();
        if (type === "document") await route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Local external fixture</title>" });
        else if (type === "script") await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
        else if (type === "stylesheet") await route.fulfill({ status: 200, contentType: "text/css", body: "" });
        else if (type === "font") await route.fulfill({ status: 200, contentType: "font/woff2", body: Buffer.alloc(0) });
        else await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      } else {
        await route.abort("blockedbyclient");
      }
    });
    await use(page);
  },
});

export { expect };
