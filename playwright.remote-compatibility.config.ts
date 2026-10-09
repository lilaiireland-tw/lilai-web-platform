import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/remote-compatibility",
  globalSetup: "./tests/remote-compatibility/global-setup.ts",
  outputDir: "artifacts/remote-compatibility",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:8791", browserName: "chromium" },
  // Deliberately no webServer: operators must start the authorized probe themselves.
});
