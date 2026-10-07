# Issue #1 verification

## Automated checks

- `npm ci`: passed; lockfile unchanged. npm reported 14 existing dependency audit findings (2 moderate, 11 high, 1 critical); dependency upgrades are outside this issue.
- `npx.cmd tsc --noEmit --incremental false`: passed. No type-check script currently exists.
- `npm run build`: passed with Next.js 16.2.10.
- `npm.cmd run lint`: fails with `Invalid project directory provided .../lint`. Develop already uses `next lint`, which the installed Next.js does not provide. No lint config exists. Direct ESLint API checks using `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` passed for changed TS/TSX files with 0 errors and 0 warnings.
- `npx.cmd tsx scripts/check-shared-layout.ts`: passed. Checks exactly one shell and main on home/page/post responses; unchanged homepage main HTML; navigation fragments; nested WordPress fallback; missing content/product 404; all six protected rewrites; retained noindex declarations; local logo/fonts. Next.js can return 404 as an error document whose shell is in Flight data; the test checks that payload without claiming browser hydration was verified.
- `CHECK_BASE_URL=http://127.0.0.1:43171 npm run check:urls` (PowerShell environment syntax): passed, but all non-home URLs only returned 308 slash redirects. This script does not establish that redirect destinations contain content.
- `git diff --check`: passed.
- Font cmap inspection: all Chinese navigation and brand characters are present in the three copied font subsets.
- Comparison with `origin/develop`: homepage `<main>` is byte-identical; WordPress/product handlers, integration libraries, routing config, sitemap, dependency manifests and lockfile are unchanged.

## Read-only HTTP checks

- Production `/consult/`, `/language-school-signup/`, `/agreement/`: HTTP 200 after redirects.
- Homepage on the local production build: HTTP 200, shared shell present.
- Missing slug on the production build: HTTP 404 after the existing slash redirect.
- Default `cms.lilaiireland.com` API cannot be reached from this environment. Live WordPress content must be verified against a reachable CMS; fixture page/post and nested-slug checks passed.
- External proxy responses from `/cart/*`, `/checkout/*`, `/my-account/*` omit `X-Robots-Tag` despite configured declarations. A disposable develop server reproduces this with a local origin (`/cart/layout-probe` returns 200 with no header); this PR does not change routing or headers. Infrastructure follow-up may be needed.

## Browser checks still required

Computer-use inventory returned no browsers; Chrome and the in-app browser were unavailable. No screenshots or browser console results are claimed. Reviewer should verify:

- Desktop header, sticky/blur appearance, logo and footer.
- Mobile menu at 320/375/768/1100px; open/close, Enter/Space, Escape focus return, outside click, link selection, leaving focus and resizing to desktop.
- Skip link and visible focus states; navigation from home and a WordPress page.
- No horizontal overflow, hydration errors, console errors or noticeable layout shift.
- Final live CMS fallback content and 404 hydration; protected WordPress/WooCommerce destinations on the intended preview environment.

The shell uses production service URLs because these apps have not migrated. Existing homepage section CTAs keep their original local URLs and depend on existing content/routing. No production deployment or backend changes were performed.
