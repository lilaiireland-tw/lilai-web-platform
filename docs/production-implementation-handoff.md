# Issue #3 production dual-Worker handoff

Status: implementation candidate in progress; no production release or cutover.

## Repository checkpoint

- Branch: `feat/issue-3-production-dual-worker`
- Latest implementation commit at handoff: `f823d09` (CI verification and implementation docs)
- Related issue: [Issue #3](https://github.com/lilaiireland-tw/lilai-web-platform/issues/3)
- Related prior PR: [PR #24](https://github.com/lilaiireland-tw/lilai-web-platform/pull/24), merged routing-readiness audit
- Current implementation PR: [Draft PR #28](https://github.com/lilaiireland-tw/lilai-web-platform/pull/28), base `develop`
- Resolve the exact current checkout SHA with `git rev-parse HEAD` after this handoff is committed.

## Completed milestones

1. Updated the production policy to send `/consult`, `/consult/`,
   `/consult?utm_source=google`, and `/consult/?gclid=...` to the platform.
   WordPress query endpoints are evaluated before the allowlist and remain
   origin-owned. Existing signup route snapshots remain protected.
2. Added route-policy regression cases for the four consultation requests,
   WordPress query exclusions, signup paths, and prefix boundaries.
3. Implemented the Router dispatch helper. It forwards the original request to
   the private platform service for platform-owned paths and returns the origin
   response directly for all other paths.
4. Extended deterministic Router tests for homepage, consultation, event, and
   audited static dispatch; WordPress 404/503 preservation; HEAD behavior;
   readable unbuffered streams; propagated Service Binding failures; no retries
   for failed POSTs; redirect status/Location; multiple Set-Cookie headers; and
   original POST body/cookie forwarding.
5. Prepared a private production OpenNext Worker config and a build-only script.
6. Configured a private Router Worker with a `PLATFORM` Service Binding to
   `lilai-web-platform-production`; neither Worker has a public route or URL.
7. Added type generation, tests, and a non-deploying production build to the
   existing verification workflow.
8. Added the integration description in `docs/production-dual-worker.md`.
9. Added non-deploying Wrangler `deploy --dry-run` packaging for both actual
   production configs after the OpenNext build. The dry run inspects the Router
   Service Binding declaration and the generated private Platform Worker/static
   asset bundle; it cannot validate live Cloudflare runtime integration.

## Files created or modified

- Modified: `.github/workflows/staging.yml`, `cloudflare/production-routing-policy.ts`,
  `cloudflare/tsconfig.json`, `docs/cloudflare-routing-plan.md`,
  `docs/production-routing-readiness-2026-10-08.md`, `package.json`,
  `scripts/check-production-routing.ts`.
- Created: `cloudflare/production-platform-worker.ts`,
  `cloudflare/production-platform.jsonc`, `cloudflare/production-router-worker.ts`,
  `cloudflare/production-router.jsonc`, `cloudflare/production-router.ts`,
  `docs/production-dual-worker.md`, `scripts/check-production-router.ts`,
  `scripts/cloudflare-production.ts`.
- Updated: `.github/workflows/staging.yml`, `package.json`,
  `scripts/check-production-router.ts`, `docs/production-dual-worker.md`.
- Created: `scripts/check-production-packaging.ts`.
- Generated locally and ignored: `.cloudflare/production-router-env.d.ts` and
  `.cloudflare/wrangler-production-platform.json`.
- Unrelated pre-existing untracked file `index-with-wp-note.md` was left untouched.

## Checks and actual results

- `npm.cmd run check:production-router`: PASS with the expanded regression
  coverage listed above; no live services are called.
- `npm.cmd run check:production-routing`: PASS.
- `npm.cmd run check:production-packaging`: Router dry-run PASS, including its
  `PLATFORM` Service Binding declaration. Platform dry-run BLOCKED locally
  because this Windows checkout has no `.open-next/assets`; the preceding
  OpenNext build is known to fail on this Windows host. Linux CI must produce
  real assets and pass both Wrangler packaging dry runs to satisfy merge gate A.
- `npx.cmd tsc --noEmit --incremental false`: PASS.
- `npx.cmd tsc -p cloudflare/tsconfig.json`: PASS.
- `npm.cmd run cf:typegen:router`: exit 0 and generated the binding type. Wrangler
  also printed a non-fatal `EPERM` warning when it could not write its user-level
  log file outside the workspace.
- `git diff --check`: PASS; Git printed expected LF-to-CRLF conversion warnings.
- `npm.cmd run cf:build:production-platform`: FAILED on this Windows host while
  OpenNext started; child process exited `3221226505`. OpenNext reported that
  Windows is not fully supported. Only Node.js v24 is installed locally.
- Prior GitHub Actions run [37851912169](https://github.com/lilaiireland-tw/lilai-web-platform/actions/runs/37851912169): PASS on `ubuntu-latest` before the new packaging coverage was added. A new run must pass after this update.
- An initial `npm run` call was blocked by PowerShell execution policy. Use
  `npm.cmd` on this host.

## Unfinished work and blockers

- **A. Merge blockers:** the updated CI must pass on Node 22, including packaging
  both production Wrangler configs after a real OpenNext build. The Platform
  dry-run was not completed locally because the required generated asset
  directory is absent after the Windows OpenNext build failure. Cloudflare
  Service Binding and route runtime integration require an isolated deployed
  environment and are not claimed by these local mocks/dry runs.
- **B. Deployment blockers:** live DNS target, SSL/TLS mode and certificate/SNI,
  route/rules export, signup dependency and precedence audit, verified WordPress
  origin and any required WordPress.com approval, WooCommerce session/cache
  evidence, and full static asset/event collision inventory remain unresolved.
- **C. Before attaching `lilaiireland.com/*`:** re-export and verify DNS, SSL,
  origin/rules, and route precedence; resolve B; confirm signup ownership and
  platform root/event/assets behavior; and record the approved rollback snapshot
  plus smoke-test/monitoring procedure. See `docs/production-dual-worker.md` for
  the complete gates.
- Draft PR #28 is open against `develop` and references the work as `Part of #3`.
- Rerun the PR workflow after these changes. Keep PR #28 Draft while any A gate
  remains incomplete.

## Resume commands

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

After successful CI, ask Sol to review the implementation and the unresolved
Cloudflare account evidence on Draft PR #28. Do not add the future `lilaiireland.com/*` route,
deploy either production Worker, merge to `develop`/`main`, or cut traffic over
without the separate release review and authorization.

## Infrastructure state

Confirmed: this work did not deploy a Worker, create or edit a Cloudflare route,
DNS record, origin, WordPress/WooCommerce setting, or production traffic path.
Both production Wrangler configs retain `routes: []`, `workers_dev: false`, and
`preview_urls: false`.
