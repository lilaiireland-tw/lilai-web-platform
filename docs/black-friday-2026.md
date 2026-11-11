# Black Friday 2026 campaign

Route: `/events/black-friday-2026`. Source: local `handoff/site/index.html`
and `handoff/README.md`. The standalone HTML is a reference input only.
The user approved the supplied offers, including the maximum 30% discount,
and November 1 as the internal start date. Visible copy remains “即日起”.
The internal timestamp uses UTC+8, consistent with the Taiwan audience;
the handoff does not specify a precise closing time or timezone.

## Integration

The content-only event manifest registers the campaign for existing static
routes, route ownership and the events index. The custom server component
renders nine source sections. Root Layout supplies the only Top Strip,
Header and Footer. Campaign anchors sit in a separate, non-sticky page nav.
No shared shell, WordPress, Worker, DNS or deployment configuration changes.
Existing brand tokens, self-hosted fonts, Button and event status banner remain
in use. Canonical/OG URLs use the public domain; the shared metadata builder
now also supplies Twitter cards for event pages. Indexing remains disabled,
matching Daydream, until an explicit indexing decision is supplied.

All campaign CTA URLs derive from the event config. Only active campaigns
show LINE links. The small client component handles mobile sticky visibility
and consent-gated `line_cta_click` dataLayer/custom events. It loads no vendor
and defines no conversion. Native single-open FAQ details start with the first
answer open, matching the supplied source. No production form is submitted.

## Image delivery

Like Daydream, images live under `public/events/<slug>/`, reserve intrinsic
dimensions and use direct static delivery (`next/image` with `unoptimized`).
Below-fold images lazy-load. The hero is eager with high fetch priority.
The two photos additionally use native `picture`/`srcset` with 640px and
original-width WebP files. Browser width and pixel density select the candidate.
The hero deliberately has no separate preload, which could fetch the full
fallback as well as the picture-selected candidate. It is discoverable in
the initial server HTML. `sizes` alone does not create image variants when
`unoptimized` is enabled.

WebP encoding used the already installed Sharp, quality 82, without upscaling:

| Photo | Original JPEG | Full-width WebP | 640px WebP |
| --- | ---: | ---: | ---: |
| Street group (896×846) | 143,968 B | 92,646 B | 60,750 B |
| Cafe welcome (1080×452) | 100,785 B | 67,802 B | 34,686 B |

The two full-width files total 160,448 B versus 244,753 B originally (34% less).
The smaller files total 95,436 B (61% less). High-density phones may correctly
choose the larger file. This is a byte comparison, not a measured LCP gain.
Four supporting PNGs were recompressed with Sharp PNG compression level 9,
with identical decoded pixel buffers checked: 252,637 B → 151,159 B.
The original 1200×630 share PNG is retained separately and is not an inline
page image. No base64 bundle, external font download or second React runtime
is deployed. Low-resolution Three/ISIC source images are not upscaled.

## Verification and release

`npx tsx scripts/check-black-friday.ts` checks registration, section order,
approved offers/FAQ/terms, shell ownership, SEO, image variants/dimensions,
eager/lazy loading and active/draft/archive CTA behavior. Run the standard
shared-layout, design-system, events, Daydream, TypeScript and build checks too.

Local Chromium QA passed at 1440, 768, 390, 375 and 320px: one shared header
and footer, no horizontal overflow or console/hydration errors, FAQ mouse and
keyboard operation, mobile sticky visibility, and one hero image request.
390px DPR 3 correctly selected the full-width hero. Simulated consent checks
confirmed no event when denied, one event when granted, and sticky suppression
when the cookie panel is present. Keyboard focus had a visible solid outline.

Remaining release QA: real iOS/Android LINE app handoff, Safari/Firefox layout,
final-domain social sharing, and real analytics receiving configuration.
The supplied renewal proof submission format/deadline and payment method remain
unspecified; this page does not invent them or implement subsidy processing.

There is no automatic expiry in the existing static event architecture.
On December 1, archive the event and rebuild to remove campaign LINE CTAs and
show the existing ended banner. Review retained historical offers/FAQ, SEO and
sharing artwork; stop related ads separately. This PR does not publish or merge.
