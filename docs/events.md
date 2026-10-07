# Event and campaign architecture

Part of #10. All events use the existing Next.js deployment and root site shell.
No new Worker, backend, dependency, analytics vendor or deployment is introduced.

## First migration: blocked

`/events/daydream-adventure-2027/` is **not published**. Issue #10 supplies its
name and intended slug, but explicitly requires the latest source/assets from
the user. Neither the repository nor issue comments contain those materials.
Missing: current landing-page source, approved copy and section ordering,
confirmed dates/timezone/venue/format, registration URL and CTA wording,
original hero/artwork/speaker images and OG artwork (including dimensions/alt
text), and final SEO copy/indexing decision. Preserve the existing visual and
content only once these sources arrive; do not substitute invented content.
The production registry remains empty, so `/events/` has truthful empty groups
and the unregistered campaign URL returns 404. Fixture campaigns exist only
under `scripts/fixtures/` for tests.

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
image layout shift/LCP and console/hydration errors. The first real campaign
needs its own content and visual comparison after source/assets are supplied.
