# Cloudflare staging and path routing plan (Issue #3)

Status: phase-one plan from PR #18, followed by the staging implementation in
[Staging provisioning](cloudflare-staging.md). No live deployment, Worker route,
DNS, origin, or production traffic changes have been made.
This is the phase-one ownership plan; the broader migration ideas in
`route-preservation-plan.md` are future work, not permission to migrate routes now.

## Environments and release responsibility

| Source | Environment | URL / responsibility | Indexing |
| --- | --- | --- | --- |
| Feature branch / PR | Preview | Isolated provider-issued URL, recorded on the PR; no public-domain routes | noindex |
| `develop` | Staging | Dedicated staging Worker and hostname; actual URL must be recorded after provisioning | noindex |
| `main` | Production | `https://lilaiireland.com`; release artifact only until a separately approved cutover | production policy |

Read-only account/zone/subdomain discovery is recorded in the staging runbook.
There is still no provisioned or verified staging URL. Provisioning remains
blocked on nonproduction origins, CI credentials and Access setup. Use the
dedicated staging Worker's issued `workers.dev` URL initially; any custom staging
hostname must be outside the production hostname's route patterns. Record the
exact staging URL, account/zone IDs, Worker IDs, and Git SHA in the release record.
Staging does not attach to `lilaiireland.com` or `www.lilaiireland.com`.

Use separate Workers, environment bindings, build variables, and secrets for
preview/staging/production. Staging must use a nonproduction CMS or read-only
fixture and sandbox service integrations. Never reuse production form/email,
Queue, database, payment, or signup credentials. Protect review environments with
Access when provisioned; retain noindex on the underlying provider URL too.

The staging follow-up adds Wrangler, OpenNext and a gated `develop` workflow;
see the staging runbook for its build and runtime verification. The Next.js App
Router is retained. A plain `next build` is not a deployable Cloudflare Worker by itself.
Neither a push to `develop` nor a merge to `main` authorizes traffic changes.

## Route ownership

“WordPress” means the existing proxied origin handling, not redirecting users to
the CMS hostname. Only an explicit migrated-path allowlist may reach Next.js.

| Public pattern (including bare path, trailing slash, query) | Before cutover | After approved phase-one cutover |
| --- | --- | --- |
| `/` | Existing homepage owner; verify zone snapshot | New web platform |
| `/events`, `/events/*` (pages and same-prefix static assets) | Verify live owner and inventory legacy URLs; no traffic change in this PR | `lilai-web-platform`, using the same deployment as the homepage |
| `/language-school-signup`, `/language-school-signup/*` | Current signup app | Current signup app; preserve route/script IDs and API/asset paths |
| `/readiness`, `/readiness/*` | Existing WordPress embedded form | WordPress until readiness migration approval, then new web platform |
| `/_next/*`, homepage-owned `/assets/*`, `/fonts/*` | Existing owner | New web platform only after asset namespace conflict audit |
| `/about/`, `/consult/`, all other existing pages and flat article permalinks | WordPress | WordPress |
| `/category/*`, `/tag/*`, existing pagination/feed/search URLs | WordPress | WordPress |
| `/shop`, `/cart`, `/checkout`, `/my-account` and descendants; `/product/*`, product categories, Woo query endpoints | WordPress/WooCommerce | WordPress/WooCommerce |
| `/wp-admin` and descendants, `/wp-login.php`, `/wp-json` and descendants | WordPress | WordPress |
| `/wp-content/*`, `/wp-includes/*`, other WordPress PHP/system paths | WordPress | WordPress |
| `/robots.txt`, `/sitemap.xml`, `/sitemap_index.xml`, WordPress child sitemaps | WordPress | WordPress until separate SEO ownership reconciliation |
| `/api/revalidate`, `/design-system/*`, other platform-only review/internal routes | No new production exposure | No new production exposure in phase one |
| All other paths not explicitly migrated | Existing owner / WordPress | Existing owner / WordPress |
| Unknown URLs outside migrated prefixes | Existing WordPress status/redirect behavior | Same WordPress behavior, including real 404s |

Issue #10's [event architecture](events.md) owns `/events/`,
`/events/daydream-adventure-2027/`, and future `/events/<campaign-slug>/` pages.
The whole `/events/` prefix includes campaign images and other static assets from
`public/events/<slug>/`; do not allow only individual HTML routes. All events use
the same `lilai-web-platform` deployment and PR -> develop -> staging -> main ->
Cloudflare production flow, with no per-campaign Worker, DNS or pipeline.
Unknown event slugs and missing event assets remain platform-owned 404s, not
WordPress fallback. Before cutover, inventory any legacy WordPress `/events` or
`/events/*` URLs and resolve each content, redirect and asset collision explicitly;
unresolved collisions block cutover, not ownership of the entire event prefix.

The Next.js catch-all renders CMS content on a standalone app preview; that does
not grant it production route ownership. Keep public permalinks, slash redirects,
status codes, query strings, cookies, and existing index/noindex rules unchanged.
Inventory signup dependencies outside its prefix before considering interception.
Retain existing `www` redirect behavior; do not add a wildcard-host Worker route.

## Worker priority and conflict check

Cloudflare selects the most specific matching route; route patterns match query
strings too, so an exact root pattern alone misses `/?utm_source=...`. Paths are
case sensitive. A no-script route can negate a broader route. See
[Cloudflare route rules](https://developers.cloudflare.com/workers/configuration/routing/routes/).

For a future root and events cutover, a routing Worker may need
`lilaiireland.com/*` to catch root queries. Such a route is **not to be installed
now**. Its handler must parse
the pathname and allow `/`, exact `/events`, every pathname starting with
`/events/` (including static assets), and audited shared platform asset paths;
query strings must not change ownership. Do not match `/events-other` as an event.
Forward these allowed requests to the same `lilai-web-platform` deployment;
all other requests pass through to the original WordPress origin. Existing signup
routes must remain more specific and mapped to the current signup Worker. Verify
both the bare signup path and descendants; `/language-school-signup/*` alone does
not protect the bare path. Do not use `/language-school-signup*` without checking
unintended matches such as `/language-school-signup-other`. Readiness remains
outside the allowlist until migration. No CMS redirect, blanket Next.js fallback,
or new production apex Custom Domain should replace this origin-backed model.

Before any route edit:

1. Export the complete zone route table with a read-only
   `GET /zones/{zone_id}/workers/routes` using the Cloudflare API, or download it
   from the dashboard. Save patterns, script IDs (including no-script entries),
   Custom Domains, DNS origin, redirect/transform/origin/cache rules, and deployed
   version IDs in an operator-controlled release record. Never commit credentials.
2. Compare the proposed routes with **all** existing patterns, including schemes,
   wildcard hosts, bare paths, slash forms and query variants. List every overlap
   and its intended winner. Reject unexpected overlaps rather than relying on
   creation order. Check Custom Domains separately from Worker routes.
3. Evaluate `/`, `/?utm_source=smoke`, signup bare/slash/child/query, readiness
   bare/slash/query, `/events`, `/events/`, the Daydream page and same-prefix assets
   with/without query strings, unknown event slugs/missing assets, and a negative
   prefix-boundary probe such as `/events-other`. Inventory legacy WordPress event
   URLs and compare them with the platform registry and `public/events/` assets;
   document and approve each collision's handling before cutover. Include a real
   post, admin/login, REST, media, Woo and unknown paths outside migrated prefixes.
   On an isolated staging router, record actual Worker/origin logs proving each
   winner. A 200 response alone does not prove route ownership.
4. Diff the complete proposed table against the saved table. Obtain independent
   review; the signup mapping and system route behavior must be unchanged.

This process is a documented conflict check, not a claim that the live account
has been audited. The live route export and existing signup Worker configuration
are still required inputs.

## WordPress origin and fallback

Repository defaults use `https://cms.lilaiireland.com` for `WORDPRESS_ORIGIN` and
CMS API bases. This is source configuration, not verification of live DNS/TLS or
reachability. Confirm its origin target and certificate before deployment. Never
set a fallback target to the routed public hostname in a way that re-enters the
router. Preserve the original request method/body/query, Host/TLS requirements,
cookies, Location headers, and cache policy. Public responses must not leak the
CMS hostname in redirects, HTML links, or canonical URLs.

For nonmigrated paths, bypass Next.js and preserve WordPress responses unchanged;
do not turn origin 404/401/403 into homepage 200s. Bypass caching for admin, auth,
REST writes, Woo sessions and form endpoints. Do not retry writes. For a migrated
homepage outage, use the rollback procedure; do not silently cache an error or
automatically replay requests to a second service. A controlled GET-only homepage
fallback can be considered later after its origin behavior is demonstrated.

## Environment and secret contract

| Variable / binding | Rule |
| --- | --- |
| `SITE_DEPLOYMENT_ENV` | Build-time `preview`, `staging`, or `production`; only exact `production` enables indexing; unset/invalid values fail closed |
| `NEXT_PUBLIC_SITE_URL` | Compatibility entry fixed to `https://lilaiireland.com`; application canonical source is pinned to that public URL, never the serving hostname |
| `EVENT_DEPLOYMENT_ENV` | Existing event build policy; set preview for nonproduction and production only with a production site build |
| `EVENTS_INCLUDE_DRAFTS` | false by default; production must remain false |
| `WORDPRESS_ORIGIN`, `WORDPRESS_API_BASE`, `WOOCOMMERCE_STORE_API_BASE` | Server-only per-environment nonsecret URLs; staging uses fixture/nonproduction origins |
| `REVALIDATE_SECRET` | Distinct secret per environment; never `NEXT_PUBLIC_*`, committed values, or build log output |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID` | Operator/CI configuration; token secret with minimal permissions for the task; IDs are not secrets |

Use uppercase snake case with stable logical binding names across environments;
isolate their values/resources rather than sharing production credentials.
Cloudflare vars/bindings must be declared per environment, and secrets supplied
separately; see [environment configuration](https://developers.cloudflare.com/workers/wrangler/environments/).
Build policy changes require rebuilding: do not promote a staging artifact to
production by changing only runtime variables. Do not promote a production
artifact to a publicly accessible preview.

The build/CI mismatch guard requires the site and event
production markers to agree before staging or production deployment. Staging uses
`SITE_DEPLOYMENT_ENV=staging` and `EVENT_DEPLOYMENT_ENV=preview`; production requires
both markers to be `production`. The separate policies are retained; the guard
runs when Next configuration loads, including direct `next build` invocations.

The app now emits noindex headers and inherited root metadata, disallows crawling
in robots, and produces an empty sitemap outside production. Child metadata may
override inherited metadata, so the global header is the additional enforcement.
Known Next external rewrites can drop configured headers: the future staging edge
must apply `X-Robots-Tag: noindex, nofollow` to **all** responses, including origin
responses, errors, redirects and assets. Verify this on the wire before publishing
staging. Robots disallow alone is not a noindex guarantee. Production retains
existing route-specific noindex declarations. WordPress-owned sitemap/robots are
not replaced in phase one; keep their public-domain canonical URLs.

## Health and smoke checks

Run `npx tsx scripts/check-deployment-policy.ts` for isolated policy regressions.
Against a local or provisioned standalone platform build:

```powershell
$env:CHECK_BASE_URL = '<actual local or staging URL>'
$env:CHECK_DEPLOYMENT_ENV = 'staging'
npx tsx scripts/check-deployment-smoke.ts
```

For an approved production candidate, use `CHECK_DEPLOYMENT_ENV=production`.
The checker only GETs `/`, `/?utm_source=smoke`, `/robots.txt`, `/sitemap.xml`,
without following redirects; it validates homepage health, canonical origin,
indexing signals and sitemap hosts. It does not submit forms or verify the edge
ownership matrix. It must fail when Access hides the app; authenticate separately
or run on a private candidate endpoint rather than treating a login page as health.

Before production cutover, test an isolated router mirroring the intended route
table with the following read-only matrix and saved expected statuses/owners from
the current site. Supply actual media and signup child/API asset URLs from the
inventory, not invented fixture paths:

| Check | Required evidence |
| --- | --- |
| Root with/without query | 200, platform owner, public canonical, shell/assets load |
| `/events`, `/events/`, `/events/daydream-adventure-2027/`, with/without query | Platform owner through any slash redirect; index/campaign render, public canonical, correct environment and event index/noindex policy |
| Real `/events/daydream-adventure-2027/*` assets, with/without query | Same platform deployment; 200, expected image Content-Type/bytes and cache policy; include `/events/daydream-adventure-2027/arsha.webp` and the full asset inventory |
| Unknown event slug / missing event asset | Platform owner and real 404; no WordPress fallback |
| Inventoried legacy WordPress event URLs | Approved per-URL content/redirect/status outcomes; all collisions resolved before cutover |
| Prefix boundary outside `/events/` (for example `/events-other`) | Existing owner/status; event allowlist must not intercept it |
| Signup bare/slash/child/query and dependencies | Existing signup owner/status; assets render; no form submission |
| Readiness before migration | Existing WordPress embed and behavior |
| Real post/page/category/tag URLs | WordPress owner and same statuses/canonical/redirects |
| `/wp-admin/`, `/wp-login.php` | Same unauthenticated login/redirect behavior; do not authenticate or submit |
| `/wp-json/` and real `/wp-content/uploads/` media | Same owner, content type/status; no writes |
| Woo shop/cart/checkout/account | Same unauthenticated behavior and cookie/cache rules; no checkout or cart changes |
| Robots and existing sitemap index/children | WordPress owner, public hosts only, same index/noindex policy |
| Unknown path outside migrated prefixes | Existing WordPress 404/status behavior; never homepage substitution |

Record status, Location, Content-Type, X-Robots-Tag, canonical, owner logs, errors
and latency for every case. Browser QA still required at 375px and 1440px: overflow,
sticky shell, focus-visible/navigation, asset requests, console/hydration errors,
and event index/Daydream images and CTA destinations plus signup/readiness rendering
without submissions. The existing `check:urls`
accepts any 2xx/3xx, so it is not sufficient cutover evidence.

## Rollback procedure (future cutover only)

1. Before release, save the complete route/origin/rule snapshot above and known-good
   router/platform version IDs, timestamp, Git SHA, and operator. Demonstrate the
   old WordPress homepage remains reachable through the original origin path.
2. Trigger rollback for wrong event/signup/system owner, unexpected 4xx/5xx,
   origin loops, broken assets/forms, CMS URL leaks, or incorrect canonical/indexing signals.
   Freeze deployments; record symptoms and the current route/version table.
3. For a router code regression, restore the known-good router version. To undo
   path migration, restore the saved route/script assignments and original origin
   configuration exactly (including prior broad routes). Remove only routes added
   for this release; preserve the signup Worker and all prior bypasses. Do not
   blindly delete a catch-all that previously existed.
4. Restore platform version if needed. Worker version rollback alone does not
   restore external route/configuration/resource changes; see
   [Cloudflare rollback limits](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).
   No data migrations are part of this issue.
5. Purge only affected public homepage/event/asset cache entries when necessary; never
   purge/replay transactional requests. Repeat the read-only matrix and confirm
   homepage and event pages/assets return to their saved owners while signup,
   posts, admin, REST/media and Woo remain intact. Record results and stop further
   releases pending review.

## Outstanding release gates

- Provisioned and verified staging URL/Worker (account and zone were discovered).
- Live route/rule/DNS export, signup dependency inventory and verified CMS origin.
- Legacy WordPress event URL/asset inventory and approved collision resolutions.
- Provisioned isolated staging runtime and nonproduction integration credentials.
- Configure the gated staging CI environment with nonproduction origins and credentials.
- Edge-wide noindex verification, route-winner evidence and full smoke/browser QA.
- Separately reviewed implementation of the router/adapter and explicit production
  cutover authorization. Readiness migration has its own acceptance gate.

Until these are supplied and verified, use **Part of #3**, not a completion claim.
