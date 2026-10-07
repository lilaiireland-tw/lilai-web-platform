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
and self-hosted Noto font faces live in `src/styles/tokens.css`.
The production reference's font subsets and SIL license live in `public/fonts`.
When extending shell copy, verify that those subsets contain the new characters.
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

```bash
$env:CHECK_BASE_URL="https://your-preview.vercel.app"
npm run check:urls
```

Every important public URL should return `2xx` or `3xx` before DNS is pointed to Vercel.

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

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Set environment variables in Vercel.
4. Test homepage, WordPress fallback URLs, `/wp-json`, `/wp-content`, cart, checkout, and my-account on Preview.
5. Only switch DNS after URL preservation and checkout tests pass.
