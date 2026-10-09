# Event and campaign architecture

All events use the existing Next.js deployment and root site shell (Issue #10).
No new Worker, backend, dependency, analytics vendor or deployment is introduced.

## First migration: Daydream Adventure 2027

`/events/daydream-adventure-2027/` is registered as an active, static campaign.
Approved content, ten-section order, image descriptions and paper/film visual
composition come from the supplied root `白日夢冒險王 Landing Page v3.html`.
The date is **2026-10-18 20:00 UTC+8**, despite the 2027 campaign name. The
source gives an approximate duration of 90–120 minutes, not an exact end time.
Registration uses the supplied `https://forms.gle/isPDKepgK9BsPpg86` URL.
Registration is button-based throughout the campaign.
Hero, agenda, event-info, closing and mobile-sticky CTAs lead to the in-page
`#register` section using native anchors and existing smooth-scroll/sticky offsets.
Only the registration-card CTA opens the approved Google Form in a new tab.
The campaign anchor helper retains status enforcement and analytics attributes;
the mobile near-registration/closing visibility behavior is unchanged.

`daydream-copy.ts` holds the approved narrative and image metadata;
`daydream-adventure-2027.ts` holds event lifecycle, registration, contact and SEO
config. `DaydreamCampaign` composes these with shared speaker cards, FAQ and
status-aware CTAs. The mobile sticky CTA is the only campaign client component.
The shared shell remains the only site header/footer; the campaign disclaimer
is preserved in closing content. Archived rendering removes links and QR code
for registration while retaining content and the shared latest-events banner.

Twelve recovered production assets live under `public/events/daydream-adventure-2027/`.
All intrinsic dimensions and approved alt text are preserved. Ten small JPEG/PNG
files and Alex's portrait retain exact recovered bytes; Arsha's portrait is WebP
at its original 1066×1600 dimensions (207,426 → 105,892 bytes). No image is upscaled
or recompressed at runtime. Hero alone uses priority/high fetch priority; all
eleven remaining images lazy-load. Unused extracted logos, icons, bundle runtime,
base64 manifest and fonts are excluded. The root HTML and extraction folder are
local migration inputs, excluded from the PR and production public directory.

No approved description/OG-specific artwork or indexing directive was supplied.
Metadata uses the approved title and speaker-section introduction, and the real
hero photo for OG without inventing artwork. The campaign conservatively uses
`seo.index=false`; it appears on `/events/` but is excluded from the sitemap.
Staging remains noindex. A later approved indexing decision can change the config.
For production discovery of indexable events, confirm
`EVENT_DEPLOYMENT_ENV=production` at build time; deployment changes remain outside
this campaign PR.

## Add an approved campaign

1. Create `src/content/events/<slug>.ts` exporting an `EventContent` object.
   Import and register it in `src/content/events/index.ts` as `{ event }`.
   Registry is the single source for routing, status, metadata, index and sitemap.
2. Use ISO timestamps with explicit timezone. Supply approved `dateLabel` for
   display (including end time when applicable), venue and format. Status is
   explicit; passing a date does not silently close registration. Archive and
   rebuild when registration closes.
3. Place extracted assets in `public/events/<slug>/`. Use WebP/AVIF where
   suitable; supply image src, width, height and alt. No inline base64 or giant
   bundled HTML. Hero uses Next Image priority; speaker images lazy-load with
   intrinsic dimensions. Custom layouts must reserve image space and use a
   sensible `sizes` prop if changing the shared image layout.
4. Set unique SEO title/description, OG image and index preference. Canonicals
   and OG URLs always use `https://lilaiireland.com`, including preview builds.
5. Arrange the typed `sections` array in campaign order: info, speakers,
   agenda/highlights, FAQ and CTA. Each section needs a unique, stable HTML-safe
   id. For independent storytelling/hero layout/custom sections, register
   `{ event, Content: CampaignContent }`, a server component receiving `event`.
   Compose shared primitives with campaign components; `EventPage` retains
   the main landmark and status banner. Custom content must have one h1 and
   use `EventCta` for registration so status enforcement remains consistent.
6. Set optional `nextEventSlug` when an archived page should also link to a
   specific active event. Archive retains all original information, removes
   registration CTA sections and hero registration, and links to `/events/`.
7. Run checks, review desktop/mobile, then PR to develop and use the existing
   staging/main release flow. Adding or changing events requires a rebuild.

## Build policy and discovery

Set `EVENT_DEPLOYMENT_ENV=production` **only for the production build**. Leave
it unset or `preview` on staging/dev. This explicit marker avoids accidentally
indexing staging when `NODE_ENV=production` or the public site URL is reused.
This policy applies to event routes only; existing site-wide robots/routing
remain unchanged. Event pages default to noindex until production is explicit.
Do not promote preview-built artifacts as production without rebuilding.

Drafts are 404 and absent from static params by default. Opt into preview
routes with `EVENTS_INCLUDE_DRAFTS=true`; this flag is ignored in production.
Drafts always noindex/nofollow and never appear in the index or sitemap.
Active and archived events appear in separate registry-generated index groups,
including public noindex campaigns. Only indexable public event URLs (and the
index) are added to the production sitemap. Unknown slugs are 404, never
WordPress fallback. No navigation or existing route ownership is changed.
Preview visibility is not authentication; use existing staging access controls
for confidential material.

`EventCta` exposes `data-event-slug`, `data-campaign-name` and
`data-cta-location` for delegated tracking. It preserves the exact approved
registration URL, does not append query parameters, and installs no listeners.

## Verification

`npx tsx scripts/check-events.ts` uses synthetic fixtures to check registry
resolution, slug/duplicate guards, lifecycle visibility, active/archived index,
production index/noindex and staging noindex, canonical/OG metadata, CTA URLs,
archived registration removal, custom composition and native FAQ markup.
It temporarily registers fixtures for a local Next dev server, checks HTTP
status/metadata/shared shell, then restores source and `next-env.d.ts` in a
finally block. Run this check alone, not concurrently with build/other dev tests.
It never submits forms or contacts registration services.

Browser QA is still required at 1440, 768 and 375px (also 320px for long text):
shared sticky strip/header/footer, horizontal overflow, keyboard focus-visible,
FAQ disclosures, archive/next-event links, CTA destinations without submission,
image layout shift/LCP and console/hydration errors. Compare the real campaign
against v3, including film crops, speaker offsets and all ten sections. No browser
was available in the migration session; these checks must be completed in review.
`npx tsx scripts/check-daydream.ts` additionally checks real registry registration,
approved date/CTA, all narrative copy, section order, image attributes/loading,
FAQ/speakers, metadata, in-page campaign/mobile CTA destinations, the sole
new-tab Google Form link, and archived removal of registration links/QR.
