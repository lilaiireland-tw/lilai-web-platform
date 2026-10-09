# Cloudflare staging — initial deployment and acceptance record

**Date:** 2026-10-08 (Europe/Dublin)  
**Related issue:** #3  
**Deployment preparation:** PR #22 (merged to `develop`)  
**Deployment trigger commit:** [`ac67412f0d3e6424545d916326b711c6eacfa69d`](https://github.com/lilaiireland-tw/lilai-web-platform/commit/ac67412f0d3e6424545d916326b711c6eacfa69d)  
**GitHub Actions:** [Cloudflare staging — run #10](https://github.com/lilaiireland-tw/lilai-web-platform/actions/workflows/staging.yml) (run title `chore: trigger initial Cloudflare staging deployment`)  
**Staging Worker:** `lilai-web-platform-staging`  
**Staging URL:** https://lilai-web-platform-staging.lilaiireland.workers.dev  
**Production site:** https://lilaiireland.com (not cut over)

## Release summary

The standalone Cloudflare staging Worker was first bootstrapped with `workers_dev: false`, no custom domains, no zone routes, and no preview URLs. Cloudflare Worker-level Access was then configured for **All traffic**, with an **Allow — Cloudflare account members** policy. The GitHub `staging` environment was restricted to `develop`; its deployment secret and environment variables were configured by the operator. The repository-level `CLOUDFLARE_STAGING_ENABLED` switch enabled a push-triggered deployment.

The push of the documented trigger commit to `develop` ran GitHub Actions **run #10**. The operator supplied a GitHub Actions screenshot showing **verify: success** and **deploy: success** (total 3m54s). The Worker URL initially remained disabled after the deploy job; the operator enabled only its **Production `workers.dev` URL** manually in Cloudflare Dashboard, keeping preview URLs off. Here “Production URL” means the provider's Worker URL, **not** the `lilaiireland.com` production site.

## Operator-reported acceptance

These are human-reported browser checks from the initial deployment session, not automated tests run by this documentation PR.

| Check | Outcome / evidence |
| --- | --- |
| Access login, then viewing the new homepage | **PASS reported** — signed-in user could see the new homepage |
| Homepage visual review | **PASS reported** |
| Daydream activity landing page visual review | **PASS reported** |
| `/wp-json/` | **PASS reported** — expected standalone `503` |
| `/product/staging-smoke` | **PASS reported** — expected standalone `503` |
| `/robots.txt` | **PASS reported** |
| `X-Robots-Tag: noindex, nofollow` and staging response headers | **PASS reported** |
| GitHub CI verification and deployment | **PASS** per operator's run #10 screenshot |

**Boundary of this evidence:** The operator confirmed accessing the website after signing in; an independently tested denied identity, unauthenticated Access block, and full outbound-request log audit have **not** been independently recorded here. Access policy screenshots show Worker-level All traffic and a single Cloudflare-account-members Allow policy, but do not substitute for negative-path tests. Do not claim those unrecorded checks passed.

## Environment and safety constraints

- Staging uses `SITE_DEPLOYMENT_ENV=staging`, `EVENT_DEPLOYMENT_ENV=preview`, `EVENTS_INCLUDE_DRAFTS=false`.
- WordPress/WooCommerce connections and rewrites are intentionally disabled in standalone staging; relevant paths yield explicit no-store `503` responses.
- The staging worker uses `workers.dev` only. No custom domain, production zone route, production DNS change, or existing signup Worker change was part of this release.
- The Access application protects the single staging Worker with **All traffic**; no public `Everyone` or `Bypass` policy was visible in the reviewed application policy list.
- `CLOUDFLARE_STAGING_ENABLED` should be reset to `false` if staging deployments must not occur on future `develop` pushes. **The current value is not asserted by this record.** Note that merging this documentation PR into `develop` can trigger CI and, when the variable is `true`, another staging deploy.

## Remaining work / explicit non-goals

1. Record a fresh incognito/unauthenticated Access denial and a denied-identity test, while confirming allowed-account access.
2. Review Cloudflare Worker logs for accidental egress to production WordPress, WooCommerce, or the existing signup Worker.
3. If desired, run the authenticated live read-only smoke checker documented in [cloudflare-staging.md](cloudflare-staging.md) and record its job/result.
4. Retain Issue #3 as **open** until its wider production routing ownership, collision analysis, and rollback/cutover gates are completed.
5. Before any production migration, separately test real WordPress/WooCommerce compatibility, legacy routes, SEO, and rollback. This staging acceptance does **not** authorize production cutover.

## Rollback reference

See [Cloudflare staging runbook](cloudflare-staging.md#rollback). For accidental public exposure, disable the staging Worker's `workers.dev` URL first; for a bad deployment, stop subsequent CI publication and roll back to the last known-good Worker version. Neither procedure requires editing production DNS or the existing signup Worker.
