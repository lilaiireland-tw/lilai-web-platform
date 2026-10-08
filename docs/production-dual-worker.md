# Production dual-Worker implementation (Issue #3)

This is an implementation candidate, not a production release. Both Worker
configs intentionally have `routes: []`, `workers_dev: false`, and preview URLs
disabled. No Cloudflare route, DNS record, origin, WordPress setting, or
production traffic was changed.

## Request flow

```text
future approved Cloudflare Route: lilaiireland.com/*
                         |
                         v
             lilai-web-platform-router
                 /              \
                /                \
   explicit platform paths       all other paths
              |                         |
              v                         v
       PLATFORM Service Binding     fetch(request)
              |                  current zone origin
              v
  lilai-web-platform-production
```

The future public catch-all is documented for a separately approved cutover; it
is not present in either Wrangler config. Existing signup Worker routes remain
separate and more specific. If the bare signup path has a query string and does
not match the existing exact route, the Router passes it to the original origin
so the current WordPress slash redirect can continue to the signup Worker.

## Production path contract

The Router sends these requests to the private platform Worker:

- `/`
- `/consult` and `/consult/`, with ordinary query strings such as
  `?utm_source=google` and `?gclid=...`
- `/events`, `/events/`, `/events/*`
- audited shared static namespaces `/_next/*`, `/assets/*`, and `/fonts/*`

WordPress/WooCommerce query keys are reserved before the platform allowlist.
REST paths, admin/login, CMS media/system paths, WooCommerce routes, unknown
paths, and the bare signup query edge case use `fetch(request)` to the current
zone origin. The Router passes the original request and returns the origin
response directly; it does not retry, buffer, rewrite, or follow redirects.

If the `PLATFORM` Service Binding rejects or throws, the Router propagates that
failure. It does not fall back to WordPress and does not retry, including for
POST requests. Router regression tests use deterministic in-process mocks; they
never contact production services.

`cloudflare/production-platform.jsonc` describes the OpenNext production Worker.
`cloudflare/production-router.jsonc` binds its `PLATFORM` service to
`lilai-web-platform-production`. Wrangler types for that binding are generated
locally by `npm run cf:typegen:router`; generated `.cloudflare/` files are not
committed.

## Verification commands

Run on Node.js 22, matching the existing GitHub Actions setup:

```powershell
npm ci
npm run cf:typegen
npm run cf:typegen:router
npx tsc -p cloudflare/tsconfig.json
npx tsc --noEmit --incremental false
npm run check:production-routing
npm run check:production-router
npm run cf:build:production-platform
npm run check:production-packaging
git diff --check
```

`cf:build:production-platform` builds and populates only the local OpenNext
static-assets cache. Its accepted action is `build`; it has no deploy command.
`check:production-packaging` runs Wrangler `deploy --dry-run` against both
actual production configs after the OpenNext build. This packages the Router,
the private Platform Worker, its `PLATFORM` Service Binding declaration, and
the configured static asset directory without deploying either Worker. It
confirms local packaging only; it cannot verify Cloudflare's deployed runtime,
live Service Binding resolution, or route execution without an isolated deployed
environment.
The ordinary staging workflow continues to deploy only its isolated staging
Worker when its existing Access gates are enabled.

## Merge, deployment, and route release gates

### A. Code-level checks before merging PR #28 into `develop`

- CI passes deterministic Router regressions, policy checks, type checks, the
  production OpenNext build, and Wrangler dry-run packaging of both production
  Workers and static assets.
- Any code-level failure in those checks is a merge blocker. Runtime behavior
  requiring a deployed Cloudflare environment remains unverified locally and is
  tracked below as an integration gate.

### B. Infrastructure and integration checks before production deployment

- Export and review live DNS, route, Worker, ruleset, cache, and SSL settings;
  verify the actual WordPress origin target, origin certificate/SNI, and
  Cloudflare-to-origin TLS mode. These remain unresolved release blockers.
- Verify WordPress origin compatibility and obtain any required WordPress.com
  support approval; confirm WooCommerce session/cache behavior.
- Inventory existing signup Worker dependencies and prove signup route
  precedence, including bare, slash, child, and query variants, without editing
  the signup Worker.
- Audit the full static asset namespace and legacy event URL collisions against
  the retained platform allowlist: `/`, `/consult`, `/consult/`, `/events`,
  `/events/*`, and audited static assets.
- In an isolated deployed test environment, verify actual Service Binding
  resolution, Router/origin status and header behavior, and Cloudflare routing.

### C. Final checks before attaching `lilaiireland.com/*` to the Router

- Re-export current DNS, SSL, route precedence, signup mappings, and origin/rules
  state immediately before cutover; resolve every blocker in B.
- Confirm no higher-priority signup route or other route intercepts the Router
  unexpectedly, and that root/event/static paths resolve to the platform while
  WordPress/WooCommerce and signup remain on their owners.
- Record the approved rollback route snapshot and verify production smoke-test
  and monitoring procedures. Only then can the catch-all route be separately
  approved and attached.

## Sol review and release gates

The code follows Cloudflare's documented Worker Route origin `fetch(request)`
model and HTTP Service Binding `fetch(request)` API. Sol must review the
implementation and account-specific route precedence before production
deployment. The live DNS target, SSL mode, transform/origin/cache rules,
WordPress.com support approval, signup dependencies, WooCommerce session
behavior, and complete static namespace and legacy event URL collision
inventory remain unresolved release blockers.

No Router or platform Worker deployment, public route installation, cutover,
merge to `develop`/`main`, or production infrastructure change is authorized by
this implementation.
