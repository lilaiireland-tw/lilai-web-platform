import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STAGING_PLATFORM, STAGING_SIGNUP_BACKEND, STAGING_SIGNUP_ORIGIN } from "../cloudflare/staging-signup";

export const signupStagingConfigPath = "cloudflare/signup-staging.jsonc";

export function assertStagingSignupConfig(
  platform = JSON.parse(readFileSync("wrangler.jsonc", "utf8")),
  backend = JSON.parse(readFileSync(signupStagingConfigPath, "utf8")),
) {
  assert.equal(platform.name, STAGING_PLATFORM);
  assert.deepEqual(platform.services, [{ binding: "SIGNUP_BACKEND", service: STAGING_SIGNUP_BACKEND }]);
  assert.equal(backend.name, STAGING_SIGNUP_BACKEND);
  assert.equal(backend.account_id, platform.account_id);
  assert.equal(backend.main, "../worker/signup/staging.ts");
  assert.equal(backend.workers_dev, false);
  assert.equal(backend.preview_urls, false);
  assert.deepEqual(backend.routes, []);
  assert.equal(backend.route, undefined);
  assert.equal(platform.route, undefined);
  assert.deepEqual(backend.d1_databases, [{
    binding: "DB", database_name: "lilai-applications-staging",
    database_id: "370f3f4a-a1dd-40d7-8e2d-097fe835747f", migrations_dir: "../migrations/signup",
  }]);
  assert.deepEqual(backend.services, [{ binding: "PLATFORM", service: STAGING_PLATFORM }]);
  assert.deepEqual(backend.queues, { producers: [], consumers: [] });
  assert.deepEqual(backend.triggers.crons, []);
  assert.deepEqual(backend.secrets.required, ["TURNSTILE_SITE_KEY", "TURNSTILE_SECRET"]);
  assert.equal(backend.vars.SITE_DEPLOYMENT_ENV, "staging");
  assert.equal(backend.vars.TURNSTILE_HOSTNAMES, new URL(STAGING_SIGNUP_ORIGIN).hostname);
  assert.equal(backend.ratelimits[0].namespace_id, "76082802");
  assert.equal(backend.env, undefined, "Staging config must not contain a production environment");
}
