# Issue #2 verification

Base: develop `745ad7e4f018569581fd9cb4d767407e2ea1cc0c` (merged PR #9).
Brand reference: signup `a7d0fbd4d74f3b0be923a1ac85c774a3328ecf88`.

## PR #12 review correction

All three heading classes now reset margin to 0 and max-width to none, so even
ds-heading-2/3 on an h1 cannot inherit homepage width constraints. Consumers own
spacing; the showcase applies its own token-based heading margins. Homepage
globals and HTML remain unchanged by this correction.

Re-ran TypeScript, design-system checks (including a heading reset source guard),
shared-layout fixtures, production build and diff checks: all passed. Direct
ESLint on the two changed TS/TSX files: 0 errors, 0 warnings. The source guard
checks declarations, not browser computed styles. The manual font/overflow QA
below remains outstanding. Dependencies are unchanged; npm ci was not repeated
for this CSS/test/documentation correction.

## Foundation checks

- `npm ci`: passed, lockfile unchanged. Existing audit findings: 14 (2 moderate,
  11 high, 1 critical); no dependency upgrades or audit fixes.
- `npx tsc --noEmit --incremental false`: passed before and after build.
- `npx tsx scripts/check-shared-layout.ts`: passed homepage main preservation,
  single shell, WordPress page/post and nested fallback, missing/product 404,
  all six rewrites, local logo/fonts and navigation links.
- `npx tsx scripts/check-design-system.ts`: passed native button/anchor props,
  ARIA, default button type, submit type, variants/sizes/full width, and disabled
  anchor removing href/onClick and leaving the tab order.
- `npm run build`: passed on Next.js 16.2.10; showcase statically rendered.
- PostCSS parsing of all changed CSS: passed. Production showcase artifact:
  checked noindex/nofollow metadata, its own canonical, one main, invalid field
  and disabled anchor markup. This is not browser/hydration verification.
- `git diff --check`: passed.
- `npm run lint`: existing failure, `next lint` interprets lint as a project
  directory. No infrastructure change. Direct ESLint API checks with installed
  Next core-web-vitals/typescript configs: 0 errors and 0 warnings for changed
  TS/TSX files.
- Protected files compared with develop: homepage HTML/interactions, navigation,
  Next routing config, integration libraries, APIs, product/WordPress handlers,
  sitemap/robots, dependency manifests and public fonts unchanged.

## Manual QA required

Computer-use inventory had no apps or browsers. No screenshot comparison,
responsive overflow, keyboard interaction, console or hydration results are
claimed. Review `/` and `/design-system/` on the branch preview:

- Desktop: Top Strip, Header, About submenu (hover and keyboard), Buttons,
  Cards, form labels/help/errors/disabled states, Footer and skip link.
- Mobile: 375px and 768px, mobile menu including Escape/outside click/focus
  return, no horizontal overflow, visible keyboard focus.
- Sticky strip at top 0; header at 28px desktop and 26px at ≤760px. Check no
  noticeable layout shift and no browser console or hydration errors.
- Homepage reveal, counters, level selection, school cards/mobile disclosure,
  scroll rails and CTA interactions.
- Compare homepage font rendering/line wraps: shared Noto local faces now apply
  to body/headings; legacy 850–950 weights remain browser matched/synthesized.
  Existing subsets can fall back for missing CJK glyphs. Footer focus changed
  from bright yellow to the same accent outline as the rest of the site.

Live CMS fallback still requires a reachable CMS/preview; fixtures passed.
The pre-existing external proxy response omission of configured X-Robots-Tag
headers remains (reproduced by shared-layout checks); routing is untouched.
The existing next-env.d.ts user changes were preserved in
`stash@{0}` (`codex-preserve-existing-next-env`) on the original shell branch,
and are not part of this PR.
