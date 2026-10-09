# Lilai Ireland Frontend

Next.js + TypeScript + App Router frontend for `lilaiireland.com`.

## Architecture

- Next.js owns the public frontend.
- WordPress remains the CMS origin at `WORDPRESS_ORIGIN`.
- WooCommerce cart, checkout, and account pages are rewritten to WordPress in phase 1.
- Existing SEO URLs should stay unchanged through the fallback slug route.

### Shared site shell

`src/app/layout.tsx` mounts the shared top strip, Header, skip link, content wrapper and Footer.
Each page keeps its own semantic `<main>`; do not add another header/footer in page content.
The homepage's sections and business copy remain in `src/content/home.html`.

`src/config/navigation.ts` owns shell links and the primary CTA. The main Header
mirrors the current WordPress information architecture: free assessment, language-school
signup, the About submenu, and the study-abroad information hub. Links use same-origin
public URLs so Cloudflare can route each path to its current owner without changing
public permalinks. Contact links come from the signup reference repo.

Header, Footer, Brand and Navigation are Server Components. Only MobileNavigation
enhances the native `<details>` disclosure (Escape, outside click, focus leaving,
link selection and desktop resize). It is not a modal or a focus trap.
Shell structure styles are scoped in `layout.module.css`; canonical brand tokens
live in `src/styles/tokens.css`, while the self-hosted Noto unicode-range
manifest lives in `src/styles/fonts.css`. Complete Traditional Chinese coverage
and the SIL license live in `public/fonts`; `npm run update:fonts` refreshes the
official Google Fonts shards. The design-system check prevents missing-glyph and
unsupported-weight regressions.
New pages should use the opt-in `ds-*` primitives and Button component.
See [Design system foundation](docs/design-system.md) for examples, accessibility
and legacy compatibility. `/design-system/` is a noindex visual review page.

After dependency installation, run `npx tsx scripts/check-shared-layout.ts` for
isolated homepage, WordPress page/post fallback, 404, rewrite and asset checks.
It starts a temporary local Next.js dev server and fixture CMS, without production
requests. It does not test browser interaction, hydration, console or responsive
overflow. The existing external proxy drops configured `X-Robots-Tag` headers in
fixture responses on develop too; this check verifies declarations separately.
See [Issue #1 verification notes](docs/shared-layout-verification.md) for limitations.

## Browser QA strategy

`npm run qa:precutover` is the routine browser check. It starts Next.js on a fixed
loopback address in staging mode, disables WordPress rewrites, blocks browser
egress to external services, and runs Chromium at 375px and 1440px. Google Apps
Script submissions are mocked in form tests; Ads and live submissions are not
sent. `npm run qa:precutover:full` optionally runs the same local tests in
Chromium, Firefox and WebKit, including the 768px tablet viewport.

The older probe-based WordPress compatibility suite is kept separate and does
not start its server automatically. It requires a manually started, explicitly
authorized probe. `npm run qa:remote-smoke` is the small manual release check;
see [the QA strategy and authorization details](docs/qa/testing-strategy.md).
The production-runtime probe and verifier also require
`ALLOW_REMOTE_QA=I_UNDERSTAND_CLOUDFLARE_USAGE` and may consume Worker request
quota. Never use those diagnostics for routine frontend changes.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and adjust values:

```bash
NEXT_PUBLIC_SITE_URL=https://lilaiireland.com
WORDPRESS_ORIGIN=https://cms.lilaiireland.com
WORDPRESS_API_BASE=https://cms.lilaiireland.com/wp-json/wp/v2
WOOCOMMERCE_STORE_API_BASE=https://cms.lilaiireland.com/wp-json/wc/store/v1
REVALIDATE_SECRET=change-me
```

## URL Preservation

Important existing URLs are listed in `src/data/urlMap.ts`.

After starting the dev server, run:

```bash
npm run check:urls
```

For a deployed preview:

```powershell
$env:CHECK_BASE_URL = '<actual provisioned preview or staging URL>'
npm run check:urls
```

This checks `2xx`/`3xx` responses only. Before any approved production cutover,
also complete the ownership, status/redirect, indexing and asset smoke matrix in
the [Cloudflare routing plan](docs/cloudflare-routing-plan.md).

## WordPress Routing

The catch-all route `src/app/[...slug]/page.tsx`:

1. Looks for a WordPress page by slug.
2. Falls back to a WordPress post by slug.
3. Returns 404 if neither exists.
4. Generates canonical URLs on `lilaiireland.com`.

## WooCommerce Phase 1

Checkout is intentionally not rebuilt in Next.js yet.

These paths rewrite to `WORDPRESS_ORIGIN`:

- `/cart/`
- `/checkout/`
- `/my-account/`

They also receive `X-Robots-Tag: noindex, nofollow` from `next.config.ts`.

## Deployment

For Issue #3's phase-one Cloudflare ownership, environment isolation, indexing,
smoke checks and rollback gates, see [Cloudflare routing plan](docs/cloudflare-routing-plan.md).
The staging-only Workers/OpenNext configuration and opt-in `develop` workflow are
documented in [Staging provisioning](docs/cloudflare-staging.md). Live deployment
is blocked on nonproduction origins, CI credentials and Access setup. No live
Worker, DNS record or production route has been created by this change.
Credential-free Linux verification runs independently of the deployment opt-in.

Set `SITE_DEPLOYMENT_ENV=preview` or `staging` at build time for review environments.
Only `production` enables site indexing; unset values remain noindex. Canonical
URLs always use `https://lilaiireland.com`, regardless of the serving hostname.
The build rejects mismatched site/event production markers. The staging Worker
adds noindex to assets, rewrites, redirects and errors; live verification remains
required before publication.

The homepage, `/events`, and `/events/*` pages and assets share one Web Platform
deployment: PR -> develop -> staging -> main -> Cloudflare production, subject to
the routing plan's release gates and separate cutover approval.

### Historical deployment note (deprecated)

The former Vercel import and whole-site DNS cutover checklist is retired. It is
not an active deployment procedure; use the Cloudflare routing plan above.
