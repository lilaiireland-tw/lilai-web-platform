# Cloudflare standalone staging deployment (Part of #3)

This runbook prepares the first real Cloudflare staging deployment. It does not
authorize or perform that deployment. The frontend is `lilai-web-platform-staging`,
reachable only at its default `workers.dev` URL and protected by Cloudflare Access.
A private `site-creator-vinext-starter-staging` backend is bound by service name;
there is no CMS fixture Worker, production binding or custom staging domain.

The implementation keeps Next.js 16.2.10, OpenNext 1.20.1 and Wrangler 4.148.0.
No production DNS record, zone route, WordPress/WooCommerce setting, production
Worker, or existing signup Worker is changed.

## Read-only account snapshot

The 2026-10-07 discovery recorded account
`622900d9297cd7c09cad966aaae64617`, Workers subdomain `lilaiireland`, and no
existing `lilai-web-platform-staging` Worker. Existing Workers included
`site-creator-vinext-starter`, which owns both the bare and descendant
`/language-school-signup` production routes. The zone also had a no-script
`*.lilaiireland.com/*` exclusion. This snapshot is evidence for isolation, not
permission to edit any route, DNS record or existing Worker. Re-export current
state before any later production routing work.

## Standalone preview behavior

The staging build retains:

- `SITE_DEPLOYMENT_ENV=staging`
- `EVENT_DEPLOYMENT_ENV=preview`
- `EVENTS_INCLUDE_DRAFTS=false`
- public canonicals rooted at `https://lilaiireland.com`
- `X-Robots-Tag: noindex, nofollow` on every Worker response
- GET/HEAD-only handling except the exact signup endpoints: GET
  `/language-school-signup/api/turnstile-config` and POST
  `/language-school-signup/api/applications`. Unsupported methods return `405`.
- the build-time production-environment mismatch guard

The homepage, shared layout, `robots.txt`, empty staging sitemap, `/events`,
registered event pages, `/language-school-signup/` and their static assets are served by the OpenNext Worker.
Static files are served from the same Worker's Static Assets binding.

Staging does not bind a WordPress or WooCommerce URL. Next.js WordPress rewrites
are omitted when `SITE_DEPLOYMENT_ENV=staging`, and the staging data clients throw
before fetching. At the edge, only the frontend route allowlist reaches OpenNext.
All other GET/HEAD paths, including WordPress, WooCommerce, products and CMS-backed
catch-all pages, return:

```text
503 WordPress and WooCommerce routes are unavailable in standalone staging.
X-Lilai-Staging-Limitation: wordpress-woocommerce-unavailable
Cache-Control: no-store
X-Robots-Tag: noindex, nofollow
```

Unknown event routes remain platform-owned `404` responses. Missing files under
the static namespaces remain asset `404`s. The Worker returns the same explicit
standalone `503` for `/_next/image`; it is never executed as a dynamic image proxy
in this mode. This prevents staging requests
from reaching the production CMS through rewrites, data APIs or image optimization.

## Isolation and permissions

`wrangler.jsonc` fixes all deployment scope:

- name: `lilai-web-platform-staging`
- account: `622900d9297cd7c09cad966aaae64617`
- `workers_dev: true`
- `preview_urls: false`
- `routes: []`
- one `SIGNUP_BACKEND` service targeting only `site-creator-vinext-starter-staging`
- no KV, R2, D1, Queue or Durable Object bindings on the Platform itself
- no WordPress/WooCommerce URLs or secrets

The deployment script rejects a different Worker name, account, hosting mode,
route list, environment pair, Git ref or missing Access confirmation. Its normal
deploy path also performs a read-only deployment-list preflight and refuses to
create a missing Worker. This is intentional: the Worker must already exist with
its public URL disabled so Access can be attached before `workers.dev` is enabled.

Use a dedicated account-owned Staging API token with Workers Scripts edit and
D1 edit for the explicit staging migration step. Do not grant DNS edit, zone Workers
Routes edit, WordPress or WooCommerce permissions. The Access
administrator may be a separate human/account role; do not add Access permissions
to the CI deploy token.

## Signup Staging integration

The signup page is `/language-school-signup/`; the bare URL redirects there while
preserving query parameters. Only `lilai-assets/`, `og.png`, `favicon.svg` and
the existing shared asset namespaces are allowed. Every other signup descendant
is denied before Static Assets or Next can handle it.

The Platform intercepts the two exact signup API paths before Next's local-only
bridge. POST requires Origin
`https://lilai-web-platform-staging.lilaiireland.workers.dev`, JSON, a UUID
Idempotency-Key and at most 32KB, including streamed bodies without Content-Length.
It strips cookies/authentication headers and never retries POST. The private
backend repeats these guards, verifies Turnstile hostname/action, applies the
original rate limit/schema checks and writes only to `lilai-applications-staging`
(`370f3f4a-a1dd-40d7-8e2d-097fe835747f`). It has no public URL/routes.

The dedicated `cloudflare/signup-staging.jsonc` replaces the unused legacy
`--env staging` configuration for this pipeline. The legacy file and all
production configuration remain unchanged. Service Bindings are:

- Platform `SIGNUP_BACKEND` -> `site-creator-vinext-starter-staging`
- Backend `PLATFORM` -> `lilai-web-platform-staging` for page/assets only

No real Queue producer/consumer, Cron, Gmail or Notion code is used by the new
Staging entry. The original three job rows are retained as pending test data;
a Mock Queue acknowledges enqueue calls without delivering work. Do not later
attach consumers/Cron to this database without handling the pending test rows.

Before the first deployment of this fix, configure an existing private backend
Worker with a **Staging-only Turnstile widget**. Its frontend hostname must be
`lilai-web-platform-staging.lilaiireland.workers.dev`, and the action is
`application_submit`. Store its keys as `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET`
on `site-creator-vinext-starter-staging` through the normal secret-management flow.
Do not copy/retrieve production secrets. The deployment checks only secret names,
not values, before any Staging migration. Missing keys remain fail-closed.
Cloudflare dummy keys omit `action` and return `example.com`, so they cannot pass
the unchanged strict checks; no production verification is weakened for testing.
See [Turnstile testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

After review, merge to `develop` or dispatch **Cloudflare staging** with `develop`
selected. Keep the existing Access/branch/environment gates and give the Staging
token D1 edit for the fixed database operation. `npm run cf:deploy` now builds
Staging, checks the private backend/key names, applies only the Staging SQL
migrations, deploys only the private Staging backend, then deploys Staging Platform.
If existing Staging tables were provisioned outside Wrangler's migration tracking,
reconcile their history before enabling this migration step; do not reset a D1.
No Production operation is part of this sequence. No deployment was performed
while preparing this fix.

Fix validation from `develop` baseline `4118474`: clean offline npm ci;
root/Workers/backend TypeScript; OpenNext staging build and both staging
Wrangler dry-runs; 9 new staging contract/Service Binding/local-D1 tests and
26 existing backend tests; 10 frontend contract tests and Chromium forms at
375/768/1440px; actual OpenNext workerd HTTP checks for signup page/assets,
canonical/slash/query, noindex and shared shell; existing production route-safety,
router/routing and release-strategy checks. Providers were mocked and no remote
D1 was accessed. The new staging tests also force a local D1 transaction failure,
verify application/job rollback, then verify retry succeeds. Live Access,
backend/key readiness, actual service bindings, Stage D1 migration history and
real Turnstile validation still require deployment-time verification.

## Local verification

Use Node 22 or newer. On Windows, use `npm.cmd` / `npx.cmd` if PowerShell blocks
the `.ps1` shims. OpenNext warns that Windows support is incomplete; GitHub Actions
runs the same verification on Ubuntu. A Windows checkout whose absolute path
contains non-ASCII characters may trigger a Node/OpenNext recursive-copy crash.
Run from an ASCII-only checkout or a temporary `subst` drive and remove that drive
after the test; do not change dependencies to work around the local path issue.

```sh
npm ci
npm run cf:typegen
npm run signup:typecheck
npm run signup:test
npm run check:signup-staging
npx playwright install chromium
npm run check:signup
npx tsc --noEmit --incremental false
npx tsc -p cloudflare/tsconfig.json
npm run check:staging
npx tsx scripts/check-deployment-policy.ts
npx tsx scripts/check-shared-layout.ts
npx tsx scripts/check-design-system.ts
npx tsx scripts/check-cloudflare-staging.ts
npm run build
git diff --check
```

`check-cloudflare-staging.ts` performs the OpenNext build, populates the local
static cache, runs `wrangler deploy --dry-run`, starts local workerd, and checks
the homepage, robots, sitemap, events, assets, unknown events, CMS/Woo `503`s,
dynamic image proxy denial, noindex headers and write rejection. It does not use
Cloudflare credentials or contact any CMS.

`npm run lint` remains unavailable because the repository still invokes the
removed `next lint` command. This issue does not change lint infrastructure.

## Access bootstrap: required manual gate

The Worker did not exist in the read-only account inventory recorded on
2026-10-07. Worker-level Access cannot be attached until the Worker exists, while
the first normal deploy would otherwise enable its public `workers.dev` URL.
Therefore the first release has a two-stage manual bootstrap. Do not use
account-wide Access: it could change access to the existing signup and other
Workers.

After this PR is approved and explicit Cloudflare authorization is given:

1. Check out the approved `develop` commit and run all local verification above.
2. Create a dedicated Workers Scripts edit token. Set it only in the operator's
   protected shell together with the account ID; never paste it into chat or a
   committed file.
3. Explicitly acknowledge the exact single-Worker target and run the bootstrap:

   ```powershell
   $env:SITE_DEPLOYMENT_ENV = 'staging'
   $env:EVENT_DEPLOYMENT_ENV = 'preview'
   $env:EVENTS_INCLUDE_DRAFTS = 'false'
   $env:CLOUDFLARE_ACCOUNT_ID = '622900d9297cd7c09cad966aaae64617'
   $env:CLOUDFLARE_BOOTSTRAP_CONFIRMED = 'lilai-web-platform-staging'
   $env:CLOUDFLARE_API_TOKEN = '<protected token>'
   npm run cf:bootstrap-access
   ```

   This creates `lilai-web-platform-staging` with `workers_dev: false`,
   `preview_urls: false` and no zone routes or custom domain. It uploads the same
   application to the single target Worker but exposes no public endpoint.
4. In Cloudflare Dashboard, go to **Workers & Pages**, select
   **lilai-web-platform-staging**, open **Access**, and select
   **Protect this Worker behind Access**. Choose **All traffic**, not
   **Previews only**. Attach an Allow policy limited to the intended reviewers
   (for example, named Cloudflare account members or a verified organizational
   email domain), set the required session duration, and select **Apply Access**.
5. In Zero Trust > Access > Applications, confirm the application targets the
   `lilai-web-platform-staging` Worker and uses reusable policies. Verify there is
   no `Everyone` Allow or Bypass policy. Record the Access application/policy IDs
   in the private release record, not in this repository.
6. Confirm the Worker still has no Worker URL, Preview URL, custom domain or zone
   route. Do not enable the URL manually.

These steps are based on Cloudflare's current Worker-level Access flow, which
protects the Worker's routes, custom domains, `workers.dev` URL and previews.
See [Cloudflare Access for Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/).

The task must stop here until a reviewer verifies the Access configuration. Do
not set either deployment gate merely because the bootstrap command succeeded.

## GitHub staging environment and live deployment

After the manual Access review, configure the GitHub `staging` environment:

- required reviewers and deployment branch restricted to `develop`
- variable `CLOUDFLARE_ACCOUNT_ID=622900d9297cd7c09cad966aaae64617`
- variable `CLOUDFLARE_ACCESS_CONFIRMED=true`, set only after the review above
- secret `CLOUDFLARE_API_TOKEN` with Workers Scripts edit and D1 edit for Staging
- repository variable `CLOUDFLARE_STAGING_ENABLED=true`, set last

Do not configure WordPress/WooCommerce origins. The `verify` job runs for PRs,
pushes to `develop`, and manual dispatches without credentials or the GitHub
environment. The serialized `deploy` job runs only after `verify`, only on
`refs/heads/develop`, and only when `CLOUDFLARE_STAGING_ENABLED` is exactly
`true`. The deployment script also checks the account, existing Worker and Access
attestation before building or uploading.

The approved live procedure is:

1. Record the approved Git SHA and current placeholder deployment/version ID.
2. Recheck Worker-level Access and the absence of routes/custom domains.
3. Enable `CLOUDFLARE_STAGING_ENABLED`, then manually dispatch **Cloudflare
   staging** on `develop` (or use the next approved `develop` push).
4. Confirm `verify` passes before `deploy` starts. It checks the private backend's
   Turnstile secret names, applies only Staging migrations, deploys that private
   backend and then the Platform script/assets/vars. It owns no production route.
5. Record the exact URL issued by Cloudflare, deployment/version ID, Git SHA,
   workflow URL, operator and timestamp. The expected hostname form is
   `lilai-web-platform-staging.<account-subdomain>.workers.dev`; the emitted URL
   is authoritative.
6. Before sharing the URL, use an unauthenticated private/incognito request and
   confirm Access blocks or redirects it before the Worker response is visible.
   Then sign in as an allowed reviewer and confirm the app loads. Also test a
   reviewer who is not allowed.

If Access is absent, bypassed, mis-scoped or not testable, immediately disable
the Worker URL or roll back to the bootstrap state and stop. Noindex is not an
authentication control.

## Live smoke tests

After Access passes the negative and positive checks, run the read-only smoke
test through an authenticated browser session or a narrowly scoped Access service
token. For a service token, export both values only in the protected shell:

```powershell
$env:CHECK_BASE_URL = '<recorded workers.dev origin>'
$env:CHECK_DEPLOYMENT_ENV = 'staging'
$env:CF_ACCESS_CLIENT_ID = '<service-token client id>'
$env:CF_ACCESS_CLIENT_SECRET = '<service-token secret>'
npx tsx scripts/check-deployment-smoke.ts
```

The checker sends only GET/HEAD requests and validates:

- homepage, canonical, robots and empty sitemap
- event index, Daydream page and a real event image
- unknown event `404`
- WordPress REST, product and generic CMS path `503` responses
- noindex on all Worker responses

Also perform browser QA at 375px and 1440px for the shared shell, sticky header,
overflow, keyboard/focus-visible behavior, event navigation/assets/CTAs, and
console or hydration errors. GET/HEAD smoke remains read-only. After deployment,
use only synthetic `example.invalid` contact data for an authorized Staging form
check, then inspect only Staging D1 for ST codes, deduplication and pending jobs.
Check Workers logs for outbound
requests; there must be no request to `lilaiireland.com`, `cms.lilaiireland.com`,
WordPress, WooCommerce or the production signup Worker. Only the private Staging
signup service and Turnstile Siteverify are expected.

## Rollback

For an application regression while Access remains correct:

1. Disable `CLOUDFLARE_STAGING_ENABLED` to stop further CI publication.
2. Record the failing deployment/version ID and logs.
3. Use Cloudflare's deployment rollback to restore the recorded known-good
   staging version, or check out the known-good `develop` SHA and run the same
   reviewed deploy workflow.
4. Repeat Access and read-only smoke checks. Worker rollback does not restore
   external configuration, so separately recheck Access and the Worker URL.

For any Access failure or unintended public exposure:

1. Disable the Worker's `workers.dev` URL immediately. Do not add a custom domain,
   production route or temporary public bypass.
2. Keep the Worker and Access records for incident review; do not delete the
   signup Worker or alter production DNS/routes.
3. Repair and independently verify Worker-level Access while the URL is disabled.
4. Re-enable publication only through the approved gated workflow.

To return to the pre-public bootstrap state, deploy the approved configuration
with `workers_dev: false` using the explicitly authorized bootstrap procedure.
No production traffic rollback is involved because staging owns no production
route or domain.

## Remaining limitations

- CMS-backed pages, posts, product pages, cart, checkout, account, REST and media
  are intentionally unavailable in standalone staging.
- WordPress fallback/status/redirect fidelity, Woo sessions and dynamic CMS image
  optimization cannot be validated until a separate nonproduction integration is
  approved.
- ISR and on-demand revalidation remain unprovisioned; staging uses the build's
  read-only Static Assets cache.
- Local workerd cannot prove Cloudflare Access, provider-edge failures or the live
  provider URL. The manual gate and live checks above remain mandatory.
- Production routing, event collision inventory, signup dependencies and the
  production cutover/rollback matrix remain later Issue #3 release gates.
