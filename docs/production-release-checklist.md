# Production release checklist

Status: **NO-GO for public cutover** until every account and origin blocker below
has current evidence and the release owner explicitly approves Phase D.

The production Platform and Router configurations are prepared with
`workers_dev: false`, `preview_urls: false`, and `routes: []`. Router calls the
Platform through the `PLATFORM` Service Binding. No step in the workflow attaches
a route. Validation runs on pull requests and pushes to `develop`; the production
deployment job can run only from `workflow_dispatch` on `develop` with explicit
confirmation.
The existing staging workflow is unchanged.

## Ready now

- Existing allowlist covers `/`, `/consult` and slash form, `/events`,
  `/events/`, `/events/*`, and the required Next static asset prefixes.
- WordPress/WooCommerce endpoints, query handlers, unknown non-event URLs, and
  signup exclusions remain represented by the existing policy tests.
- Router forwards the original `Request` and returns original origin responses;
  tests cover POST body/cookie, redirects, multiple cookies, status, HEAD,
  streaming, propagated failures, and no retry after a Service Binding failure.
- New isolated mock harness exercises homepage/events, JavaScript, CSS, images,
  fonts, 404 boundaries, origin fallthrough, one-call behavior, failure detection,
  and route-removal rollback semantics. It does not call production services.
- Manual workflow builds production-marked artifacts. Its optional private-deploy
  job runs only from `workflow_dispatch` after the operator sets
  `deploy_private_workers=true`; the GitHub `production` environment can add an
  approval gate. Both deployment configs still have no public route or URL.
- Rollback procedure below removes only the newly attached Router Route.

## Can be completed automatically

Run on Linux/CI from the release commit:

```bash
npm ci
npm run cf:typegen
npm run cf:typegen:router
npx tsc -p cloudflare/tsconfig.json
npx tsc --noEmit --incremental false
npx tsx scripts/check-deployment-policy.ts
npm run check:production-routing
npm run check:production-router
npm run check:production-integration
npm run cf:build:production-platform
npm run check:production-packaging
npm run audit:production-assets
npx tsx scripts/check-shared-layout.ts
npx tsx scripts/check-design-system.ts
npm run build
git diff --check
```

The new report script checks repository public assets and the generated OpenNext
asset tree against the route policy. The production build is expected to produce
`.open-next/assets`; a missing directory means that portion of the inventory did
not run. This audit cannot enumerate the WordPress origin.

GitHub Actions: PRs and pushes to `develop` run validation only. To manually run
validation without deploying, run **Production private Workers (manual only)**
with `deploy_private_workers=false`. To deploy private Workers, dispatch this
workflow on `develop`, then select `true` only after a separately recorded
deployment approval and after confirming
the `production` environment reviewers (if configured),
`CLOUDFLARE_API_TOKEN` secret, and `CLOUDFLARE_ACCOUNT_ID` variable. Both Worker
configs and the variable must target the approved production account
`622900d9297cd7c09cad966aaae64617`; a mismatch fails before either deploy. The
token needs permission to deploy Workers and manage the Service Binding for the
target account. The script builds/deploys Platform first, then Router. Never add
a route in this workflow.

## Requires Cloudflare account evidence

These checks were not available from repository artifacts and remain release
blockers. Use read-only API/dashboard exports and retain them in the operator
release record, not in Git:

- Current complete Worker route table and Worker Custom Domains; verify both
  signup mappings and the wildcard no-script route match the approved baseline.
- Apex and `www` DNS records, targets, proxy state, timestamps, and actual
  WordPress origin target. Do not modify DNS.
- SSL/TLS mode, origin certificate and SNI, and Cloudflare Trace for representative
  platform, signup, and WordPress paths. Do not modify SSL/TLS.
- Redirect, Transform, Origin, Cache, Page Rules and relevant security rules.
  Confirm logged-in, REST write, WooCommerce cart/checkout/account/session and
  payment callback requests bypass HTML caching.
- Full inventory of live `/assets/*`, `/fonts/*`, `/_next/*` paths, legacy event
  backlinks and signup Worker JS/CSS/API dependencies. Repository/build inventory
  is not a CMS namespace inventory; see [asset routing audit](asset-routing-audit.md).
- WordPress.com support confirmation for the proxied Worker Route design and
  evidence that original Host/origin handling works.
- Approved nonproduction plan/evidence for WordPress login, preview, WooCommerce
  session/cart, redirects/cookies/cache and payment callback behavior. No payment
  or form transaction is part of this release preparation.
- Decision and verification for event URL inclusion in the WordPress-owned
  sitemap. No sitemap ownership changes are included here.
- Live isolated Service Binding check after private deployment. Repository tests
  mock the binding and cannot prove account-level binding resolution.

## Must be verified immediately before traffic cutover

## Operator sequence (Phases A–F)

**Phase A — Build and validate.** From the reviewed commit, run the CI command
block under “Can be completed automatically” with production markers. Confirm
the OpenNext build and both Wrangler `--dry-run` packages pass and archive the
asset inventory output. `npm run build` must run with
`SITE_DEPLOYMENT_ENV=production`, `EVENT_DEPLOYMENT_ENV=production`, and
`EVENTS_INCLUDE_DRAFTS=false`.

**Phase B — Deploy both Workers privately.** Only after a separate written
operator approval, manually run **Production private Workers (manual only)** on
`develop`, choose `deploy_private_workers=true`, and approve the `production`
environment if it has reviewers. The deployment command is:

```bash
npm ci
npm run cf:build:production-platform
npm run cf:deploy:production-private -- --confirm-private-production-deploy
```

Required credential: `CLOUDFLARE_API_TOKEN`; GitHub variable:
`CLOUDFLARE_ACCOUNT_ID`. Confirm the token is scoped to deploy Workers and
configure Service Bindings in the target account. This action deploys
`lilai-web-platform-production` and then `lilai-web-platform-router`, each with
no public URL or route. The explicit confirmation is the manual workflow input
and the `--confirm-private-production-deploy` argument; neither is implied by
merge or push.

**Phase C — Verify private Worker communication in isolation.** Run the local
automated harness:

```bash
npm run check:production-integration
npm run check:production-router
```

These use isolated mock services and verify dispatch, representative assets,
WordPress response transparency, failures and no retry/loop. They do not prove
Cloudflare account-level Service Binding resolution. Before cutover, use an
approved isolated runtime/account path to send GET/HEAD probes to the deployed
private Router and record that its `PLATFORM` binding reaches the reviewed
Platform version. Keep both public route lists empty. This account-level check
is still outstanding; do not infer it from local test success.

**Phase D — Attach the route manually.** After the evidence and cutover approval
are recorded, manually add exactly
`lilaiireland.com/* -> lilai-web-platform-router` in Cloudflare Workers Routes.
No repository command or workflow attaches this route. Keep the wildcard
no-script route and both signup routes unchanged. Do not modify DNS, SSL/TLS,
WordPress, or WooCommerce.

**Phase E — Run immediate production smoke tests.** Execute the GET/HEAD and
browser checks below immediately after adding the route; verify logs/owner for
Platform, signup and WordPress and compare origin responses with the saved
baseline. Stop traffic and proceed to Phase F on any unexpected status, cookie,
redirect, cache, canonical or route owner.

**Phase F — Roll back if needed.** Remove only the new Router Route using the
rollback procedure below, then rerun the read-only matrix. Do not restore DNS or
change the signup Worker routes.

### Pre-cutover evidence gate

1. Freeze unrelated Cloudflare changes. Record release SHA, versions, operator,
   UTC time, current route/DNS/TLS/rules/cache exports, and rollback owner.
2. Confirm private Platform and Router versions are the reviewed release. Verify
   `workers_dev: false`, `preview_urls: false`, `routes: []` for both, and the
   Router `PLATFORM` Service Binding targets
   `lilai-web-platform-production`.
3. In an isolated environment, verify binding communication, production marker,
   homepage/event/static responses, WordPress passthrough, failures, and rollback
   before the live route is changed. A private production binding rehearsal is
   still an account operation and needs its own approval.
4. Re-export routes immediately before cutover. Abort on any difference in the
   signup routes, wildcard no-script entry, Worker Custom Domains, or other
   unexpected route precedence.
5. Obtain separate operator approval to add exactly
   `lilaiireland.com/* -> lilai-web-platform-router`. There is no automated route
   attachment command in this repository. Do not edit signup routes, DNS, SSL/TLS,
   WordPress, or WooCommerce.
6. Immediately run the read-only smoke matrix below and monitor Router, Platform,
   and origin errors/latency. Record status, canonical, owner evidence, redirects,
   cookies and console output. Do not submit forms or transactions.

### Smoke checks

Use GET/HEAD and a controlled browser. Keep public origin fixed to
`https://lilaiireland.com`.

```bash
curl -sS -D - -o /tmp/lilai-home.html https://lilaiireland.com/
curl -sS -D - -o /tmp/lilai-events.html https://lilaiireland.com/events
curl -sS -D - -o /dev/null https://lilaiireland.com/events/
curl -sS -D - -o /dev/null 'https://lilaiireland.com/?utm_source=release-smoke'
curl -sS -D - -o /dev/null https://lilaiireland.com/consult
curl -sS -D - -o /dev/null https://lilaiireland.com/consult/
curl -sS -D - -o /dev/null https://lilaiireland.com/language-school-signup
curl -sS -D - -o /dev/null 'https://lilaiireland.com/language-school-signup?utm_source=release-smoke'
curl -sS -D - -o /dev/null https://lilaiireland.com/wp-json/
curl -sS -D - -o /dev/null https://lilaiireland.com/shop/
curl -sS -D - -o /dev/null https://lilaiireland.com/events/not-a-real-event
curl -sS -D - -o /dev/null https://lilaiireland.com/not-a-real-route-release-20261009
```

Extract actual `src`, `href`, and CSS font/image URLs from the two HTML files and
GET every referenced JavaScript, CSS, image and font. Expect homepage/events and
their dependencies from Platform, real signup behavior from its existing Worker,
WordPress system/shop and unknown URLs from WordPress, and unknown event paths
to remain 404. Confirm no CMS hostname, `workers.dev`, request loop, unexpected
redirect, cookie/cache change, or status change. Compare origin-owned responses to
the saved baseline. Also inspect browser at 375px and 1440px for overflow,
focus-visible behavior, navigation, console/hydration errors and asset loads.

Do not use the repository's public production smoke script as a deployment
approval mechanism; it only checks content/headers and does not prove route owner
or account-level Service Binding.

## Rollback

Trigger rollback on incorrect route owner, signup regression, loop, unexpected
4xx/5xx or latency, broken origin/Woo/session/login behavior, hostname leak, or
incorrect canonical/indexing response.

1. Freeze releases and save current route/version/log evidence.
2. In Cloudflare Workers Routes, remove only the newly added
   `lilaiireland.com/* -> lilai-web-platform-router` entry. Preserve the existing
   wildcard no-script entry and both signup routes exactly.
3. Do not change DNS or SSL/TLS. Worker version rollback alone does not remove a
   route; if a Worker version must also be restored, record it as a separate
   action.
4. Repeat the read-only checks. Confirm homepage/events return to their saved
   pre-cutover WordPress behavior, signup remains on the same Worker, and
   WordPress/WooCommerce status, redirects, cookies and system routes match the
   baseline. Purge only affected homepage/event/static cache keys if evidence
   requires it; never replay transactional requests.

## GO / NO-GO

**NO-GO for public traffic cutover today.** Code-level preparation can be
validated automatically, but live origin/TLS/rules/cache, collision inventory,
support confirmation, signup dependency and WooCommerce behavior, and actual
account-level binding verification need evidence before traffic changes.
Production private deployment and route attachment were not performed.
