import { readFile } from "node:fs/promises";
import { build } from "esbuild";
import { Miniflare, Response, convertV4MiniflareOptions } from "miniflare";
import { unstable_splitSqlQuery } from "wrangler";

export async function createStagingFixture() {
  const platform = JSON.parse(await readFile("wrangler.jsonc", "utf8"));
  const backend = JSON.parse(await readFile("cloudflare/signup-staging.jsonc", "utf8"));
  const compile = async (entry, plugins = []) => (await build({
    entryPoints: [entry], bundle: true, format: "esm", platform: "browser", target: "es2022", write: false, plugins,
  })).outputFiles[0].text;
  const platformScript = await compile("cloudflare/staging-worker.ts", [{
    name: "frontend-fixture",
    setup(build) {
      build.onResolve({ filter: /\.open-next\/worker\.js$/ }, () => ({ path: "frontend", namespace: "fixture" }));
      build.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: "export default { fetch(request) { return new Response('frontend fixture: ' + new URL(request.url).pathname); } }" }));
    },
  }]);
  const backendScript = await compile("worker/signup/staging.ts");
  const state = { unexpected: [], siteverify: 0, assets: [] };
  const redeemed = new Set();
  const outbound = async request => {
    if (request.url !== "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      state.unexpected.push(request.url);
      throw Error("External request blocked: " + request.url);
    }
    state.siteverify++;
    const token = new URLSearchParams(await request.text()).get("response");
    if (token === "unavailable") return new Response("unavailable", { status: 503 });
    const success = token?.startsWith("valid-") && !redeemed.has(token);
    redeemed.add(token);
    return Response.json({
      success: Boolean(success), action: token === "valid-wrong-action" ? "wrong" : "application_submit",
      hostname: token === "valid-wrong-host" ? "lilaiireland.com" : backend.vars.TURNSTILE_HOSTNAMES,
    });
  };
  const mf = new Miniflare(convertV4MiniflareOptions({
    workers: [{
      name: platform.name, modules: true, script: platformScript,
      compatibilityDate: platform.compatibility_date, compatibilityFlags: platform.compatibility_flags,
      bindings: platform.vars,
      serviceBindings: {
        SIGNUP_BACKEND: backend.name,
        ASSETS: request => {
          const path = new URL(request.url).pathname;
          state.assets.push(path);
          return new Response("asset fixture", { status: ["/language-school-signup", "/language-school-signup/"].includes(path) ? 404 : 200 });
        },
      }, outboundService: outbound,
    }, {
      name: backend.name, modules: true, script: backendScript,
      compatibilityDate: backend.compatibility_date, compatibilityFlags: backend.compatibility_flags,
      bindings: { ...backend.vars, TURNSTILE_SITE_KEY: "stage-fixture", TURNSTILE_SECRET: "stage-secret-fixture" },
      d1Databases: { DB: backend.d1_databases[0].database_id },
      ratelimits: { APPLICATION_RATE_LIMITER: { namespace_id: "76082802", simple: { limit: 30, period: 60 } } },
      serviceBindings: { PLATFORM: platform.name }, outboundService: outbound,
    }],
  }));
  try {
    await mf.ready;
    const db = await mf.getD1Database("DB", backend.name);
    for (const name of ["0001_create_application_tables.sql", "0002_add_application_reference_codes.sql"]) {
      await db.batch(unstable_splitSqlQuery(await readFile("migrations/signup/" + name, "utf8")).map(sql => db.prepare(sql)));
    }
    return { mf, db, state, backend: await mf.getWorker(backend.name) };
  } catch (error) { await mf.dispose(); throw error; }
}
