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
git diff --check
```

`cf:build:production-platform` builds and populates only the local OpenNext
static-assets cache. Its accepted action is `build`; it has no deploy command.
The ordinary staging workflow continues to deploy only its isolated staging
Worker when its existing Access gates are enabled.

## Sol review and release gates

The code follows Cloudflare's documented Worker Route origin `fetch(request)`
model and HTTP Service Binding `fetch(request)` API. Before any production
deployment or route change, Sol must review the implementation and account-
specific route precedence. The live DNS target, SSL mode, transform/origin/cache
rules, WordPress.com support approval, signup dependencies, and WooCommerce
session behavior remain unverified in the read-only audit. The complete static
namespace and legacy event URL collision inventory also remains a release gate.

No Router or platform Worker deployment, public route installation, cutover,
merge to `develop`/`main`, or production infrastructure change is authorized by
this implementation.
