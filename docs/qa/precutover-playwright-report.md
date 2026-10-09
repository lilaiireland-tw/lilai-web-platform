# Pre-Cutover Playwright Browser QA Report

## Executive summary

**Browser QA: CONDITIONAL PASS.** The reported 111 Playwright tests passed.

**Overall production cutover: NO-GO** until the release gates below are verified
and the owner explicitly approves public route attachment. See the
[production release checklist](../production-release-checklist.md), especially
its pre-cutover evidence gate and Phases D–F.

Chromium, Firefox, and WebKit exercised the production Router and Platform
through the existing local Wrangler remote Service Binding probe. The tested
pages rendered and remained usable at mobile, tablet, and desktop sizes. The
suite reported no unexpected writes, application page errors, unexpected HTTP
errors, broken rendered images, missing fonts, hydration errors, or horizontal
overflow.

The browser suite does **not** prove account-level Cloudflare configuration,
public route ownership, WordPress.com origin compatibility, WooCommerce behavior,
live payment callbacks, or production-host Google Ads behavior. These release
gates remain open:

1. Obtain WordPress.com confirmation for reverse-proxy compatibility and verify
   original Host/origin behavior.
2. Verify Cloudflare DNS, TLS/SNI, Cache, Redirect, Origin, and Security Rules
   against the approved release baseline.
3. Verify WooCommerce login, cart, checkout, sessions/cookies, cache bypass, and
   payment callbacks in an approved nonproduction plan. No live transaction was
   performed by this suite.
4. Verify public apex Worker Route precedence and preservation of both signup
   routes immediately before cutover.
5. Verify Google Tag Assistant on the actual production hostname in a separately
   approved session, without submitting the live form.
6. Verify Safari keyboard focus on Apple hardware; headless WebKit on Windows did
   not advance plain-Tab focus from the skip link on the link-only Events index at
   desktop width.
7. Confirm rollback readiness and record explicit owner approval before attaching
   the public route.

The private probe cannot provide the account evidence above. Public apex route
precedence, Cloudflare rules, origin support, WooCommerce transaction/session
behavior, and production Tag Assistant remain release blockers under the
checklist.

No production submission, lead, email, queue job, payment, booking, deployment,
route change, WordPress write, or GAS write was performed.

## Release and runtime evidence

| Evidence | Result |
| --- | --- |
| QA branch base | `1191bfe215f085bf8629030719ccc84fc251b2a0` (`origin/develop`) |
| Tested QA commit | `189270423f40ea5c815b6adee769aee53faf4f82` |
| Production release reference | PR #35 merge SHA `149184d6aae39273c5f981405ece3a684a532244` |
| Test target | `http://127.0.0.1:8791` |
| Probe upstream header | `x-lilai-runtime-probe-upstream: remote-service-binding:lilai-web-platform-router` |
| Run start | `2026-10-09T09:42:00.509Z` |
| Run duration | 508.8 seconds (8.5 minutes) |
| Host | Windows x64, Node.js `v24.13.1` |

The probe header proves that browser requests were forwarded through the remote
Service Binding to `lilai-web-platform-router`. The probe does not expose a
deployed Worker Git SHA, so the run cannot independently bind the remote runtime
to PR #35's merge SHA. The source SHA above is captured automatically in
`run-metadata.json`.

## Browser and viewport coverage

| Browser project | Engine version | 375 × 812 | 768 × 1024 | 1440 × 900 | Result |
| --- | --- | --- | --- | --- | --- |
| Chromium | 156.0.8078.4 | PASS | PASS | PASS | PASS |
| Firefox | 157.0 | PASS | PASS | PASS | PASS |
| WebKit | 27.2 | PASS | PASS | PASS with keyboard annotation | PASS / BLOCKED item |

Playwright version: `1.64.0`. Tests used real browser processes, one worker, no
retries, and traces retained on failure. There were no failures, so no failure
trace was produced for this run.

## Page-by-page results

| Route | Result | Evidence checked |
| --- | --- | --- |
| `/` | PASS | Hero, image crop, shared shell, sticky shell, internal CTAs, progressive scrolling, assets and full-page captures |
| `/?utm_source=playwright-qa` | PASS | Query-bearing homepage rendered across all browsers and sizes |
| `/events` | PASS | Listing, event navigation, status content, keyboard navigation, canonical and shared shell |
| `/events/` | PASS | HTTP 308 to slashless route and final page rendering |
| `/events/daydream-adventure-2027` | PASS | Major image/content sections, speakers, FAQ, CTA target, metadata, responsive layout |
| `/events/daydream-adventure-2027/` | PASS | HTTP 308 to slashless route and final page rendering |
| `/consult` | PASS | Five-step form, FAQ, responsive controls and mocked submission lifecycle |
| `/consult/` | PASS | HTTP 308 to slashless route |
| `/consult/?gclid=playwright-qa&utm_source=test` | PASS | Redirect retained `gclid` and `utm_source`; canonical is `https://lilaiireland.com/consult` |
| `/events-sitemap.xml` | PASS | HTTP 200, XML content type, valid XML declaration, Daydream URL excluded |
| `/events/definitely-not-a-real-event` | PASS | Expected HTTP 404; excluded from unexpected-error classification |

The Events canonical is `https://lilaiireland.com/events`. The Daydream
canonical is slashless, its robots metadata remains `noindex, follow`, and it is
excluded from the events sitemap. The registration CTA points to the expected
Google Forms destination; the test inspected the URL without opening or
submitting it.

## Responsive layout and interactions

**PASS** across the tested matrix:

- No document-level horizontal overflow or clipped text was detected.
- Header, footer, and top strip each rendered exactly once.
- The top strip and header retained their sticky positions during scrolling.
- Mobile navigation opened and closed with Escape.
- Progressive scroll checks activated viewport-dependent content and confirmed
  the page remained usable afterward.
- Rendered images had nonzero intrinsic dimensions and document fonts reached
  the loaded state.
- Homepage navigation reached `/consult`; `/events` navigation was also verified.
- Event and consultation FAQs expanded and collapsed through browser clicks.
- Full-page screenshot review at 375 px and 1440 px found coherent section
  ordering, readable typography, and no visible overlapping sections in the four
  primary pages.

Keyboard focus and visible focus indicators passed in Chromium and Firefox.
WebKit passed the interactive pages and mobile/tablet checks, but the two desktop
Events index variants carry the BLOCKED annotation described above.

## Console and network findings

| Check | Result | Detail |
| --- | --- | --- |
| Uncaught JavaScript exceptions | PASS | None |
| React hydration errors | PASS | None |
| Failed network requests | PASS | None |
| Unexpected first-party 4xx/5xx | PASS | None |
| Broken images or fonts | PASS | None |
| Expected redirect/404 handling | PASS | 308 slash redirects and the deliberate unknown-event 404 were classified as expected |
| Unexpected write requests | PASS | No unmatched unsafe request was observed; all non-GET/HEAD requests were blocked before network access |

Firefox reported third-party YouTube cookie rejection messages for
`__Secure-BUCKET` and `__Secure-YEC` in the embedded player. These were retained
in diagnostics and classified as external player noise because there was no
first-party exception, failed request, or page breakage.

The homepage YouTube player requested `googleads.g.doubleclick.net/pagead/id`
and `static.doubleclick.net/instream/ad_status.js`. These are player-originated
third-party requests, not the site's Google Ads tag or consultation conversion.
No request for conversion label
`AW-17610996814/Ynp6CPHkhe4cEM74yc1B` was observed.

The write guard records method and URL, aborts non-GET/HEAD requests, and fails
the corresponding test with those details. Three exact POST endpoint patterns
from the homepage's embedded YouTube player are classified as intentionally
blocked external telemetry and remain recorded in Playwright's
`write-request-diagnostics` attachments:

- `POST https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT`
- `POST https://www.youtube.com/youtubei/v1/log_event`
- `POST https://www.youtube.com/api/stats/atr`

The full run recorded 82 such player telemetry requests (66 to
`jnn-pa.googleapis.com` and 16 to `www.youtube.com`), aborted by Playwright.
Firefox's CORS console messages for the first endpoint were caused by that
intentional abort and remain visible in raw diagnostics. Any other unsafe
request, including an unmatched unsafe request in a consultation test, is
aborted and fails its test with method and URL.

## Consultation form

| Scenario | Result |
| --- | --- |
| Required fields and invalid email | PASS |
| Optional Instagram and Line fields | PASS |
| Radio, checkbox, and maximum-three multi-select behavior | PASS |
| Back/Continue and retained earlier values | PASS |
| Long text wrapping and retained long response | PASS |
| Consent validation | PASS |
| Submitting disabled state and duplicate prevention | PASS |
| Mocked successful response and result state | PASS |
| Mocked failed response and retry state | PASS |
| Result CTA destinations | PASS |
| FAQ and responsive controls | PASS |

Every submission-lifecycle test installed routing interception before navigating
to `/consult`. Requests to both `script.google.com` and
`script.googleusercontent.com` were intercepted. The successful response was
fulfilled deterministically in Playwright; the failure response was aborted.
The interception counts proved one request for success, no duplicate while
submitting, and two explicitly initiated mocked attempts for the retry test.
**Requests reaching the real GAS endpoint: zero.** Only synthetic data using the
reserved `.test` email domain was used.

Unmatched unsafe requests in either submission test were explicitly aborted and
asserted empty. The deterministic GAS mocks remain limited to the success and
failure lifecycle scenarios.

## Google Ads verification and limitations

**PASS** for the private-host safety assertions:

- `window.__lilaiGoogleAdsConfigured` and `window.dataLayer` remained undefined
  on `127.0.0.1`.
- Navigation and validation emitted no GAS or Google Ads requests.
- Mocked success and failure emitted no site conversion request.
- Existing unit-level lifecycle checks passed through `npm run check:consult`.
- The production hostname guard and tracking implementation were not changed.

**BLOCKED:** real Google Tag Assistant verification for Google tag
`AW-17610996814` and conversion
`AW-17610996814/Ynp6CPHkhe4cEM74yc1B` requires a separately approved
public-hostname test after cutover. The test must not submit the live form.

## WordPress and signup read-only compatibility

All checks used GET and HEAD only. Each GET returned the probe header identifying
the remote Router binding.

| Route | GET | HEAD | Observed request ownership / query |
| --- | --- | --- | --- |
| `/study-in-ireland-guide/` | 200 | 200 | Router forwarded to public WordPress URL |
| `/about/` | 200 | 200 | Router forwarded to public WordPress URL |
| `/wp-json/` | 200 | 200 | Router forwarded to WordPress API URL |
| `/robots.txt` | 200 | 200 | Router response available |
| `/sitemap_index.xml` | 200 | 200 | WordPress sitemap available |
| `/post-sitemap.xml` | 200 | 200 | WordPress sitemap available |
| `/page-sitemap.xml` | 200 | 200 | WordPress sitemap available |
| `/language-school-signup` | 200 | 200 | Signup route available |
| `/language-school-signup/` | 200 | 200 | Signup route available |
| `/language-school-signup/?utm_source=playwright-qa` | 200 | 200 | `utm_source=playwright-qa` preserved in upstream request URL |

**BLOCKED:** these remote-probe results do not prove public apex Cloudflare route
precedence after attaching the apex catch-all. Verify that precedence during the
cutover window before broad traffic is allowed.

The broader WordPress.com proxy compatibility, Cloudflare DNS/TLS/Cache/
Redirect/Origin/Security Rule review, WooCommerce login/cart/checkout/
session/cookie/payment callback checks, signup route ownership, rollback
readiness, and explicit owner approval are also outstanding under the
[production release checklist](../production-release-checklist.md). The 200
responses above prove only GET/HEAD reachability through the remote Router probe;
they do not prove those release gates.

## Artifacts

Artifacts are generated under the ignored directory
`artifacts/precutover-playwright/`:

- `html-report/index.html` — interactive Playwright report
- `results.json` — machine-readable 111-test result set
- `run-metadata.json` — timestamp, tested SHA, target, upstream header and host
- `screenshots/` — 24 full-page PNG files: Chromium, Firefox, and WebKit × home,
  Events, Daydream, and consultation × 375 px and 1440 px
- `test-results/` — failure traces/screenshots when a future run fails

Reproduce with:

```bash
npm ci
npx playwright install chromium firefox webkit
npm run qa:precutover
```

## Supporting regression checks

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 631 packages installed |
| `npm run cf:typegen` and `npm run cf:typegen:router` | PASS; Wrangler generated types (Wrangler could not write its optional log under the restricted user profile; both commands exited 0) |
| `npx tsc -p cloudflare/tsconfig.json` | PASS |
| `npx tsc --noEmit --incremental false` | PASS |
| `npm run check:staging` | PASS |
| `npx tsx scripts/check-production-release-strategy.ts` | PASS |
| `npx tsx scripts/check-deployment-policy.ts` | PASS |
| `npm run check:seo-url-consistency` | PASS |
| `npx tsx scripts/check-shared-layout.ts` | PASS |
| `npx tsx scripts/check-design-system.ts` | PASS |
| `npm run check:consult` | PASS |
| `npm run check:production-routing` | PASS |
| `npm run check:production-router` | PASS |
| `npm run check:production-integration` | PASS |
| `npm run build` | PASS; Next.js 16.2.10, 11 pages |
| `git diff --check` | PASS |
| `npx tsx scripts/check-cloudflare-staging.ts` | Local run BLOCKED on Windows: OpenNext child process exited `3221226505`; both Ubuntu workflow validations below passed |

`npm ci` reported 16 existing audit findings (2 moderate, 13 high, 1 critical).
No dependency audit remediation was attempted because it is outside this QA
scope. Repository lint was not run because the documented `next lint` command is
known to be invalid under Next.js 16.

GitHub Actions for PR #36 completed on Ubuntu: staging `verify` **PASS** (2m13s)
and production `validate` **PASS** (1m41s). Both deploy jobs were **skipped**;
no Worker deployment or public route attachment ran. The local OpenNext failure
is therefore recorded as a Windows-only check limitation, with the same workflow
validation passing on its supported Linux CI runner.

## Outstanding blockers and next actions

1. Complete the WordPress.com reverse-proxy compatibility evidence and verify
   original Host/origin behavior.
2. Capture and review Cloudflare DNS, TLS/SNI, Cache, Redirect, Origin, and
   Security Rule configuration against the approved baseline.
3. Verify WooCommerce login, cart, checkout, session/cookie, cache bypass, and
   payment callback behavior in an approved nonproduction environment.
4. Immediately before cutover, verify apex Worker Route precedence and both
   signup mappings; then run the release checklist's read-only smoke matrix.
5. Verify Google Tag Assistant on the actual production hostname in a separately
   approved session without submitting the form.
6. Run plain-Tab checks on `/events` in Safari on Apple hardware. If focus still
   stalls after the skip link, file an accessibility issue with the retained
   WebKit annotation and reproduction steps.
7. Confirm rollback owner/readiness and obtain explicit owner approval before
   manually attaching `lilaiireland.com/*` to the Router Worker.

Until all gates are evidenced and the owner approves route attachment, production
cutover remains **NO-GO**, regardless of the conditional browser QA pass.
