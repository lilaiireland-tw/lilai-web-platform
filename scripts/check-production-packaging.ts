import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const wrangler = resolve("node_modules/wrangler/bin/wrangler.js");
mkdirSync(".cloudflare/production-router-package", { recursive: true });
mkdirSync(".cloudflare/production-platform-package", { recursive: true });
mkdirSync(".cloudflare/config", { recursive: true });

function dryRun(config: string, outdir: string) {
  const result = spawnSync(process.execPath, [
    wrangler,
    "deploy",
    "--dry-run",
    "--config",
    config,
    "--outdir",
    outdir,
  ], {
    stdio: "inherit",
    env: {
      ...process.env,
      WRANGLER_SEND_METRICS: "false",
      XDG_CONFIG_HOME: resolve(".cloudflare/config"),
    },
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `Wrangler dry-run packaging failed for ${config}`);
}

dryRun("cloudflare/production-router.jsonc", ".cloudflare/production-router-package");
dryRun("cloudflare/production-platform.jsonc", ".cloudflare/production-platform-package");
console.log("PASS production Router and private Platform configs package with Wrangler dry-run; no deploy performed");
