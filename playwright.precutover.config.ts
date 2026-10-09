import { defineConfig } from "@playwright/test";

// Fixed loopback target: production URLs cannot be selected through the environment.
const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/precutover",
  outputDir: "artifacts/precutover-playwright/test-results",
  globalSetup: "./tests/precutover/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "artifacts/precutover-playwright/results.json" }],
    ["html", { outputFolder: "artifacts/precutover-playwright/html-report", open: "never" }],
  ],
  use: {
    baseURL,
    ignoreHTTPSErrors: false,
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
