# Pre-Cutover Playwright Browser QA Report

## Executive summary

**Recommendation: CONDITIONAL GO.**

The complete available browser suite passed: **111/111 tests**, with no failed,
skipped, or flaky tests. Chromium, Firefox, and WebKit exercised the production
Router and Platform through the existing local Wrangler remote Service Binding
probe. The tested pages rendered and remained usable at mobile, tablet, and
desktop sizes. No application page errors, failed requests, unexpected HTTP
errors, broken rendered images, missing fonts, hydration errors, or horizontal
overflow were found.

The recommendation remains conditional because three checks cannot be proved by
this private-host test:

1. Public apex Cloudflare route precedence must be verified during the cutover
   window after the apex catch-all is attached.
2. Real Google Tag Assistant verification requires a separately approved test on
   `lilaiireland.com` after cutover. The hostname guard was intentionally left in
   place during this run.
3. Headless WebKit on Windows did not advance plain-Tab focus from the skip link
   on the link-only Events index at desktop width. Chromium and Firefox passed;
   Safari on Apple hardware remains required to distinguish a Windows WebKit
   harness limitation from a Safari behavior issue.

No production submission, lead, email, queue job, payment, booking, deployment,
route change, WordPress write, or GAS write was performed.

## Release and runtime evidence

| Evidence | Result |
| --- | --- |
| QA branch base / tested source SHA | `1191bfe215f085bf8629030719ccc84fc251b2a0` (`origin/develop`) |
| Production release reference | PR #35 merge SHA `149184d6aae39273c5f981405ece3a684a532244` |
| Test target | `http://127.0.0.1:8791` |
| Probe upstream header | `x-lilai-runtime-probe-upstream: remote-service-binding:lilai-web-platform-router` |
| Run start | `2026-10-09T08:54:40.929Z` |
| Run duration | 465.2 seconds (7.8 minutes) |
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
trace was produced.

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

Firefox reported third-party YouTube cookie rejection messages for
`__Secure-BUCKET` and `__Secure-YEC` in the embedded player. These were retained
in diagnostics and classified as external player noise because there was no
first-party exception, failed request, or page breakage.

The homepage YouTube player requested `googleads.g.doubleclick.net/pagead/id`
and `static.doubleclick.net/instream/ad_status.js`. These are player-originated
third-party requests, not the site's Google Ads tag or consultation conversion.
No request for conversion label
`AW-17610996814/Ynp6CPHkhe4cEM74yc1B` was observed.

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
| `npx tsc --noEmit --incremental false` | PASS |
| `npx tsx scripts/check-shared-layout.ts` | PASS |
| `npx tsx scripts/check-design-system.ts` | PASS |
| `npm run check:consult` | PASS |
| `npm run build` | PASS; Next.js 16.2.10, 11 pages |
| `git diff --check` | PASS |

`npm ci` reported 16 existing audit findings (2 moderate, 13 high, 1 critical).
No dependency audit remediation was attempted because it is outside this QA
scope. Repository lint was not run because the documented `next lint` command is
known to be invalid under Next.js 16.

## Outstanding blockers and next actions

1. At the cutover window, verify actual public apex route precedence and repeat
   a concise GET/HEAD route smoke test.
2. After separately approving a public-hostname session, use Google Tag Assistant
   to verify tag initialization without submitting the production form.
3. Run plain-Tab focus checks on `/events` in Safari on Apple hardware. If focus
   still stalls after the skip link, file an accessibility bug with the retained
   WebKit annotation and reproduction steps.

With those checks scheduled, the observed production Router and Platform are
ready for a controlled cutover.
