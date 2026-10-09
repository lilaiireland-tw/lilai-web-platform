# `/consult/` frontend migration

Issue #25 moves the existing WordPress-embedded consultation frontend into the
Next.js App Router. The implementation was transcribed from the supplied
`index-with-wp-note.md` source and uses the shared Top Strip, Header, Footer,
self-hosted fonts and canonical design tokens.

The public page and supplied source were compared on 2026-10-08. The public
HTML still exposed an older question set (including different plan/budget
choices and without the supplied source's work-intention, city-preference and
Line ID fields). Per the project owner's explicit direction, this migration
uses the supplied root source for form content, values, calculations and
submission behavior. The public canonical and title are retained; its broken
CSS-text meta description is replaced with a meaningful page description.

## Owner-approved questionnaire

The project owner approved the supplied questionnaire as the version to keep.
The older form still published in WordPress is not a source for reverting these
fields. `index-with-wp-note.md` remains authoritative for wording, option
values, calculations, GAS payloads and assessment results. Specifically:

1. LINE ID remains optional.
2. The course choices retain `考試準備班／商業英文` instead of the older
   `碩士／專業文憑課程` choice.
3. The Ireland work-intention question remains.
4. The English-learning priority question remains.
5. The city-preference question remains.
6. The new budget range from `NT$30 萬以下` through `NT$45 萬以上` remains.

## Preserved integration behavior

- Main submission and accuracy feedback still post directly to the same Google
  Apps Script web app.
- Both requests remain `POST`, `mode: "no-cors"`, with
  `Content-Type: text/plain;charset=utf-8` and JSON-stringified bodies.
- The main payload retains every existing key, calculated stage/route values,
  team email, resource link, discount values and Taipei timestamp.
- Accuracy feedback retains `type: accuracy_feedback` and adds
  `urgentFollowUp: true` only for `不太準`.
- The signup repository's `main` branch is the reference architecture for the
  global tag and conversion helper. All apps share tag ID `AW-17610996814`, but
  the conversion actions stay separate: direct signup uses
  `AW-17610996814/MeKhCKz2-e0cEM74yc1B`, signup consultation uses
  `AW-17610996814/b4bzCNrO-u0cEM74yc1B`, and this Consultation Page retains
  `AW-17610996814/Ynp6CPHkhe4cEM74yc1B`.
- The root layout owns one reusable Google Tag loader. On an explicitly marked
  production build served from exactly `lilaiireland.com`, it initializes
  `dataLayer`, queues `gtag('js', new Date())`, configures
  `gtag('config', 'AW-17610996814')`, and loads Google's official script with
  Next.js `afterInteractive`. Staging/preview/local builds and non-production
  hostnames do not initialize `gtag` or load the remote script.
- The consultation conversion remains event `conversion` with
  `send_to: AW-17610996814/Ynp6CPHkhe4cEM74yc1B`. It runs only after the main
  GAS `fetch` promise resolves. A synchronous in-flight/completed gate prevents
  repeated clicks and handler re-entry; a separate per-mount conversion guard
  prevents React re-render duplicates. A rejected fetch remains retryable, and
  a fresh page/form lifecycle can make a genuinely separate submission.
- The local `gtag` queue is created before the external script is ready, so an
  eligible post-fetch conversion is queued rather than silently discarded.
  Carousel use, form navigation, validation failures, loading state and
  accuracy feedback never invoke the main conversion.
- No GAS, Google Forms, Queue, Sheet, email, Worker, WordPress or production
  route configuration is changed.

Because a `no-cors` response is opaque, the browser cannot verify the GAS HTTP
status or confirm server-side receipt. The success screen therefore preserves
the original behavior: it means the browser dispatched the request without a
client-side network exception, not that GAS confirmed persistence. Changing
that contract needs a separate issue and coordinated backend work.

## Routing and SEO

- With the repository's canonical no-trailing-slash behavior, `/consult/`
  redirects once with HTTP 308 to `/consult`. Next.js preserves the query
  string, including Google Ads attribution parameters such as `gclid` and UTM
  values. The redirect happens before the page mounts, so it cannot create a
  duplicate page view or conversion in this application.
- The production canonical is `https://lilaiireland.com/consult/`.
- Staging builds set page robots to `noindex, nofollow`; the existing staging
  Worker also adds `X-Robots-Tag: noindex, nofollow`.
- `/consult` is added to the isolated staging frontend allowlist. This does not
  change production route ownership or deploy any Worker.

## Manual staging test matrix

Use mock/explicitly authorized test data only. Do not submit real leads or use
production ad-conversion tooling during verification.

| Area | Required checks |
| --- | --- |
| Routes / shell | Open `/consult`, `/consult/`, and a URL with query parameters. Confirm shared Top Strip, sticky Header, navigation and Footer appear once, the path/query are retained, and staging response/header metadata are noindex. |
| Desktop visual | At 1440px and 1024px, compare hero crops, typography, spacing, benefit cards, five-step form, result cards/CTAs and FAQ against the current page/source. Check horizontal overflow. |
| Mobile visual | At 375px and 768px, check hero crop/dots, hidden small-screen arrows, one-column cards, full-width form actions, sticky shell offsets, long option wrapping and no horizontal overflow. |
| Carousel | Confirm 4.5-second auto advance, previous/next buttons, dots, image loading, keyboard focus and reduced-motion behavior. |
| Step 1 | Required name/nickname, email format, optional IG/Line, leading `@` normalization, max lengths, location, error announcement and correction. |
| Step 2 | Every awareness, timeline and plan value; Back/Continue retains selections. |
| Step 3 | Work intention, multi-select goals, English goal and required long answer; confirm `wantWork` semantics for yes/considering/no. |
| Step 4 | Select/deselect each group; confirm a fourth barrier is rejected and the temporary max-three message appears. |
| Step 5 | Webinar multi-select, both consent controls, submit disabled/loading state and prevention of duplicate submission. |
| Results | Exercise watch/explore/ready/action and 25+8 paths. Compare stage copy, blocker combinations, next steps, time anchors and all CTA links/prices. |
| Feedback | Test each accuracy response with mocked/authorized networking; confirm the thank-you message and `urgentFollowUp` only for `不太準`. |
| Analytics | With the request and `gtag` mocked, confirm no conversion on load, carousel use, step navigation, validation failure or feedback. Confirm exactly one conversion after a resolved main submission and none after a rejected request/repeated click. |
| Network contract | Inspect mocked requests for the exact endpoint, POST/no-cors/text body, unchanged keys/value strings and both payload shapes. Remember DevTools cannot expose an opaque GAS response status. |
| Browser behavior | Chrome, Safari and Firefox: Back/Continue controls, native focus-visible order, anchor scroll, refresh, query parameters, console errors, hydration warnings and remote hero/CSP/CORS loading. |

Automated checks mock or inspect the contract only; they never call GAS, submit
Google Forms, or invoke `gtag`.

## Manual Google Tag Assistant verification

Perform this only on an authorized production-host test window with an approved
non-lead test plan; staging and localhost intentionally have no Google Tag.

1. Start a Tag Assistant session on `https://lilaiireland.com/consult` and
   confirm one Google tag for `AW-17610996814` and one config initialization.
2. Open `/consult/?gclid=test-tag-assistant&utm_source=manual-qa`, follow the
   `/consult/` redirect variant as well, and confirm the query parameters reach
   the final URL before the page initializes.
3. Navigate between steps and provoke validation errors. Confirm no
   `conversion` event appears.
4. With the GAS request safely mocked or otherwise explicitly authorized,
   confirm a rejected request produces no conversion and a resolved opaque
   request produces exactly one event sent to
   `AW-17610996814/Ynp6CPHkhe4cEM74yc1B`.
5. Repeat-click during submission and submit accuracy feedback; confirm neither
   creates another main conversion. Confirm neither signup label appears.

No consent-management platform or Google Consent Mode integration was present
in this repository or the referenced signup implementation during this review.
The form's two existing consent controls are unchanged and remain required
before submission, but they are not documented as cookie-consent controls.
Production consent/banner behavior therefore remains unverified and must be
checked in the real public shell before cutover; this PR does not bypass or
invent a consent decision.
