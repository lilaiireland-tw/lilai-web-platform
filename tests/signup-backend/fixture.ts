import { readFile } from "node:fs/promises";
import { build } from "esbuild";
import { Miniflare, Response, convertV4MiniflareOptions } from "miniflare";
import { unstable_splitSqlQuery } from "wrangler";

// Real Workers/D1, with every outbound provider request handled in process.
export async function createSignupTestBackend() {
  const config = JSON.parse((await readFile("cloudflare/signup-backend/wrangler.jsonc", "utf8")).replace(/^\/\/.*$/gm, ""));
  const bundle = await build({ entryPoints: ["worker/signup/index.ts"], bundle: true, format: "esm", platform: "browser", target: "es2022", write: false });
  const state = {
    emailStatus: 200, notionStatus: 200, existingNotionPage: false,
    gmailSends: 0, notionCreates: 0, platformRequests: [] as string[], unexpected: [] as string[],
  };
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: bundle.outputFiles[0].text,
    compatibilityDate: config.compatibility_date, compatibilityFlags: config.compatibility_flags,
    d1Databases: ["DB"], queueProducers: { INTEGRATION_QUEUE: "signup-test" },
    ratelimits: { APPLICATION_RATE_LIMITER: { namespace_id: "76082803", simple: { limit: 30, period: 60 } } },
    bindings: {
      ...config.vars, ADMIN_API_TOKEN: "local-admin-fixture",
      TURNSTILE_SITE_KEY: "local-fixture", TURNSTILE_SECRET: "local-secret-fixture", TURNSTILE_HOSTNAMES: "localhost",
      GMAIL_CLIENT_ID: "local-client", GMAIL_CLIENT_SECRET: "local-client-secret", GMAIL_REFRESH_TOKEN: "local-refresh",
      GMAIL_SENDER_EMAIL: "lilaiireland@gmail.com", NOTION_TOKEN: "local-notion", NOTION_DATABASE_ID: "local-notion-db",
    },
    serviceBindings: { PLATFORM: request => {
      state.platformRequests.push(request.url);
      return new Response("platform page fixture", { headers: { "Content-Type": "text/html" } });
    } },
    outboundService: async request => {
      const url = new URL(request.url);
      if (url.href === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
        const body = new URLSearchParams(await request.text());
        const token = body.get("response");
        if (token === "unavailable") return new Response("unavailable", { status: 503 });
        return Response.json({ success: token !== "invalid", action: token === "wrong-action" ? "other" : "application_submit", hostname: token === "wrong-host" ? "attacker.invalid" : "localhost" });
      }
      if (url.href === "https://oauth2.googleapis.com/token") return Response.json({ access_token: "local-access-fixture" });
      if (url.href === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
        state.gmailSends++;
        return Response.json({ id: "local-message-" + state.gmailSends }, { status: state.emailStatus });
      }
      if (url.href === "https://api.notion.com/v1/databases/local-notion-db/query") {
        return Response.json({ results: state.existingNotionPage ? [{ id: "existing-local-page" }] : [] });
      }
      if (url.href === "https://api.notion.com/v1/pages") {
        state.notionCreates++;
        return Response.json({ id: "local-page-" + state.notionCreates }, { status: state.notionStatus });
      }
      state.unexpected.push(request.url);
      throw new Error("Unexpected outbound request: " + request.url);
    },
  }));
  try {
    await mf.ready;
    const db = await mf.getD1Database("DB");
    for (const name of ["0001_create_application_tables.sql", "0002_add_application_reference_codes.sql"]) {
      const sql = await readFile("migrations/signup/" + name, "utf8");
      await db.batch(unstable_splitSqlQuery(sql).map(statement => db.prepare(statement)));
    }
    return { mf, db, state, origin: (await mf.ready).origin };
  } catch (error) {
    await mf.dispose();
    throw error;
  }
}
