# Production routing and WordPress origin readiness (Issue #3)

Status: **NO-GO for production cutover**. This document records read-only evidence
and the recommended phase-one architecture. It does not authorize a DNS, Worker
route, WordPress, WooCommerce, custom-domain, or production deployment change.

## Decision summary

The current WordPress.com site can coexist with the new platform under the public
hostname by using a Cloudflare **Workers Route**, not an apex Worker Custom Domain.
The recommended front door is one small router on `lilaiireland.com/*`. It sends
only `/`, `/events`, `/events/*`, and the platform's audited static namespaces to
a private production platform Worker through a Service Binding. Every other
request is passed through to the existing DNS origin with `fetch(request)`.

A separate WordPress hostname is not required for this route-based pass-through:
Cloudflare Workers Routes are designed to sit in front of an existing origin, and
`fetch(request)` continues to that origin. A distinct, non-routed CMS hostname
would be required for direct CMS API/rewrite calls by the platform, but the
repository's proposed `cms.lilaiireland.com` hostname is not available today.

This design is not ready to release. The Cloudflare DNS origin record, SSL mode,
origin/rules configuration, WordPress.com support position, WooCommerce sessions,
and a few SEO/release decisions still lack evidence. Failing closed here protects
the existing site and checkout.

## Evidence collected

The following checks were performed read-only on 2026-10-08. No production
configuration or request with a mutating method was sent.

| Fact | Evidence | Confidence |
| --- | --- | --- |
| Zone is active | Cloudflare API returned zone `lilaiireland.com` (`2cabb0ba90198b8d4a88a58e5bc6c757`) | verified |
| Signup routes | Current route API returned `lilaiireland.com/language-school-signup` and `lilaiireland.com/language-school-signup/*`, both mapped to `site-creator-vinext-starter` | verified |
| Existing exclusion | Current route API returned `*.lilaiireland.com/*` with no script | verified |
| No apex catch-all | No `lilaiireland.com/*` route was present | verified |
| Worker Custom Domains | Account API returned no Worker Custom Domain in this zone | verified |
| Public apex | `GET https://lilaiireland.com/` returned `200`, `host-header: WordPress.com`, public canonical `https://lilaiireland.com/` | verified |
| `www` behavior | `https://www.lilaiireland.com/` returned `301` to the apex | verified |
| CMS hostname | Public DNS returned NXDOMAIN and HTTPS could not resolve `cms.lilaiireland.com` | verified unavailable |
| WordPress system routes | `/wp-json/` returned `200`; `/wp-admin/` returned `302` to the public-domain login path; `/wp-login.php` returned the current WordPress.com SSO redirect | verified unauthenticated behavior |
| Woo routes | `/shop/`, `/cart/`, `/my-account/` returned `200`; empty checkout redirected to `/cart/`; an unknown product returned WordPress `404` | verified read-only behavior only |
| Events before cutover | `/events`, `/events/`, the Daydream path, and an unknown event path all returned WordPress `404` | verified |
| Asset collision sample | `/_next/static/route-audit.js`, `/assets/lilai-logo.png`, and `/fonts/route-audit.woff2` returned `404`; current sitemap children contained no event URL | verified samples, not a complete inventory |
| Unknown fallback | A random path returned the existing WordPress `404`, not a homepage `200` | verified |
| SSL mode, DNS target, rules | The available OAuth session could read Worker routes but received `403` for DNS records, SSL mode, Rulesets, and Page Rules | unverified blocker |

The public apex resolves to Cloudflare anycast addresses, so public DNS cannot
reveal the configured WordPress origin target. The WordPress response headers are
strong evidence that the current request reaches WordPress.com, but they do not
prove the origin DNS value, Cloudflare-to-origin TLS mode, or rule ordering.

WordPress.com currently [recommends disabling the Cloudflare proxy](https://wordpress.com/support/cloudflare-dns/)
and using Full or Full (Strict) SSL when Cloudflare is used. The current proxied
site works publicly, but production routing and WooCommerce should receive an
explicit WordPress.com support confirmation rather than treating today's behavior
as a hosting guarantee.

## Route ownership contract

Query strings do not normally change the path owner. The exceptions below reserve
WordPress and WooCommerce query endpoints before the platform allowlist is tested.

| Public request | Intended owner after phase-one cutover | Required handling |
| --- | --- | --- |
| `/`, `/?utm_...` | platform | router -> platform Service Binding |
| `/events`, `/events/`, `/events/*` | platform | router -> platform; unknown slugs/assets stay platform `404` |
| `/_next/*`, `/assets/*`, `/fonts/*` | platform | router -> same platform deployment; only after complete collision inventory |
| `/language-school-signup` | existing signup Worker | existing exact route, unchanged |
| `/language-school-signup/`, descendants, and their queries | existing signup Worker | existing wildcard route, unchanged |
| `/language-school-signup?query` | signup flow via current WordPress slash redirect | exact route does not match a query; router must origin-pass-through and preserve the current `301` to the slash URL, which then reaches signup |
| `/language-school-signup-other` | WordPress | prefix boundary; never signup or platform |
| `/?wc-ajax=`, `/?wc-api=`, `/?add-to-cart=` | WordPress/WooCommerce | origin pass-through; do not cache or replay |
| `/?rest_route=`, `/?p=`, `/?page_id=`, `/?preview=`, `/?s=`, `/?feed=` | WordPress | origin pass-through |
| `/wp-admin`, `/wp-login.php`, `/wp-json`, `/wp-content`, `/wp-includes` and descendants | WordPress | origin pass-through with original method/body/query/cookies |
| `/shop`, `/cart`, `/checkout`, `/my-account`, `/product`, product categories, `/wc-api` and descendants | WordPress/WooCommerce | origin pass-through, never edge-cache dynamic/session responses |
| `/robots.txt`, `/sitemap.xml`, `/sitemap_index.xml`, child sitemaps | WordPress in phase one | preserve public canonical/indexing behavior |
| all other known and unknown paths | WordPress | preserve status, redirects, body, cookies and headers; real `404`s remain `404`s |

The policy is encoded in `cloudflare/production-routing-policy.ts` and checked by
`npm run check:production-routing`. It is a design contract, not a deployed
production router.

The same checker can validate a saved Cloudflare API route response without
credentials or network access:

```powershell
$env:CHECK_ROUTE_SNAPSHOT_PATH = '<private route-export JSON path>'
npm run check:production-routing
```

It rejects missing/remapped signup routes, extra signup overlaps, an unexpected
apex catch-all owner, duplicate patterns, and any production route referencing a
staging Worker. Keep live exports in the operator release record, not the repo.

## Exact future Cloudflare route change

Keep the current route table entries byte-for-byte:

```text
*.lilaiireland.com/*                              -> no script
lilaiireland.com/language-school-signup           -> site-creator-vinext-starter
lilaiireland.com/language-school-signup/*         -> site-creator-vinext-starter
```

After all gates pass and a separate cutover is approved, add only:

```text
lilaiireland.com/*                                -> lilai-web-platform-router
```

Cloudflare route matching includes query strings, and the most specific pattern
wins. The catch-all is needed so `/?utm_source=...` reaches the new homepage.
The existing signup patterns remain more specific. The bare signup query edge
case reaches the router and must be origin-passed as described above. See
[Workers route matching](https://developers.cloudflare.com/workers/configuration/routing/routes/).

Do not attach a Worker Custom Domain to `lilaiireland.com`: a Custom Domain makes
the Worker the origin and does not preserve the existing WordPress origin model.
Do not add separate direct `/events*` patterns; `/events*` would also match
`/events-other`, while `/events/*` alone would miss the bare path and its query
forms.

## Router and origin requirements

The future router should be a separate, small Worker with no static assets and no
business data. The production OpenNext Worker should have no public route or
`workers.dev` URL and should be reached through a Service Binding. Cloudflare
documents forwarding the original request with
[Service Binding `fetch()`](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/http/).

For WordPress fallback, return `fetch(request)` directly. Cloudflare documents
Routes as the choice when an external origin sits behind a Worker and shows
`fetch(request)` as normal origin processing. Do not rewrite the hostname to
`lilaiireland.com`, call a same-zone Worker route, follow redirects inside the
Worker, buffer response bodies, or use `passThroughOnException()` as general
error handling. Those variants add loop, memory, and behavior-change risk.

Forward the original request object so method, body, query, `Cookie`, `Origin`,
and conditional headers remain intact. Return the origin response without
rebuilding it so `Set-Cookie`, `Location`, status, streaming, and cache directives
remain intact. The router must not retry non-idempotent requests.

WordPress/WooCommerce responses should not be cached by router code. Audit zone
cache rules for bypasses covering logged-in cookies, WooCommerce session/cart
cookies, admin/login, REST writes, cart, checkout, account, payment callbacks,
`wc-ajax`, `wc-api`, and `add-to-cart`. WooCommerce's
[cache guidance](https://developer.woocommerce.com/docs/best-practices/performance/configuring-caching-plugins/)
requires cart, checkout, and account to remain dynamic and calls out session and
cart cookies.

## WordPress origin compatibility assessment

### DNS, TLS, and Host

- `cms.lilaiireland.com` cannot be used: it does not resolve and therefore has no
  reachable TLS endpoint.
- Phase one should retain the current apex DNS origin record and public Host
  header. The router's origin pass-through avoids a second hostname and a proxy
  loop.
- An operator with DNS Read must record the apex and `www` DNS record types,
  targets, proxy state, and modification timestamps. Do not change them.
- Cloudflare SSL/TLS mode must be Full (Strict) if the current WordPress origin
  presents a valid certificate for the public hostname. Record the origin
  certificate/SNI result. Flexible mode is a cutover blocker because it can cause
  HTTPS redirect loops and weakens origin transport.
- If later platform code needs direct WordPress REST/media access, first provision
  a WordPress.com-supported origin hostname with DNS, certificate, and Host/SNI
  behavior verified. Never point that hostname back through the apex router.

### Cookies, login, redirects, and payments

The transparent fallback design is compatible in principle because the browser
continues to see `lilaiireland.com` and the router does not alter cookies or
redirects. It is not proven compatible until tests record:

- unchanged `Set-Cookie` names, Domain, Path, Secure, HttpOnly, and SameSite;
- WordPress.com SSO login, logout, preview, password reset, and authenticated
  `/wp-admin/` behavior with an approved test account;
- cart persistence across navigation and a new browser session;
- checkout redirects, CSRF/nonces, `wc-ajax`, Store API, payment return/webhook
  paths, account/orders/downloads, currency and shipping behavior;
- no HTML cache for authenticated or Woo session requests;
- original public-domain `Location` and canonical values with no CMS hostname leak.

No login, cart, checkout, payment, form, or webhook mutation was performed in this
task. Those checks require an approved nonproduction clone or an explicitly
authorized controlled production QA window.

### REST, media, robots, sitemap, and canonicals

`/wp-json/` and public WordPress pages currently respond, and the new homepage and
event metadata use `https://lilaiireland.com` canonicals. Phase one leaves
WordPress in control of REST, uploads, robots, and sitemaps. This avoids replacing
WordPress sitemap behavior with the application's broader sitemap implementation.

The current WordPress sitemaps contain the homepage but no `/events` URL. Before
cutover, choose and verify one of these separately reviewed SEO outcomes:

1. add the indexable event URLs to the WordPress-owned sitemap without duplicating
   the homepage; or
2. approve temporary sitemap omission with an explicit owner/date for follow-up.

All sitemap locations, canonicals, Open Graph URLs, and redirects must remain on
`https://lilaiireland.com`. Production responses must not contain `workers.dev`
or `cms.lilaiireland.com`. WordPress `404`s must not become soft-404 homepage
responses.

## Required read-only verification

Use a token with only the necessary read permissions. Keep it in the protected
shell; never commit it or paste it into an issue/PR. The following calls do not
change state:

```powershell
$headers = @{ Authorization = "Bearer $env:CLOUDFLARE_API_TOKEN" }
$zone = '2cabb0ba90198b8d4a88a58e5bc6c757'
$account = '622900d9297cd7c09cad966aaae64617'

Invoke-RestMethod -Headers $headers `
  "https://api.cloudflare.com/client/v4/zones/$zone/workers/routes"
Invoke-RestMethod -Headers $headers `
  "https://api.cloudflare.com/client/v4/zones/$zone/dns_records?per_page=500"
Invoke-RestMethod -Headers $headers `
  "https://api.cloudflare.com/client/v4/accounts/$account/workers/domains"
Invoke-RestMethod -Headers $headers `
  "https://api.cloudflare.com/client/v4/zones/$zone/settings/ssl"
Invoke-RestMethod -Headers $headers `
  "https://api.cloudflare.com/client/v4/zones/$zone/rulesets"
Invoke-RestMethod -Headers $headers `
  "https://api.cloudflare.com/client/v4/zones/$zone/pagerules?status=active&per_page=100"
```

In Cloudflare Dashboard, independently inspect and export:

- **DNS > Records**: apex, `www`, and any proposed origin hostname;
- **SSL/TLS > Overview** and origin certificate/SNI status;
- **Workers & Pages > Routes** and every Worker Custom Domain;
- **Rules**: Redirect, Transform, Origin, Cache, Configuration, Page Rules, and
  Cloudflare Trace results for representative platform, signup, and WordPress URLs;
- **Caching**: bypass behavior for login, REST writes, Woo pages/query endpoints,
  and session cookies.

In WordPress.com/WooCommerce, record without changing settings:

- primary domain, HTTPS/certificate status, WordPress.com site address, and a
  support answer approving this proxied Workers Route pattern;
- permalink/trailing-slash policy, Rank Math/SEO sitemap ownership, canonical and
  redirect settings;
- actual Shop, Cart, Checkout, My Account, payment gateway callback/webhook,
  Store API, and Woo endpoint URLs;
- cache/CDN behavior and all relevant session/auth cookie names.

## Cutover plan (future approval only)

1. Save the full route, DNS, Worker Custom Domain, ruleset/Page Rule, SSL, cache,
   and current Worker version/deployment snapshot. Record Git SHA, UTC timestamp,
   operator, and screenshot/API artifact locations outside the repository.
2. Resolve every blocker below and obtain WordPress/WooCommerce and independent
   route-table approval. Freeze unrelated Cloudflare changes for the window.
3. Implement and review the minimal router from the checked policy. Add runtime
   tests with mock platform and origin services proving body/cookie/redirect/status
   transparency, query endpoint exclusions, streaming, and no write retries.
4. Build the production platform with both deployment markers set to production,
   drafts off, canonical fixed to the public origin, observability enabled, and
   no public URL/route. Deploy it only after separate approval.
5. Deploy the router with its platform Service Binding but no public URL/route.
   Record both known-good version IDs. Verify the production candidate using an
   isolated, nonproduction routing harness and the complete matrix below.
6. Re-export the live route table immediately before cutover. Abort unless the two
   signup mappings and no-script exclusion exactly match the saved baseline and
   no unexpected route/custom-domain overlap exists.
7. During the approved window, add the single `lilaiireland.com/*` router route.
   Do not edit DNS or either signup route. Run smoke tests immediately and monitor
   router/platform/origin logs for owner, 4xx/5xx, loops, latency, and CMS leaks.
8. Stop for review. Do not merge to `main` or automate future production deploys
   until the first release evidence is accepted.

## Pre-cutover and post-cutover smoke matrix

Use GET/HEAD unless an explicitly approved nonproduction transactional test says
otherwise. Record owner evidence from logs in addition to status/header output.

- `/` with no query, UTM query, and `_rsc` query: platform `200`, public canonical.
- Root WordPress/Woo query endpoints: WordPress behavior, never platform.
- `/events`, slash form, Daydream, all real images/fonts, query variants: platform.
- unknown event slug and missing event asset: platform `404`.
- `/events-other`: unchanged WordPress status.
- signup bare, slash, child, and query variants: current Worker/redirect behavior;
  verify application chunks/API dependencies and never submit the form.
- real page, post, category, tag, feed, search, plain permalink, preview redirect:
  unchanged WordPress status/canonical/redirect behavior.
- `/wp-admin/`, `/wp-login.php`, `/wp-json/`, a real upload: unchanged behavior.
- shop/cart/checkout/account/product and real Woo query endpoints: unchanged
  headers, cookies and cache status; no checkout or payment submission.
- robots, sitemap index and all child sitemaps: WordPress owner and public hosts.
- random unknown path: WordPress's real `404`.
- `www` variants: retain the current apex redirect and never attach wildcard host
  routing accidentally.

Browser QA remains required at 375px and 1440px for the new homepage/events and
the existing signup/WordPress/Woo flows: overflow, sticky shell, focus-visible,
assets, navigation, console/hydration errors, redirects, cookies and cache status.

## Rollback

Rollback is one route removal/restoration, not a DNS migration:

1. Trigger rollback on any wrong owner, signup regression, origin loop, unexpected
   4xx/5xx, broken Woo/login/session/payment callback, CMS hostname leak, incorrect
   canonical/indexing signal, or sustained latency/error threshold.
2. Freeze deployments and save current route/version/log evidence.
3. Restore the saved route table exactly by removing only the newly added
   `lilaiireland.com/* -> lilai-web-platform-router` entry. Do not edit/delete the
   two signup routes or the pre-existing no-script exclusion.
4. If necessary, restore the recorded router/platform versions, remembering that
   Worker version rollback does not restore routes, DNS, rules, or external data.
5. Purge only affected public homepage/event/static cache keys if required. Never
   purge or replay transactional requests.
6. Repeat the entire read-only matrix and confirm WordPress again owns the root,
   events return their saved pre-cutover behavior, signup remains on its Worker,
   and WordPress/Woo system routes match the baseline. Keep production changes
   frozen pending incident review.

## Outstanding release blockers

- DNS Read export of the apex/`www` records and proof of the actual WordPress.com
  origin target; the current credential cannot supply it.
- Verified Full (Strict) Cloudflare-to-origin TLS, certificate/SNI, and no redirect
  loop; current SSL settings were permission-blocked.
- Full Redirect/Transform/Origin/Cache/Page Rule export and Cloudflare Trace;
  current rules access was permission-blocked.
- Written WordPress.com support confirmation for the proxied Workers Route design.
- Complete static namespace and legacy `/events` collision/link inventory. Public
  samples and sitemaps found none, but that is not a complete backlink/GSC audit.
- Signup dependency inventory and approval of the bare-query redirect contract.
- Approved Woo/auth/payment nonproduction test plan and evidence for sessions,
  cookies, cache bypass, callbacks and redirects.
- Decision on adding indexable event URLs to the WordPress-owned sitemap.
- Implemented, reviewed, runtime-tested production router and private production
  platform Worker; neither is created by this task.
- Isolated full routing rehearsal, route-owner logs, browser QA, rollback drill,
  and separate production cutover approval.

Until every critical item has evidence, the recommendation remains **NO-GO** and
the work should continue to reference **Part of #3**.
