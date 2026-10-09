import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const cli = resolve("node_modules/@playwright/test/cli.js");
const result = spawnSync(process.execPath, [cli, "test", "--config", "playwright.precutover.config.ts"], {
  stdio: "inherit",
  env: { ...process.env, PRECUTOVER_FULL_MATRIX: "1" },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
