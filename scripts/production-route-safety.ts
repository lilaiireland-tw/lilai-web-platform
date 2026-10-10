import assert from "node:assert/strict";

/** Dashboard owns live Router Routes; Wrangler must not redeclare them. */
export const PRODUCTION_ACCOUNT_ID = "622900d9297cd7c09cad966aaae64617";
export const PRODUCTION_PLATFORM = "lilai-web-platform-production";
export const PRODUCTION_ROUTER = "lilai-web-platform-router";

type WorkerConfig = {
  name?: string;
  account_id?: string;
  workers_dev?: boolean;
  preview_urls?: boolean;
  route?: unknown;
  routes?: unknown;
  services?: unknown;
  vars?: Record<string, string | undefined>;
};
const owns = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

export function assertProductionRouteSafety(platform: WorkerConfig, router: WorkerConfig) {
  assert.equal(platform.name, PRODUCTION_PLATFORM, "Unexpected production Platform Worker");
  assert.equal(platform.account_id, PRODUCTION_ACCOUNT_ID, "Wrong Platform account");
  assert.equal(platform.workers_dev, false, "Platform workers.dev must be disabled");
  assert.equal(platform.preview_urls, false, "Platform previews must be disabled");
  assert(!owns(platform, "route"), "Private Platform must not declare route");
  assert.deepEqual(platform.routes, [], "Private Platform must not attach public routes");

  assert.equal(router.name, PRODUCTION_ROUTER, "Unexpected production Router Worker");
  assert.equal(router.account_id, PRODUCTION_ACCOUNT_ID, "Wrong Router account");
  assert.equal(router.workers_dev, false, "Router workers.dev must be disabled");
  assert.equal(router.preview_urls, false, "Router previews must be disabled");
  assert(!owns(router, "route") && !owns(router, "routes"),
    "Dashboard-managed Router MUST OMIT both route and routes keys, including an empty array");
  assert.deepEqual(router.services, [{ binding: "PLATFORM", service: PRODUCTION_PLATFORM }],
    "Production Router must preserve Platform Service Binding");

  assert.equal(platform.vars?.SITE_DEPLOYMENT_ENV, "production");
  assert.equal(platform.vars?.EVENT_DEPLOYMENT_ENV, "production");
  assert.equal(platform.vars?.EVENTS_INCLUDE_DRAFTS, "false");
  assert.equal(platform.vars?.NEXT_PUBLIC_SITE_URL, "https://lilaiireland.com");
}

/** The only Wrangler deploy command authorized for ordinary production updates. */
export const platformOnlyDeployArgs = (): string[] =>
  ["deploy", "--config", "cloudflare/production-platform.jsonc"];
