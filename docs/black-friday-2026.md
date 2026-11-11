# Black Friday 2026 source parity

Route: `/events/black-friday-2026`. Source composition, copy and inline styles
come directly from local `handoff/site/index.html`; component visuals come
from `handoff/site/js/ds-bundle.js`. The standalone handoff provides the exact
original font binaries and thirteen CSS weight declarations. Original handoff
inputs stay untracked and are not deployed.

## Appearance and intentional exceptions

The user explicitly requested the original design and fonts instead of shared
primitive styling. Like Daydream, this is a scoped source-parity exception.
The campaign preserves all nine sections, 1160/940px containers, 1000/760px
breakpoints, inline sizes/spacing/line breaks, ticket cutouts, photo shadows,
rotated ribbon, discount typography, renewal/About grids and final watermark.
FAQ restores seven white bordered boxes, 13px corners, 52px summaries and chevrons.

The `.design` subtree isolates source tokens/defaults from legacy homepage rules.
Shared fonts, tokens, Header and Footer remain unchanged. Source Button/Icon/FAQ
visuals are small native React implementations. No second React, editor runtime,
iframe or global source CSS is deployed. School-offer data, FAQ and terms retain
one content source.

Requested exceptions remain:

- Root Layout supplies the site-wide Top Strip, Header and Footer.
- The accepted five-item page nav includes a plain LINE link and uniform brand
  green/white hover/focus transitions.
- Campaign-only scroll padding matches the shell: 173px desktop, 123px at
  <=760px. Recheck if shared shell heights change.
- All campaign LINE links open new tabs with `noopener noreferrer`, preserving
  approved URLs and consent-gated click hooks. Clicks are not conversions.
- FAQ retains 250ms opening fade/slide and native-height transitions where
  supported, reduced motion and keyboard-visible focus.
- The mobile sticky action retains visibility/consent suppression and restores
  the original full-width button/note appearance.
- Existing status guards, routing, canonical/OG/Twitter and conservative noindex
  remain. Archived/draft campaigns expose no campaign LINE links.

The user approved the supplied offers and November 1 as the internal start date.
Visible wording remains 即日起至 2026/11/30. Internal timezone is UTC+8; no precise
closing time was supplied.

## Original fonts and images

Three unmodified WOFF2 subsets were recovered from the standalone manifest:

| Source family | Private CSS family | Size | Variable weight range |
| --- | --- | ---: | --- |
| Inter | Black Friday Inter | 30,152 B | 100-900 |
| Noto Sans TC | Black Friday Sans | 114,644 B | 100-900 |
| Noto Serif TC | Black Friday Serif | 154,028 B | 200-900 |

All thirteen original font-face weight declarations and unicode ranges remain,
including actual 800/900 weights. Private CSS aliases isolate the campaign from
shared faces; no font binary was modified. Copyright notices and SIL OFL text
accompany the files. These subsets cover supplied copy; audit when changing text.

Photos use original JPEG bytes (896x846 and 1080x452), with earlier lossy WebP
variants removed. Supporting PNGs retain losslessly recompressed pixels; the
share image and four icon SVGs retain source bytes. Assets are local under
`public/events/black-friday-2026/`. Source image dimensions, lazy loading and
hero high fetch priority remain. No upscaling, runtime transformation, base64
or external font download. Exact photos take precedence over prior byte savings.

## Verification

Run TypeScript, build, shared-layout, design-system, events, Daydream and diff
checks. `npx tsx scripts/check-black-friday.ts` verifies content, SEO, source
section order, fonts/assets, FAQ, safe new-tab CTAs and lifecycle guards.
Passing `handoff` as an argument additionally verifies JPEG bytes and all three
WOFF2 SHA-256 hashes against the original.

For reference QA, start the built app on 127.0.0.1:3100, then in another terminal:

```powershell
python -m http.server 3101 --bind 127.0.0.1 --directory handoff/site
node scripts/check-black-friday-reference.cjs
```

This Chromium check serves the source Google Fonts request the exact recovered
fonts locally and blocks other external requests. At 1440/1024/760/759/390/320px,
it compares visible content geometry and computed styles after normalizing
private font names and editor-only wrappers. Intentional shell/nav differences
and transient animation states are excluded. All nine section heights and
compared styles match. Section screenshot checks allow <0.1% differing interior
pixels, excluding the outer pixel and <=2-channel antialiasing rounding.
Screenshots are also visually reviewed. JSON reports/screenshots live in ignored
`artifacts/black-friday/parity/`.

Interactive QA covers FAQ single-open/Space/Enter/animation/reduced motion,
keyboard focus, safe new-tab links, mobile sticky visibility, anchors under the
shared shell, overflow, console/hydration/font errors and duplicate hero requests.
LINE popups are intercepted locally; no request or form reaches production.

Remaining manual QA: iOS/Android LINE App handoff, Safari/Firefox appearance and
animation, final-domain social cards and actual analytics receiving config.
Existing `next lint` remains invalid and unchanged.

## Activity close

No automatic expiry exists. On December 1 archive/rebuild, review historical
copy/FAQ/SEO/share artwork, and stop ads separately. No subsidy workflow is
implemented: proof deadline/format and payment method remain unspecified.
This PR does not merge, deploy or modify WordPress/Cloudflare configuration.
