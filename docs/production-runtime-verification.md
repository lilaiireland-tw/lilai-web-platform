# Production Runtime Integration Verification

Verification date: 2026-10-09 01:38:42 UTC

Issue: [#3](https://github.com/lilaiireland-tw/lilai-web-platform/issues/3)

Public hostname represented to the Router: `https://lilaiireland.com`

Recommendation: **NO-GO for public traffic cutover**

The private production Router and Platform successfully served the required
pages and every static dependency discovered from their HTML and CSS. The
remaining NO-GO items are SEO URL consistency, sitemap ownership, and browser
and public-route verification. No Worker, Route, DNS record, WordPress setting,
signup resource, form, lead, purchase, email, or conversion was changed during
this verification.

## Test classification

| Classification | Evidence in this run |
|---|---|
| Real deployed runtime | Local Wrangler Worker -> remote Service Binding -> deployed Router -> deployed Platform or Router origin fallback |
| Live public read-only | Existing signup Worker, WordPress `robots.txt`, sitemap index, and child sitemaps |
| Local/static | Source/config checks, TypeScript, build, policy checks, and the reusable harness itself |
| Mock | Existing `check:production-integration` and Router unit checks; useful regression coverage but not runtime proof |
| Untested | Browser rendering/hydration, Google Ads network execution, conversion delivery, and route precedence after adding the future apex catch-all |

## Exact deployed versions tested

Wrangler 4.148.0 authenticated to Cloudflare account
`622900d9297cd7c09cad966aaae64617`. Read-only `wrangler deployments list` and
`wrangler versions view` calls returned:

| Worker | Deployment ID | Active version | Traffic | Created UTC | Relevant deployed bindings |
|---|---|---|---:|---|---|
| `lilai-web-platform-production` | `13b0edfd-3b74-42b6-97db-bbf56cab5df0` | `fd23e9ca-e2a4-4324-a135-e40dab6193b1` (version 1) | 100% | 2026-10-09 01:14:57 | `ASSETS`; production deployment variables |
| `lilai-web-platform-router` | `69b8b089-bd74-4b6e-ab33-951c58fdee02` | `ce5d7b2a-8c15-4240-9076-d3a3572c07a9` (version 1) | 100% | 2026-10-09 01:15:03 | `PLATFORM` -> `lilai-web-platform-production`, environment `production` |

The Platform version reported `ASSETS`, `SITE_DEPLOYMENT_ENV=production`,
`EVENT_DEPLOYMENT_ENV=production`, `EVENTS_INCLUDE_DRAFTS=false`, and
`NEXT_PUBLIC_SITE_URL=https://lilaiireland.com`.

## How the remote runtime was reached

The isolated config at `cloudflare/runtime-probe.jsonc` defines:

```json
{
  "services": [
    {
      "binding": "ROUTER",
      "service": "lilai-web-platform-router",
      "remote": true
    }
  ]
}
```

`wrangler dev` ran the harness code locally on `127.0.0.1:8791`; its startup
inventory identified `env.ROUTER (lilai-web-platform-router)` as `remote`. It
did not use `--remote`, a tunnel, a public preview URL, or a deployed probe. The
harness accepts only GET and HEAD, reconstructs a fully qualified
`https://lilaiireland.com` request with the original path and query, calls
`env.ROUTER.fetch()`, and returns the response.

The probe adds two local evidence headers only after the binding call returns:

- `x-lilai-runtime-probe-upstream: remote-service-binding:lilai-web-platform-router`
- `x-lilai-runtime-probe-request-url: <constructed production URL>`

Every probe response also had a Cloudflare `cf-ray` ending in `DUB`. Platform
HTML included `x-powered-by: Next.js` and deployed hashed `/_next/static/*`
references. WordPress responses instead carried WordPress REST `Link` headers,
WordPress content types, and their original cache behavior. Together with the
active version and binding metadata above, this distinguishes the test from a
local Router or Platform mock.

Official behavior used by the harness:

- [Supported bindings per development mode](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)
- [Microfrontends remote Service Bindings](https://developers.cloudflare.com/workers/framework-guides/web-apps/microfrontends/#local-development)
- [HTTP Service Binding forwarding](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/http/)

Run it in two terminals:

```powershell
$env:ALLOW_REMOTE_QA = 'I_UNDERSTAND_CLOUDFLARE_USAGE'
npm run probe:production-runtime
npm run verify:production-runtime
Remove-Item Env:ALLOW_REMOTE_QA
```

These commands are explicitly authorized remote diagnostics and can consume
Cloudflare Worker request quota. Do not run them for routine QA. The verifier
can initiate many HTTP requests, and Service Bindings can add downstream Worker
invocations.

The verifier writes the complete request-level JSON evidence to the ignored
local file `.cloudflare/production-runtime-verification.json`. It exits nonzero
for connection errors, wrong status, empty assets, MIME mismatches, missing
404s, or signup query loss.

## Production Platform requests

All entries below actually entered the deployed Router through the remote
Service Binding. `Next.js`, `/_next/static/*`, the production metadata, and the
Router's deployed `PLATFORM` binding are the downstream Platform evidence.

| Requested URL | Redirect chain | Final status | Content-Type | Body bytes | Example final CF-Ray |
|---|---|---:|---|---:|---|
| `/` | none | 200 | `text/html; charset=utf-8` | 80,202 | `a479aa974dd0df59-DUB` |
| `/?utm_source=runtime-test` | none; query retained | 200 | `text/html; charset=utf-8` | 80,202 | `a479aa974c3c7dcf-DUB` |
| `/events` | none | 200 | `text/html; charset=utf-8` | 27,063 | `a479aa9758ecd091-DUB` |
| `/events/` | `308 /events` | 200 | `text/html; charset=utf-8` | 27,063 | `a479aa97bcd4be1e-DUB` |
| `/events/daydream-adventure-2027/` | `308 /events/daydream-adventure-2027` | 200 | `text/html; charset=utf-8` | 102,458 | `a479aa97ce167f54-DUB` |
| `/consult` | none | 200 | `text/html; charset=utf-8` | 39,781 | `a479aa9759d9be0c-DUB` |
| `/consult/` | `308 /consult` | 200 | `text/html; charset=utf-8` | 39,781 | `a479aa97cf6dbf50-DUB` |

HEAD `/` returned 200 with no body. HEAD
`/events/daydream-adventure-2027/` preserved the 308 slash redirect and ended at
200 with no body.

### Metadata returned by the deployed Platform

| Request | Canonical | Robots | Title | Description |
|---|---|---|---|---|
| `/` | `https://lilaiireland.com` | no explicit meta; index/follow default | 哩來愛爾蘭｜愛爾蘭留遊學代辦 在地學長姐陪你規劃語校與生活 | 哩來愛爾蘭由在愛爾蘭生活的學長姐 Alex & Arsha 創立，陪台灣人規劃愛爾蘭留遊學、語校選擇、免費出發評估、行前準備與落地生活。從台灣出發，找到適合你的愛爾蘭生活航線。 |
| `/?utm_source=runtime-test` | `https://lilaiireland.com` | no explicit meta; index/follow default | same as `/` | same as `/` |
| `/events` | `https://lilaiireland.com/events/` | `index, follow` | 活動｜哩來愛爾蘭 | 哩來愛爾蘭活動與說明會，查看即將舉辦及已結束的活動。 |
| `/events/` | `https://lilaiireland.com/events/` | `index, follow` | 活動｜哩來愛爾蘭 | 哩來愛爾蘭活動與說明會，查看即將舉辦及已結束的活動。 |
| `/events/daydream-adventure-2027/` | `https://lilaiireland.com/events/daydream-adventure-2027/` | `noindex, follow` | 白日夢冒險王｜2027 哩來愛爾蘭打工度假說明會 | 這一晚，三個角度聊一件事：怎麼把「想去」變成真的出發。 |
| `/consult` | `https://lilaiireland.com/consult/` | `index, follow` | 哩來出發計畫｜免費語校評估 - 哩來愛爾蘭｜愛爾蘭留遊學代辦，在地學長姐陪你規劃語校與生活 | 填寫免費出發評估，了解你目前的規劃階段、愛爾蘭語校與 25+8 初步方向，以及適合你的下一步。 |
| `/consult/` | `https://lilaiireland.com/consult/` | `index, follow` | same as `/consult` | same as `/consult` |

No canonical, title, or description contained `workers.dev`, `pages.dev`,
`localhost`, or `127.0.0.1`.

### Static assets

The verifier extracted dependency URLs from HTML `script`, `link`, `img`,
`source`, `video`, inline CSS, and recursively from every returned stylesheet.
It fetched every same-host dependency through the deployed Router and checked
status, nonempty body, and extension-appropriate Content-Type.

| Namespace/source | Checked | Result | Representative evidence |
|---|---:|---|---|
| `/_next/` | 18 | 18/18 nonempty 200 | CSS `1fee1cda688547bb.css`: 6,976 bytes, `text/css`; JS `webpack-750e978c640a116c.js`: 3,374 bytes, `text/javascript` |
| `/assets/` | 10 | 10/10 nonempty 200 | `lilai-logo.png`: 48,162 bytes, `image/png`; `community-walk.jpg`: 492,876 bytes, `image/jpeg` |
| `/fonts/` | 216 | 216/216 nonempty 200 | local Noto Sans/Serif subsets returned `font/woff2` |
| `/events/` | 72 | 72/72 nonempty 200 | campaign JPEG/PNG/SVG and WOFF2 dependencies returned matching MIME types |
| WordPress media referenced by `/consult` | 3 | 3/3 nonempty 200 through Router fallback | three `/wp-content/uploads/2026/07/lilai-consultation-hero-*.jpg` files |
| **Total** | **319** | **319/319 nonempty 200** | six observed MIME families: CSS, JavaScript, JPEG, PNG, SVG, WOFF2 |

Negative tests stayed with the Platform and did not fall through to WordPress:

| Request | Redirect chain | Result |
|---|---|---|
| `/_next/static/runtime-probe-missing-20261009.js` | none | 404, Next.js HTML error body, 20,225 bytes |
| `/events/runtime-probe-missing-event-20261009/` | 308 to slashless form | 404, Next.js HTML error body, 20,215 bytes |

## WordPress origin fallback

These requests entered the deployed Router through the remote binding, then
used its WordPress fallback. Status, redirects, query strings, response bodies,
and relevant headers came back without a loop or unexpected rewrite.

| Request | Redirect chain | Final status | Content-Type | Body bytes | Source evidence |
|---|---|---:|---|---:|---|
| `/about/` | none | 200 | `text/html; charset=UTF-8` | 133,446 | WP REST `Link`; `CF-Cache-Status: DYNAMIC` |
| `/wp-json/` | none | 200 | `application/json; charset=UTF-8` | 2,175,123 | WP API link; `X-Robots-Tag: noindex` |
| `/ireland-bank-account-ppsn-tax-guide/` | none | 200 | `text/html; charset=UTF-8` | 200,264 | WP post REST link and shortlink |
| `/runtime-probe-unknown-wordpress-path-20261009/` | none | 404 | `text/html; charset=UTF-8` | 117,297 | WordPress 404 retained; no soft 200 |
| `/?s=runtime-probe-no-match-20261009` | none | 200 | `text/html; charset=UTF-8` | 119,565 | original query retained |
| `/?rest_route=/wp/v2/posts&per_page=1` | none | 200 | `application/json; charset=UTF-8` | 62,824 | REST pagination link; original query retained |
| `/?feed=rss2` | `301 https://lilaiireland.com/feed/` | 200 | `application/rss+xml; charset=UTF-8` | 264,057 | normal WordPress feed redirect retained |

No test authenticated, wrote WordPress/WooCommerce data, created a session,
submitted a form, or called a payment endpoint.

## Existing signup application

These were direct public checks, because a Service Binding call to the private
Router cannot prove public Cloudflare route precedence.

| Request | Redirect chain | Final result |
|---|---|---|
| `/language-school-signup` | none | 200, HTML, 105,226 bytes |
| `/language-school-signup/` | none | 200, HTML, 105,226 bytes |
| `/language-school-signup?utm_source=runtime-test` | 301 to `/language-school-signup/?utm_source=runtime-test` | 200, HTML, 105,286 bytes; query preserved |

The HTML/CSS yielded 39 dependencies. All 39 returned nonempty 200 responses
with matching MIME types. Every dependency was scoped below
`/language-school-signup/`, including its `_next`, `fonts`, `lilai-assets`, and
favicon paths. None used the Router-owned root namespaces `/_next/`, `/assets/`,
`/fonts/`, or `/events/`, so no current static-resource namespace collision was
found.

One preliminary query check returned a redirect containing an older
`utm_source=route-audit` value. It did not reproduce: the final automated run,
two repeats of the exact query, and three unique query values all preserved the
complete query under `CF-Cache-Status: DYNAMIC`. Keep query preservation in the
cutover smoke test.

## SEO and Google Ads

The live public WordPress endpoints remain available:

| Endpoint | Status | Content-Type | Bytes |
|---|---:|---|---:|
| `/robots.txt` | 200 | `text/plain; charset=utf-8` | 322 |
| `/sitemap_index.xml` | 200 | `text/xml; charset=UTF-8` | 661 |
| `/post-sitemap.xml` | 200 | `text/xml; charset=UTF-8` | 7,864 |
| `/page-sitemap.xml` | 200 | `text/xml; charset=UTF-8` | 2,538 |

`robots.txt` advertises
`Sitemap: https://lilaiireland.com/sitemap_index.xml`. The checked sitemap index
and children contained no `/events` URL. Therefore the indexable `/events/`
page currently has no sitemap submission path. Before cutover, add the approved
indexable Platform event URLs to the WordPress-owned sitemap, or approve a
separate public Platform sitemap and submit that exact public URL in Google
Search Console. Do not submit the Daydream campaign while it emits
`noindex, follow`; its source intentionally keeps `seo.index=false` pending a
business indexing decision.

The exact Google Ads values exist in the deployed JavaScript:

- tag ID: `AW-17610996814`
- consultation conversion: `AW-17610996814/Ynp6CPHkhe4cEM74yc1B`
- deployed chunks containing the configuration:
  `/_next/static/chunks/app/layout-a35347bddbf44576.js` and
  `/_next/static/chunks/app/consult/page-59c94c22ed6f6b66.js`

The server HTML did not directly include the tag, consistent with the app's
client-side `afterInteractive` loader. Source/config checks confirm that the tag
is guarded to the exact `lilaiireland.com` browser hostname. The loopback probe
uses `127.0.0.1`, so it cannot test that guard. No browser-side Google Ads
request, Tag Assistant session, or conversion was executed, and bundle presence
must not be treated as delivery proof.

## Local and static validation

| Check | Result |
|---|---|
| `npm ci` | PASS; 628 locked packages installed |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | PASS |
| `scripts/check-shared-layout.ts` | PASS |
| `scripts/check-design-system.ts` | PASS |
| `scripts/check-production-routing.ts` | PASS |
| `scripts/check-production-router.ts` | PASS |
| `scripts/check-production-integration.ts` | PASS; mock/isolated evidence only |
| `scripts/check-production-release-strategy.ts` | PASS |
| `scripts/check-consult.ts` | PASS; Ads conversion behavior is mocked and no live conversion was sent |
| `npm run build` | PASS with Next.js 16.2.10 |
| Runtime probe Wrangler dry-run | PASS; 1.54 KiB upload package and expected `ROUTER` binding; no deploy |
| `git diff --check` | PASS |
| `npm run cf:build:production-platform` | FAIL in this Windows environment under Node 24.13.1; OpenNext warned Windows is not fully compatible and its child process exited `3221226505` |
| `scripts/check-production-packaging.ts` | Router dry-run PASS; Platform dry-run not runnable afterward because the failed OpenNext build did not create `.open-next/assets` |

The OpenNext local build limitation does not replace or weaken the real runtime
result: the already-deployed version listed above was reached and served its
actual assets. Re-run the production OpenNext build and packaging checks on the
project's supported Node 22 CI/WSL runner before merging or releasing. The known
invalid `next lint` script was not run or changed.

## Findings and release decision

### Passed

- Remote Service Binding authentication and connection to the deployed Router.
- Router-to-Platform invocation for all required pages and HEAD checks.
- Query preservation for the Platform homepage.
- 319 extracted production dependencies, including JS, CSS, images, and fonts.
- Platform 404 ownership for a missing Next asset and nonexistent event.
- WordPress fallback for content, REST, search, feed, and a true unknown 404.
- Existing signup HTML and 39 dependencies through current public routes.
- Public WordPress robots and sitemap availability.
- Exact Google Ads tag and consultation conversion identifiers in deployed JS.

### Cutover blockers

1. **Canonical/trailing-slash mismatch.** `/events/`, the Daydream slash URL,
   and `/consult/` 308 to slashless URLs, while the returned canonicals point
   back to the trailing-slash forms. The canonical URLs therefore redirect
   instead of returning 200 directly. Choose one URL form and make redirects,
   canonicals, internal links, and sitemap entries agree before cutover.
2. **No event sitemap submission path.** The WordPress sitemap currently owns
   discovery and contains no `/events` URL. The indexable events index needs an
   approved sitemap owner and Search Console submission plan.
3. **Browser verification remains open.** Run 375px and 1440px checks for the
   homepage, consult, events, signup, and representative WordPress pages:
   overflow, sticky shell, focus-visible, navigation, redirects, asset errors,
   console errors, and hydration errors.
4. **Google Ads production-host runtime remains open.** After the production
   hostname can safely reach the Platform, use Tag Assistant to confirm the tag
   initializes once with `AW-17610996814`. Do not submit the consult form or
   fire the conversion during verification.
5. **Future public route precedence remains unproven.** The current public
   signup behavior is healthy, but this task did not attach
   `lilaiireland.com/*` to the Router. Recheck signup, WordPress fallback,
   assets, and route winner evidence immediately during an approved cutover
   window, with rollback ready.

The deployed private integration itself is ready: Router -> Platform and Router
-> WordPress fallback both worked. Public traffic cutover remains **NO-GO** until
the five items above have accepted evidence. This task did not perform or
authorize the cutover.
