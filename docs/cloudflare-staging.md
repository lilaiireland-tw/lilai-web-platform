# Cloudflare staging provisioning (Part of #3)

This follows the [routing plan](cloudflare-routing-plan.md) merged in PR #18.
Only local configuration, packaging and validation have been implemented. No
Cloudflare resource, route, custom domain, DNS record or production traffic was
changed. There is no live staging URL to report yet.

## Runtime decision

Use Workers with `@opennextjs/cloudflare` **1.20.1** and Wrangler **4.148.0**,
pinned in the lockfile. The existing Next.js 16.2.10 / React 19.1.0 App Router,
application routes, shared shell and public canonical origin remain intact.
Only the adapter build uses webpack; local workerd exposed missing SSR chunks
in the Windows Turbopack output. Ordinary `npm run build` remains unchanged.

Cloudflare now recommends vinext for new projects. Its current 1.0.1 peer range
requires React 19.2.6 and it replaces the Next runtime; this provisioning task
preserves the existing framework instead. OpenNext 1.20.1 accepts the installed
Next version. OpenNext 1.20.9 requires Next >=16.3.8 for the 16.x line, so adopting
that version would need a separately scoped framework update. No unsupported-peer
override, application migration or dependency audit repair is included.

References checked during implementation:

- [Cloudflare Next.js options](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [OpenNext existing-app setup](https://opennext.js.org/cloudflare/get-started)
- [OpenNext custom Worker](https://opennext.js.org/cloudflare/howtos/custom-worker)
- [OpenNext cache options](https://opennext.js.org/cloudflare/caching)
- [Workers asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)

## Read-only discovery, 2026-10-07

The saved Wrangler OAuth session refreshed successfully through `wrangler whoami`.
It grants account/zone read and Workers write scopes. No credential values were
printed or committed. No account configuration mutation was performed.

| Item | Observed value |
| --- | --- |
| Account ID | `622900d9297cd7c09cad966aaae64617` |
| Active `lilaiireland.com` zone ID | `2cabb0ba90198b8d4a88a58e5bc6c757` |
| Workers account subdomain | `lilaiireland` |
| Existing Workers | `relai-prototype-staging`, `site-creator-vinext-starter`, `site-creator-vinext-starter-staging` |
| Existing Pages projects / Workers custom domains | Empty GET results |
| Proposed new Worker | `lilai-web-platform-staging`; absent from the account inventory |

GET `/zones/{zone_id}/workers/routes` returned:

| Pattern | Script | Route ID |
| --- | --- | --- |
| `*.lilaiireland.com/*` | null (no-script exclusion) | `47c1e3cdca974e2097f454582cdfec8a` |
| `lilaiireland.com/language-school-signup` | `site-creator-vinext-starter` | `5da60c5206414af98c7d5c8c37ab5db4` |
| `lilaiireland.com/language-school-signup/*` | `site-creator-vinext-starter` | `1fe24fe586f2418dbf7ebbd866d74f42` |

This snapshot is not a complete production DNS/rules/dependency audit. No signup
configuration, bindings or secrets were copied. The new config has `routes: []`,
no production environment and no zone ID; the discovered zone is recorded only
for future review. `workers_dev: true` is the sole intended hosting path, with
version preview URLs disabled. Record the actual provider URL after provisioning;
do not treat a derived hostname as a deployed or verified endpoint.

GitHub repository secret/variable inventories and environments were empty at
discovery time. Local OAuth access does not supply a GitHub Actions credential.

## Noindex and isolation

`SITE_DEPLOYMENT_ENV=staging` and `EVENT_DEPLOYMENT_ENV=preview` are required for
the staging build. The general Next config guard rejects either production
marker unless the other also equals `production`. Unset/nonproduction values
retain the existing noindex policy. Production builds must be rebuilt separately.

The wrapper runs before all assets (`run_worker_first: true`) and stamps
`X-Robots-Tag: noindex, nofollow` on application, asset, rewrite, redirect and error
responses, including caught exceptions. It streams responses and preserves
statuses, cookies and other headers. Missing runtime configuration returns 503
with noindex. GET/HEAD are the only allowed methods in this initial staging step;
forms, Woo writes and revalidation requests return 405 before reaching an origin.
Provider failures before Worker execution and Access login responses require
separate live validation; local tests cannot establish those behaviors.

The six existing WordPress rewrite prefixes are shared between Next config and
the staging Worker. Their source/destination mapping is unchanged. On staging,
the edge proxies these paths with the destination Host and `redirect: manual`:
the adapter's default fetch proxy forwards the incoming Host and follows origin
redirects. Sharing the list avoids inventing or maintaining a second route table.
This wrapper is only for the standalone staging Worker, not the future production
path router. Bare paths, descendants and prefix boundaries are checked.

The staging script requires all three CMS/service URLs explicitly and refuses
`lilaiireland.com` and its subdomains, including the current CMS default. It
allows loopback fixtures for local builds and refuses loopback at deployment.
HTTPS nonproduction URLs must be verified by the operator; URL syntax checks
cannot prove that a different hostname is a sandbox. Runtime vars are generated
from the exact build inputs into ignored `.cloudflare/wrangler-staging.json`.
Do not deploy the source config directly: its empty origin fields intentionally
fail closed. No application or integration secret is provisioned.

The initial cache stores prerendered pages in Workers Static Assets. No R2, KV,
D1, Queue, Durable Object or shared service binding is provisioned. Content
refresh requires a rebuild; ISR and on-demand revalidation are not validated or
enabled by this initial cache configuration. Dynamic CMS pages remain rendered
on demand. Image optimization for dynamic product content is a later live QA
gate; existing homepage/event images use their current unoptimized settings.

Local workerd HTTP assertions pass, but runtime logs are **not clean**: unknown
event paths produce OpenNext `NoFallbackError` diagnostics while returning the
expected 404, and uncached CMS reads log attempts to write the read-only static
cache. Optional cache interception is disabled; these diagnostics remain. The
test saves logs to ignored `.cloudflare/workerd-smoke.log`. Triage the missing-route
behavior and select/verify the staging data-cache policy on Linux before enabling
live deployment. This PR does not claim ISR or complete runtime compatibility.

## Local verification

Use Node 22 or newer and npm. On Windows use `npm.cmd` / `npx.cmd` when PowerShell
blocks the `.ps1` shims. OpenNext warns that Windows support is incomplete; the
deployment workflow uses Linux. The fixture integration test needs permission to
start local workerd and loopback HTTP servers.

```sh
npm ci
npm run cf:typegen
npx tsc --noEmit --incremental false
npx tsc -p cloudflare/tsconfig.json
npm run check:staging
npx tsx scripts/check-deployment-policy.ts
npx tsx scripts/check-shared-layout.ts
npx tsx scripts/check-design-system.ts
npx tsx scripts/check-cloudflare-staging.ts
git diff --check
```

The last script creates a local CMS fixture, builds the adapter, populates only
the local static cache, runs `wrangler deploy --dry-run`, and starts local
workerd. It checks homepage metadata, robots/sitemap, events/assets, unknown URLs,
origin rewrites/redirects/errors and rejection of writes before reaching the
fixture. It does not deploy, submit production forms or contact the real CMS.
Worker types are generated under ignored `.cloudflare/` and checked separately
from DOM/Next types to avoid incompatible global declarations.

For an explicit staging build set these process variables first:

- `SITE_DEPLOYMENT_ENV=staging`, `EVENT_DEPLOYMENT_ENV=preview`
- `EVENTS_INCLUDE_DRAFTS=false`
- `WORDPRESS_ORIGIN`, `WORDPRESS_API_BASE`, `WOOCOMMERCE_STORE_API_BASE` to actual
  verified nonproduction URLs (loopback permitted for local checks only)

Then run `npm run cf:build` or `npm run cf:dry-run`. Both rebuild; the latter only
packages the Worker without uploading. No credentials are needed for these
checks. `npm run lint` remains invalid because it invokes removed `next lint`.

## Develop deployment path and exact blockers

`.github/workflows/staging.yml` targets only `develop`, serializes deployments,
and uses the GitHub `staging` environment. Push/manual runs remain skipped unless
repository variable `CLOUDFLARE_STAGING_ENABLED` equals `true`. `main` and feature
branches cannot deploy through this workflow. The deploy command also requires
`GITHUB_REF=refs/heads/develop`, the discovered account ID and an API token.

Before enabling it, the operator must supply/configure:

1. A verified nonproduction CMS/service endpoint set. None was found in the
   repository or CI configuration. Add GitHub `staging` environment variables
   `STAGING_WORDPRESS_ORIGIN`, `STAGING_WORDPRESS_API_BASE`, and
   `STAGING_WOOCOMMERCE_STORE_API_BASE`. Do not reuse the production CMS defaults.
2. `CLOUDFLARE_ACCOUNT_ID=622900d9297cd7c09cad966aaae64617` as a staging environment
   variable, and a dedicated account-scoped `CLOUDFLARE_API_TOKEN` environment
   secret with Workers Scripts edit permission for deployment. No DNS edit or
   Workers Routes edit permission is needed. Keep token values out of this repo
   and chat; the existing personal OAuth login is not a CI token.
3. GitHub `staging` environment branch restrictions/review protection and
   Cloudflare Access protecting the provider hostname. Review environments are
   public without Access; noindex is not authentication. Access was not provisioned
   or verified in this change. Configure it before enabling publication.
4. Complete Linux runtime verification, including the cache/missing-route
   diagnostics above. Enable the repository opt-in only after these gates, then run from `develop`.
   Record the issued URL, Worker/version ID, Git SHA and operator in the release
   record. Run authenticated read-only smoke checks on the actual URL, including
   the underlying provider URL. Never attach to `lilaiireland.com` in this step.

Live provisioning stops at these missing inputs. No fabricated credentials,
origins, Worker IDs or successful live deployment are implied. Existing production
DNS/routes/traffic and signup ownership remain unchanged.

## Remaining QA

- Execute the workflow on Linux after merge and configuration; local packaging
  alone does not establish CI or remote runtime success.
- Resolve or explicitly accept the documented read-only-cache diagnostics and
  investigate missing-route `NoFallbackError` before enabling publication.
- Verify live noindex on HTML, RSC, assets, origin rewrites, redirects, errors,
  Access responses and the underlying workers.dev URL; verify public canonicals,
  disallow-all robots and empty staging sitemap.
- Browser checks at 375px and 1440px: shell, overflow, focus-visible/keyboard,
  event images/CTA destinations, dynamic images, console/hydration errors and
  client navigation. No browser verification is claimed here.
- ISR/revalidation, sandbox interactions and the routing plan's complete
  production conflict/rollback matrix remain separate release gates. Roll back
  staging by redeploying a known-good `develop` commit with the same staging-only
  pipeline; never edit production routes as a staging rollback.
