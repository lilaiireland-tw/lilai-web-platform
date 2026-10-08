import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";

// Integration test: build and run the real standalone adapter in local workerd.
// It never loads credentials, contacts the CMS or submits a production request.
async function main() {
  const reuseBuild = process.argv.includes("--skip-build");
  const env = {
    ...process.env, SITE_DEPLOYMENT_ENV: "staging", EVENT_DEPLOYMENT_ENV: "preview",
    EVENTS_INCLUDE_DRAFTS: "false",
    WRANGLER_LOG_PATH: ".wrangler/logs", WRANGLER_SEND_METRICS: "false", NEXT_TELEMETRY_DISABLED: "1",
  };
  const run = async (args: string[]) => {
    const child = spawn(process.execPath, args, { env, stdio: "inherit" });
    const [code] = await once(child, "exit");
    assert.equal(code, 0, args.join(" "));
  };
  let worker: ReturnType<typeof spawn> | undefined;
  let logs = "";
  try {
    if (!reuseBuild) await run(["node_modules/tsx/dist/cli.mjs", "scripts/cloudflare-staging.ts", "dry-run"]);
    const probe = createServer();
    probe.listen(0, "127.0.0.1");
    await once(probe, "listening");
    const workerAddress = probe.address();
    assert(workerAddress && typeof workerAddress !== "string");
    await new Promise<void>(resolve => probe.close(() => resolve()));
    const base = `http://127.0.0.1:${workerAddress.port}`;
    worker = spawn(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "dev", "--local",
      "--config", ".cloudflare/wrangler-staging.json", "--ip", "127.0.0.1", "--port", String(workerAddress.port),
      "--inspector-port", "0"], { env, stdio: ["ignore", "pipe", "pipe"] });
    worker.stdout?.on("data", data => { logs += data; });
    worker.stderr?.on("data", data => { logs += data; });
    const get = (path: string, method = "GET") => fetch(`${base}${path}`, {
      method, redirect: "manual", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Googlebot" },
    });
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      if (worker.exitCode !== null) throw new Error(logs);
      try { await get("/"); ready = true; break; } catch { /* starting */ }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    assert(ready, logs);
    const smoke = spawn(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/check-deployment-smoke.ts"], {
      env: { ...env, CHECK_BASE_URL: base, CHECK_DEPLOYMENT_ENV: "staging" }, stdio: "inherit",
    });
    assert.equal((await once(smoke, "exit"))[0], 0, logs);
    const brandFontPath = readFileSync("src/styles/fonts.css", "utf8")
      .match(/\/fonts\/noto-sans-tc\/[^)]+\.woff2/)?.[0];
    assert(brandFontPath);
    for (const [path, status] of [
      ["/events", 200], ["/events/daydream-adventure-2027", 200],
      ["/events/missing-fixture", 404], ["/events/missing.png", 404],
      ["/events/daydream-adventure-2027/arsha.webp?smoke=1", 200],
      ["/assets/lilai-logo.png", 200], [brandFontPath, 200],
      ["/_next/image?url=https%3A%2F%2Fcms.lilaiireland.com%2Fprobe.jpg&w=640&q=75", 503],
      ["/wp-json/probe", 503], ["/wp-content/probe", 503], ["/wp-admin/probe", 503],
      ["/cart/probe", 503], ["/checkout/probe", 503], ["/my-account/probe", 503],
      ["/product/probe", 503], ["/about/", 503], ["/events-other", 503],
    ] as const) {
      const response = await get(path);
      if (response.status !== status) console.error({ path, body: await response.text() });
      assert.equal(response.status, status, `${path}\n${logs}`);
      assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", path);
      if (status === 503) {
        assert.equal(response.headers.get("x-lilai-staging-limitation"), "wordpress-woocommerce-unavailable");
        assert.match(await response.text(), /unavailable in standalone staging/);
      } else {
        await response.arrayBuffer();
      }
      console.log(`PASS workerd ${status} + noindex: ${path}`);
    }
    const denied = await get("/wp-json/write-probe", "POST");
    assert.equal(denied.status, 405);
    assert.equal(denied.headers.get("x-robots-tag"), "noindex, nofollow");
    assert.equal(denied.headers.get("allow"), "GET, HEAD");
    console.log("PASS staging write rejected before route handling");
    if (/NoFallbackError|Failed to set to read-only cache/.test(logs)) {
      console.warn("KNOWN LIMITATION: HTTP checks passed, but adapter cache/missing-route diagnostics remain; see .cloudflare/workerd-smoke.log and docs/cloudflare-staging.md");
    }
  } catch (error) {
    if (logs) console.error(logs);
    throw error;
  } finally {
    if (worker && worker.exitCode === null) {
      const exited = once(worker, "exit");
      worker.kill();
      await exited;
    }
    writeFileSync(".cloudflare/workerd-smoke.log", logs);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
