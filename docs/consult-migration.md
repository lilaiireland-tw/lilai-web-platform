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

## Preserved integration behavior

- Main submission and accuracy feedback still post directly to the same Google
  Apps Script web app.
- Both requests remain `POST`, `mode: "no-cors"`, with
  `Content-Type: text/plain;charset=utf-8` and JSON-stringified bodies.
- The main payload retains every existing key, calculated stage/route values,
  team email, resource link, discount values and Taipei timestamp.
- Accuracy feedback retains `type: accuracy_feedback` and adds
  `urgentFollowUp: true` only for `不太準`.
- Google Ads retains event `conversion` and
  `send_to: AW-17610996814/Ynp6CPHkhe4cEM74yc1B`. It runs only after the main
  `fetch` promise resolves and is guarded against duplicate firing. Carousel,
  form navigation and accuracy feedback do not fire a conversion.
- No GAS, Google Forms, Queue, Sheet, email, Worker, WordPress or production
  route configuration is changed.

Because a `no-cors` response is opaque, the browser cannot verify the GAS HTTP
status or confirm server-side receipt. The success screen therefore preserves
the original behavior: it means the browser dispatched the request without a
client-side network exception, not that GAS confirmed persistence. Changing
that contract needs a separate issue and coordinated backend work.

## Routing and SEO

- Next.js serves `/consult` and `/consult/`; query strings remain on the current
  URL because the page does not redirect or replace browser history.
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
