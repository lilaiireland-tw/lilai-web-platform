# Local language-school signup integration

Status: local frontend integration, November 23, 2026. No deployment or traffic cutover.

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

This command uses staging/preview markers and `.next/signup-local` so existing
`.next/dev` caches are preserved. It does not change production configuration.
The ordinary `npm run dev` still works with the default Next output directory
when that directory is writable.

## Existing backend contract

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
server on port 3130. All browser egress, Turnstile and application submissions
are fixtures. It covers 375/768/1440px, shared shell, one H1, canonical/noindex,
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

Existing Cloudflare production routing still assigns the entire signup prefix
to the original signup Worker. The production router, Worker configs, bindings,
DNS, WordPress and live traffic were not changed. Deploying the platform alone
does not activate this new page at the public URL.

A separate release must assign page/assets to Platform while preserving the
existing backend API ownership (for example through a Service Binding).
The development-only bridge is intentionally unavailable in production. The
standalone Cloudflare staging policy also remains read-only and unchanged.

Remaining verification: real Safari/Firefox and mobile devices, live Turnstile,
controlled backend/D1/Email/Notion end-to-end testing, actual Ads receiving and
post-cutover Search Console checks. No production submissions were made.
