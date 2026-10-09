import { defineConfig } from "@playwright/test";

const baseURL = process.env.PRECUTOVER_BASE_URL || "http://127.0.0.1:8791";

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
  webServer: {
    command: "npm run probe:production-runtime",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
});
