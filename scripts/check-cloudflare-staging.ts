import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";

// Integration test: build and run the real adapter in local workerd, using only
// loopback CMS fixtures. Never load credentials or submit a production request.
async function main() {
  const originRequests: string[] = [];
  const origin = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://fixture");
    originRequests.push(`${request.method} ${url.pathname}`);
    if (url.pathname.endsWith("/redirect")) {
      response.writeHead(302, { Location: "/fixture-target", "Set-Cookie": "fixture=1; HttpOnly" });
      response.end();
    } else if (url.pathname.endsWith("/error")) {
      response.writeHead(503);
      response.end("Fixture origin unavailable");
    } else {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(url.pathname.startsWith("/wp-json/wp/v2/") ? [] : { fixture: true }));
    }
  });
  const reuseBuild = process.argv.includes("--skip-build");
  const fixturePort = reuseBuild ? Number(new URL(JSON.parse(readFileSync(".cloudflare/wrangler-staging.json", "utf8")).vars.WORDPRESS_ORIGIN).port) : 0;
  origin.listen(fixturePort, "127.0.0.1");
  await once(origin, "listening");
  const address = origin.address();
  assert(address && typeof address !== "string");
  const fixture = `http://127.0.0.1:${address.port}`;
  const env = {
    ...process.env, SITE_DEPLOYMENT_ENV: "staging", EVENT_DEPLOYMENT_ENV: "preview",
    EVENTS_INCLUDE_DRAFTS: "false", WORDPRESS_ORIGIN: fixture,
    WORDPRESS_API_BASE: `${fixture}/wp-json/wp/v2`,
    WOOCOMMERCE_STORE_API_BASE: `${fixture}/wp-json/wc/store/v1`,
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
    for (const [path, status] of [
      ["/events", 200], ["/events/daydream-adventure-2027", 200],
      ["/events/missing-fixture", 404], ["/events/missing.png", 404],
      ["/events/daydream-adventure-2027/arsha.webp?smoke=1", 200],
      ["/assets/lilai-logo.png", 200], ["/fonts/NotoSansTC-Regular.woff2", 200],
      ["/wp-json/probe", 200], ["/wp-content/probe", 200], ["/wp-admin/probe", 200],
      ["/cart/probe", 200], ["/checkout/probe", 200], ["/my-account/probe", 200],
      ["/wp-json/redirect", 302], ["/wp-json/error", 503], ["/missing-fixture", 404],
    ] as const) {
      const response = await get(path);
      if (response.status !== status) console.error({ path, body: await response.text(), originRequests });
      assert.equal(response.status, status, `${path}\n${logs}`);
      assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", path);
      if (status === 302) {
        assert.equal(response.headers.get("location"), "/fixture-target");
        assert.equal(response.headers.get("set-cookie"), "fixture=1; HttpOnly");
      }
      await response.arrayBuffer();
      console.log(`PASS workerd ${status} + noindex: ${path}`);
    }
    const denied = await get("/wp-json/write-probe", "POST");
    assert.equal(denied.status, 405);
    assert.equal(denied.headers.get("x-robots-tag"), "noindex, nofollow");
    assert(!originRequests.includes("POST /wp-json/write-probe"));
    console.log("PASS staging write rejected before reaching fixture origin");
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
    await new Promise<void>(resolve => origin.close(() => resolve()));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
