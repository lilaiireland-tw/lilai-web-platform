import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/consult-analytics",
  globalSetup: "./tests/consult-analytics/global-setup.ts",
  outputDir: "artifacts/consult-analytics",
  workers: 1,
  timeout: 60_000,
  use: { browserName: "chromium", serviceWorkers: "block", viewport: { width: 375, height: 812 } },
});
