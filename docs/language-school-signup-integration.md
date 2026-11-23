# Local language-school signup integration

Status: local frontend/backend migration complete, November 23, 2026. No deployment or traffic cutover.

## Verified Git baseline

Before copying source, the GitHub connector resolved the live branch tips:

- Platform `main`: `e3c58f9217ab4216e1f1cbe9c9ac9d1030b6f852`, identical to local `main` and `origin/main`.
- Platform `develop`: `607f71f28f5869feb49060deac0bfd844538edcf`, identical to local `origin/develop`.
- Signup `main`: `8b47338f89834805d2197f1cf3607c49f10b6c71`, identical to local source `main` and `origin/main`.

Terminal `git fetch` could not reach GitHub, so branch-tip equality was checked
directly through the connector. The integration branch,
`feature/integrate-language-school-signup`, starts from that verified
`origin/develop`. The older divergent local `develop` was not reset. Existing
uncommitted source-log edits were retained. Next regenerates `next-env.d.ts`
when changing between the default and isolated build directories.

The source project's development log was read and its existing edits were kept.
An attempted integration note could not be written because that existing file
was not writable in this session; this handoff contains the integration record.

## What moved

- `/language-school-signup/` is an explicit App Router page with the original
  title, description, slash canonical, OG image and Twitter metadata.
- Root Layout supplies the shared Top Strip, Header, Footer and consent UI.
  The copied page's own header/footer are removed; its content and three-step
  direct-application/consultation form remain React components.
- Frontend school data, terms, types, readiness checks, payload sanitizing,
  Turnstile, attribution fields, submission/error handling and conversion labels
  come from the verified signup source.
- CSS is scoped beneath the page's CSS Module root. It uses the platform's
  canonical tokens and fonts; no Tailwind or duplicate font system is installed.
  Page weights use the supported 400/700 tokens. Reveal observers stay inside
  the page. Mobile CTA hides at the shared footer and consent notice.
- Source images remain byte-for-byte copies under
  `public/language-school-signup/lilai-assets/`; their existing public paths,
  OG image and favicon remain available. Lucide retains its source dependency
  version, `1.25.0`, with the source lockfile's integrity.
- Only the shared Google tag initializes Ads. The original direct/consultation
  conversion labels and successful-application deduplication remain; generic
  events now respect the platform's analytics consent. Local/staging does not
  initialize the production tag.

The page keeps its trailing slash. Next's automatic slash redirects are replaced
with explicit rules: bare signup redirects to its slash URL; other slash paths
retain their previous slashless redirects, including query parameters. The
signup sitemap entry already existed; the WordPress same-slug page is now
excluded from the platform sitemap to avoid a duplicate entry.

Final CTA follow-up: restored the original full-width dark-green section by
resetting inherited homepage card width/max-width, margin, border and radius,
and restoring the original paragraph line height. Local Chromium checks at
375/768/1440px matched the source CSS for section geometry, spacing, background,
grid columns and paragraph line height; mobile/desktop screenshots were inspected.

## Run locally

```powershell
npm ci
npm run dev:signup
```

Open `http://127.0.0.1:3120/language-school-signup/`.

For the backend, run these in a separate terminal **from this same repository**:

```powershell
npm run signup:db:local
npm run signup:dev
```

Then set `$env:SIGNUP_LOCAL_BACKEND_ORIGIN = 'http://127.0.0.1:8787'` before
starting `npm run dev:signup`. Both commands use the local default config and
`.wrangler/signup-local`; they never request remote D1. Local queues have no
consumer/Cron, so manual QA cannot send Gmail/Notion jobs automatically.
For manual Turnstile, use development keys in ignored
`cloudflare/signup-backend/.dev.vars` (`TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`,
`TURNSTILE_HOSTNAMES` matching the local browser hostname). Missing keys fail
closed. Production secrets and the old project's `.dev.vars` were not copied.

`npm run check:signup` needs no keys: only the challenge widget/providers are
fixtures; successful browser submissions use the real migrated Worker and D1.
The fixture backend runs on an ephemeral loopback port and is disposed after QA.

This command uses staging/preview markers and `.next/signup-local` so existing
`.next/dev` caches are preserved. It does not change production configuration.
The ordinary `npm run dev` still works with the default Next output directory
when that directory is writable.

## Existing backend contract

### Backend source migration

The backend now lives in `worker/signup/`, SQL migrations in `migrations/signup/`,
and backend tests in `tests/signup-backend/`. Business handlers are copied from
source `8b47338`; the student email template imports the platform's existing
commercial terms. Vinext rendering/image handling is replaced at the entry point
by a `PLATFORM` service binding for signup GET/HEAD page/assets. Nonproduction
hostnames, including workers.dev, retain noindex/nofollow via X-Robots-Tag. API paths,
validation, SQL, Queue/Cron and provider behavior remain the original code.

`cloudflare/signup-backend/wrangler.jsonc` defaults to local-only resources:
no public routes, no consumers/Cron or production credentials. Its explicit
production environment records the existing Worker identity, D1/Queue IDs,
rate limiter, Cron, routes and required secret names, plus the Platform binding.
This is a coordinated future release: deploy/verify the new Platform first,
then release the backend with the binding. Do not deploy the backend alone while
the production Platform still contains the old frontend. No deploy script or
automatic backend deployment has been added. Staging keeps isolated original
resources with no public routes, consumers or Cron.

Phase 1 verification: clean offline `npm ci` installed 632 packages; generated
Wrangler types and backend TypeScript passed; 16 original OAuth/Gmail, email
template and Turnstile tests passed with mocked providers. No secrets copied.

Phase 1 checkpoint: `f0fee83` on `feature/migrate-signup-backend`, pushed and
matched to the local tree. Frontend checkpoint remains `de26b0b` on the original
integration branch. Work continues in `lilai-web-platform-signup-migration/`,
a worktree of the same repository, to preserve the original directory's edits.

Phase 2 verification: 26 backend tests cover original provider/template tests,
resource isolation, real local Workers/D1 routing and writes, ST sequence,
validation/Turnstile failures before writes, deduplication, admin auth/update,
Queue redelivery, temporary failure/retry, Cron reconciliation/stale recovery,
dead-letter and the original global rate limit. All outbound providers are
in-process fixtures; any unexpected outbound URL fails the test.

Full browser QA at 375/768/1440px now reaches Next API -> loopback bridge ->
migrated Worker -> local D1. It verifies six applications, ST-000001..000006,
18 integration jobs and stored attribution, plus the existing UI assertions.
Local Wrangler applied both SQL migrations successfully; production-env dry-run
packaged the backend with the expected existing bindings and Platform service.
No remote deployment/resource mutation occurred.

Final checks also passed: Next production build, root/backend TypeScript,
shared-layout/CMS fixtures, SEO URL consistency, design system, production
routing/router/route-safety and `git diff --check`. A source-parity check verified
22 backend modules unchanged (apart from the email import), both SQL files
byte-identical, and shared commercial terms identical. The actual `signup:dev`
server started on loopback; missing Turnstile/admin credentials returned the
original fail-closed 503 responses. This sandbox required workspace-local
`WRANGLER_LOG_PATH` / `WRANGLER_REGISTRY_PATH`; the Request.cf network fallback
warning did not prevent startup. No production values were read or copied.

GitHub workflow `signup-backend.yml` runs backend type generation/checks,
tests, browser QA and a production-config dry-run. It has no deployment job.
Unused starter Drizzle schema/examples and Vinext rendering dependencies were
not imported: the production backend uses the copied SQL migrations directly.
Database/DataGrip instructions are in `docs/signup-d1-datagrip.md`; Gmail OAuth
maintenance is retained as `signup:gmail:authorize` (not executed during QA).

The original project's `worker/`, migrations, D1, Queue, Cron, Gmail, Notion,
admin API, rate limiter and server-side Turnstile verification are unchanged.
No secrets or production environment files were copied.

The frontend still requests exactly:

- `GET /language-school-signup/api/turnstile-config`
- `POST /language-school-signup/api/applications`, with the original JSON body
  and `Idempotency-Key` header.

Without a local backend, these routes deliberately return JSON `503` responses.
They never send a local form to production or fake a successful submission.

To connect an **already isolated, locally running** original signup Worker, set
its loopback origin before starting the preview, for example:

```powershell
$env:SIGNUP_LOCAL_BACKEND_ORIGIN = 'http://127.0.0.1:3001'
npm run dev:signup
```

Use the actual local Worker's port. Verify its local/staging D1 and integration
settings before using it; a development Worker may still contain remote
credentials. This task did not start that Worker or exercise Gmail/Notion.
Turnstile requires appropriate development keys/hostnames. The bridge accepts
only a bare HTTP loopback origin, runs only in development, forwards no auth
cookies/secrets, does not follow redirects and does not retry submissions.

## Verification

`npm run check:signup` runs ten unit/contract tests and an isolated local Next
server on port 3130, connected to an ephemeral local Workers/D1 backend.
Browser egress/Turnstile/providers use fixtures; successful applications are
real local D1 writes. It covers 375/768/1440px, shared shell, one H1, canonical/noindex,
redirect/query preservation, local image responses, overflow, school tabs,
keyboard FAQ, required fields, both complete form modes, failure/retry,
duplicate-submit protection, UTM/gclid, sanitized payloads and success screens.
Desktop exercises normal motion; mobile/tablet exercise reduced motion.
It checks browser page errors and console errors, except the deliberate 403
fixture's expected network error. Screenshots are in `.next/signup-qa-artifacts`.

Also verified locally:

- Clean `npm ci --offline --no-audit --no-fund` in an isolated install directory
  using copied cached tarballs: 632 packages installed. Existing working
  `node_modules` was preserved; npm reported its existing install-script policy.
- TypeScript, design-system/font coverage and shared-layout/CMS fixture checks.
- SEO URL consistency with production-mode localhost fixtures, including the
  signup canonical 200, alias/query redirects, index/follow and one sitemap
  entry despite a same-slug WordPress page.
- Production routing, router and route-safety regressions without Cloudflare calls.
- `npm run build` with isolated output and staging markers: passed, with signup
  emitted as a static page and both local bridge endpoints emitted as routes.

## Before any future cutover

Historical production baseline from the source development log (not rechecked
against Cloudflare in this local task): deployed Git `8b47338`, October 19, 2026;
Worker version `02a78b7f-f5fc-4e9c-b006-bd09b66172fc` at 100% traffic, prior
rollback baseline `12b84469-612a-4ca7-a0a3-83b8ca172060`. Recheck the actual
deployed version and D1 backup before any release; code rollback does not undo
database changes. Neither copied SQL migration was applied remotely.

Existing Cloudflare production routing still assigns the entire signup prefix
to the original signup Worker. The production router, Worker configs, bindings,
DNS, WordPress and live traffic were not changed. Deploying the platform alone
does not activate this new page at the public URL.

A separate release must activate the copied backend's Platform Service Binding
after deploying/verifying the integrated Platform page and assets. This keeps
the existing signup routes and backend API ownership.
The development-only bridge is intentionally unavailable in production. The
standalone Cloudflare staging policy also remains read-only and unchanged.

Retire the old repository's deployment integration and archive it only after a
controlled production form verifies D1, both Gmail messages, Notion and retries
from this repository. The old Worker remains active; only its code owner changes.

Remaining verification: real Safari/Firefox and mobile devices, live Turnstile,
controlled backend/D1/Email/Notion end-to-end testing, actual Ads receiving and
post-cutover Search Console checks. No production submissions were made.
