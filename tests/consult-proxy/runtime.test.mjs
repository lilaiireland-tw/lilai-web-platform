import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";
import { Miniflare, Response, convertV4MiniflareOptions } from "miniflare";
import { assessmentFormContract } from "../../src/components/consult/consult-content.ts";

test("actual existing Router/Platform/staging Workers route exact APIs to Next handler fixture and safe GAS transport", async () => {
  const platform = JSON.parse(await readFile("cloudflare/production-platform.jsonc", "utf8"));
  const router = JSON.parse(await readFile("cloudflare/production-router.jsonc", "utf8"));
  const staging = JSON.parse(await readFile("wrangler.jsonc", "utf8"));
  const paths = ["/api/consult/submissions", "/api/consult/accuracy-feedback"];
  const id = "11111111-1111-4111-8111-111111111111";
  const jobId = "22222222-2222-4222-8222-222222222222";
  const payload = { ...assessmentFormContract, submissionId: id, name: "Synthetic", nickname: "QA", email: "qa@example.test",
    contactConsent: false, marketingConsent: false, discoveryChannels: [], discoveryOther: "", dcardExposure: null };
  const endpoint = "https://script.google.com/macros/s/CONTROLLED_MOCK_ONLY/exec";
  const compile = async (entry, frontend = false) => (await build({
    entryPoints: [entry], bundle: true, format: "esm", platform: "browser", target: "es2022", write: false,
    plugins: frontend ? [{ name: "next-route-handler-fixture", setup(builder) {
      builder.onResolve({ filter: /\.open-next\/worker\.js$/ }, () => ({ path: "frontend", namespace: "fixture" }));
      builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
        // Exercise real Route Handlers and runtime process.env, replacing only the generated Next dispatcher.
        contents: `import { POST as submit } from './src/app/api/consult/submissions/route.ts';
          import { POST as feedback } from './src/app/api/consult/accuracy-feedback/route.ts';
          export default { fetch(request) {
            const path = new URL(request.url).pathname;
            if (path === '${paths[0]}') return submit(request);
            if (path === '${paths[1]}') return feedback(request);
            return new Response('frontend fixture');
          } };`, resolveDir: process.cwd(),
      }));
    } }] : [],
  })).outputFiles[0].text;
  const posts = [];
  let nextAck = { status: "ok", accepted: true, jobId };
  let unexpected = 0;
  const outbound = async request => {
    const url = new URL(request.url);
    if (request.url === endpoint) {
      assert.equal(request.method, "POST");
      assert.equal(request.headers.get("cookie"), null);
      assert.equal(request.headers.get("authorization"), null);
      posts.push(await request.json());
      return new Response(null, { status: 302, headers: { Location: "https://script.googleusercontent.com/macros/echo?user_content_key=mock" } });
    }
    if (url.hostname === "script.googleusercontent.com" && url.pathname === "/macros/echo") {
      assert.equal(request.method, "GET");
      return Response.json(nextAck);
    }
    unexpected++;
    return new Response("origin fixture", { status: 418 });
  };
  const scripts = await Promise.all([
    compile("cloudflare/production-router-worker.ts"), compile("cloudflare/production-platform-worker.ts", true), compile("cloudflare/staging-worker.ts", true),
  ]);
  const workers = [
    { name: router.name, modules: true, script: scripts[0], compatibilityDate: router.compatibility_date, compatibilityFlags: router.compatibility_flags,
      serviceBindings: { PLATFORM: platform.name }, outboundService: outbound },
    { name: platform.name, modules: true, script: scripts[1], compatibilityDate: platform.compatibility_date, compatibilityFlags: platform.compatibility_flags,
      bindings: { ...platform.vars, CONSULT_GAS_ENDPOINT: endpoint }, serviceBindings: { ASSETS: () => new Response(null, { status: 404 }) }, outboundService: outbound },
    { name: staging.name, modules: true, script: scripts[2], compatibilityDate: staging.compatibility_date, compatibilityFlags: staging.compatibility_flags,
      bindings: { ...staging.vars, CONSULT_GAS_ENDPOINT: endpoint },
      serviceBindings: { ASSETS: () => new Response(null, { status: 404 }), SIGNUP_BACKEND: () => new Response("signup fixture") }, outboundService: outbound },
  ];
  const mf = new Miniflare(convertV4MiniflareOptions({ workers }));
  try {
    await mf.ready;
    for (const workerName of [router.name, staging.name]) {
      if (workerName === staging.name) await mf.setOptions(convertV4MiniflareOptions({ workers: [workers[2], workers[0], workers[1]] }));
      const worker = { fetch: (...args) => mf.dispatchFetch(...args) };
      const origin = workerName === router.name ? "https://lilaiireland.com" : "https://isolated-staging.test";
      const post = (path, body) => worker.fetch(origin + path, { method: "POST", body: JSON.stringify(body), headers: {
        Origin: origin, "Content-Type": "application/json", "X-Consult-Request": "1", Cookie: "private=strip", Authorization: "Bearer strip",
      } });
      nextAck = { status: "ok", accepted: true, jobId };
      const response = await post(paths[0], payload);
      assert.equal(response.status, 200, workerName + " " + await response.clone().text());
      assert.deepEqual(await response.json(), { ...nextAck, submissionId: id });
      assert.deepEqual(posts.at(-1), payload);
      nextAck = { status: "error" };
      assert.equal((await post(paths[0], payload)).status, 502);
      nextAck = { status: "ok" };
      assert.equal((await post(paths[1], { type: "accuracy_feedback", submissionId: id, jobId, name: "Synthetic", nickname: "QA", email: "qa@example.test", accuracyAnswer: "還好" })).status, 200);
      if (workerName === staging.name) {
        assert.equal((await post("/api/other", {})).status, 405);
        assert.equal((await post(`${paths[0]}/child`, {})).status, 405);
        assert.equal(await (await worker.fetch(origin + "/language-school-signup/api/turnstile-config")).text(), "signup fixture");
      } else {
        assert.equal((await post("/api/other", {})).status, 418);
        assert.equal((await worker.fetch(origin + "/wp-json/")).status, 418);
        assert.equal(await (await worker.fetch(origin + "/")).text(), "frontend fixture");
      }
    }
    assert.equal(posts.length, 6);
    assert.equal(unexpected, 2); // Only the two intentional WordPress fallback fixtures.
  } finally { await mf.dispose(); }
});
