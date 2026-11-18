# Ireland 25+8 landing page handoff

Route: `/ireland-25-plus-8/`. Source: local `deploy/ireland-25-plus-8.html`
and `deploy/README_上架交接.md`, supplied November 18, 2026. No issue number
was supplied. Work starts from `origin/develop` at `f94ca55` (Black Friday PR #49).
Original deploy/handoff inputs are not published or committed.

## Implementation

Like Black Friday, the page is a scoped source-parity exception. Original static
markup, copy, inline styles, composition and native interactions remain, including
the source's two initially expanded FAQ entries. Root Layout supplies the shared
Top Strip, Header and Footer. Source mobile header/menu/footer are omitted.
Source tokens/defaults apply only inside `.ireland25`; shared styles are unchanged.
Native interactions have mount/unmount cleanup, source keyboard behavior and
reduced-motion support. Anchor offsets account for the shared shell. Mobile CTA
also hides at the shared footer and while the consent notice is visible.

All seven JPEG photos and eighteen SVG icons retain supplied bytes under
`public/assets/ireland-25-plus-8/`. Photos gain intrinsic dimensions, async decoding
and below-fold lazy loading. No image resizing, lossy recompression, remote image
service or base64 is used. Lucide icons are ISC licensed; see the source handoff
and <https://github.com/lucide-icons/lucide/blob/main/LICENSE>.

The source Google Fonts families and all eleven requested weights are self-hosted
under private CSS family aliases. Public full font files were downloaded using
family/weight requests only, then subset to supplied copy locally with FontTools
and compressed as WOFF2. No page text was transmitted. The initial proposed
remote text-subset request was rejected by automatic review and was not executed.
SIL OFL and copyright notices accompany the fonts. Recheck glyph coverage when
editing copy. No packages were added.

Free assessment links use the established `/consult` destination. Interaction
events retain source names and require the shared analytics consent cookie;
no new analytics vendor is installed and clicks are not conversions.
Optional video and non-public Notion school links stay absent, as in the source's
production configuration. No replay URL, permission gate or countdown is added.

## Release blockers and routing

- Missing paid fast-consultation booking URL: the original card/button remain
  visually present but the link is disabled with ARIA and has no placeholder URL.
  Once supplied, add its `href`, remove disabled attributes, retain
  `data-paid-consult` and verify navigation/event behavior.
- Missing `og-25plus8.png`: no broken image URL is advertised. Add the approved
  artwork and set OG/Twitter image metadata when available.
- Page remains `noindex, nofollow`, with no new static sitemap entry, until the required
  handoff inputs are complete. Do not describe this state as production launched.
- Owner still needs to confirm the source fee tiers/refund wording and operational
  replay process; none was rewritten or independently revalidated.

The existing exact production Router allowlist gains this path with/without a
trailing slash. Prefix lookalikes, child paths, WordPress query endpoints and
signup ownership remain unchanged. Standalone staging admits the same page.
Assets use the already routed `/assets/` namespace. Canonical and JSON-LD remain
`https://lilaiireland.com/ireland-25-plus-8/`; Next's existing slash redirect is
unchanged. No live Cloudflare Routes, DNS, bindings, WordPress or backend changed.

Unlike Black Friday inside `/events/`, this top-level URL requires releasing the
updated **Router code as well as Platform code**. The existing manual workflow
deploys Platform only, so that workflow alone cannot activate this new URL.
Router release must preserve Dashboard-owned Routes (the Router config omits
route keys). Follow the existing release review process; do not add a broad
Worker route, move signup or merge/deploy this PR automatically.

## Verification

- `npm ci`, TypeScript, shared-layout, design-system, production-routing,
  production-router, new `scripts/check-25plus8.ts`, Next production build and
  `git diff --check` are required. The new source check runs in both existing CI
  validation workflows. It verifies local assets/fonts, seven original photo
  hashes when deploy inputs exist, lazy image dimensions, canonical, noindex and
  route ownership.
- `node scripts/check-25plus8-reference.cjs` compares original and built content
  geometry/computed styles at 320/375/390/430/768/1024/1440px using identical local
  fonts; shared shell is excluded. Requires built app on 127.0.0.1:3100 and local
  deploy inputs. External requests are blocked. Reports/screenshots are ignored
  under `artifacts/25plus8/`. It also checks one H1/shared shell, overflow, tab
  keyboard controls, FAQ keyboard disclosure, carousel and school-card anchors.
- No production forms or services may be submitted by tests.

Local results: `npm ci`, TypeScript, shared-layout, design-system, events,
Black Friday, Daydream, production-routing, production-router, new source check,
production build and diff check passed. Chromium reference comparison passed all
seven widths with zero geometry/computed-style differences across 662–680 visible
elements per width, and no page/console errors. Initial reference-font URL and
FAQ test assumptions were corrected before the passing run. Mobile/desktop hero
screenshots were visually inspected. These results do not establish Safari or
production analytics behavior.
Additional Chromium checks passed normal motion, mobile sticky visibility and
footer/consent suppression, and zero analytics events before consent versus one
event after consent. No production destination was contacted.

Manual release QA: final-domain OG cards; Safari/Firefox and real iOS/Android at
the seven widths above; focus-visible and all anchor/header offsets; progress
rail at >=1260px; sticky suppression at CTA zones/footer/consent; touch carousel;
normal/reduced motion; console/hydration errors; real GA4/GTM receiving and event
deduplication after consent. No GTM container ID was supplied, so receiving is
unverified. Existing `npm run lint` still uses removed `next lint`; unchanged.
