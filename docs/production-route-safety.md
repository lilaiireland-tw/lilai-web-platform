# Production Router route safety — post-cutover

The live Dashboard-managed Worker Route `lilaiireland.com/*` points to
`lilai-web-platform-router`, which reaches
`lilai-web-platform-production` through the `PLATFORM` Service Binding.

## Route ownership

- The **Router** config must omit BOTH `route` and `routes` keys.
  Even `"routes": []` risks deleting the Dashboard-managed route on a
  future Wrangler redeploy. Keep `workers_dev: false` and
  `preview_urls: false`.
- The **Platform** is private. Its separate config intentionally retains
  `"routes": []` and does not attach an external Route; the Router's
  Dashboard Route belongs only to the Router Worker.
- Keep existing signup mappings
  `lilaiireland.com/language-school-signup` and
  `lilaiireland.com/language-school-signup/*` and wildcard
  `*.lilaiireland.com/*` intact. Preserve the Single Redirect for signup
  query URLs (UTM and gclid).

Source: https://developers.cloudflare.com/workers/wrangler/configuration/#source-of-truth

## Routine Production update (Platform only)

1. Merge reviewed work into `develop`, then merge a reviewed
   `develop -> main` Release PR after CI passes.
2. Read-only check **Cloudflare Dashboard > Workers Routes** and record current
   Worker versions. Verify `lilaiireland.com/*` still belongs to
   `lilai-web-platform-router`, with both signup mappings unchanged.
3. On `main`, manually dispatch GitHub Actions
   **Production Platform (manual only)** with `deploy_platform_only=true`.
   Pass the existing `production` environment approval. This builds
   OpenNext then runs
   `npm run cf:deploy:production-platform -- --confirm-platform-only-deploy`.
4. This deploy command validates the Worker identity/account and route policy
   and deploys ONLY `cloudflare/production-platform.jsonc`. The Router Worker
   and Dashboard Routes are NOT deployed or modified. Merging to `main`
   never automatically deploys production.
5. Recheck the Dashboard route table and perform only targeted read-only
   production checks; Consent Mode v2 can be inspected in Tag Assistant
   without sending synthetic conversions or duplicate GAS leads.

Local terminal use requires the same explicit flag and production API token /
matching account ID. Unlike the GitHub workflow, local terminal commands do not
enforce which git branch is checked out: verify the release commit yourself.

## Testing, limitations and rollback

`npm run check:production-route-safety` and
`npm run check:production-routing` run without Cloudflare requests and
fail when unsafe route/config or dual-Worker deployment instructions reappear.
Tests of repository files do NOT prove live Dashboard settings. Manual
preflight/postflight route snapshots remain necessary.

If Platform functionality regresses, roll back its Worker version through
Cloudflare without touching Router Routes, signup routes, DNS or redirects.
Changes to the Router or Service Binding require their own reviewed release
plan and rollback; do not revive the old dual-Worker deploy command.
