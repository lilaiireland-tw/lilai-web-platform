# Production static asset routing audit

Audit scope: repository-owned assets, the production route policy, previous
read-only public samples recorded in
`production-routing-readiness-2026-10-08.md`, and the isolated Router/Platform
fixtures. No WordPress files or production services were modified.

## Local evidence

Run after `npm run cf:build:production-platform`:

```bash
npm run audit:production-assets
```

The script inventories `public/` and `.open-next/assets`, maps files in
`/_next/`, `/assets/`, `/fonts/`, and `/events/` to the current route owner, and
fails if one of those files is not platform-owned. In the current checkout before
the OpenNext build, it found 325 public files, all under routed namespaces:
32 under `/assets/`, 76 under `/events/`, and 217 under `/fonts/`. It reported no
policy misroutes. The build inventory was unavailable
because `.open-next/assets` had not been generated locally; Linux CI must run the
script after the production build to include generated chunks and hashed assets.

Existing source inventory includes the homepage `/assets/*` images and video,
event campaign assets under `/events/daydream-adventure-2027/*` (including
images/fonts), and self-hosted `/fonts/*` families. `/_next/static/*` is covered
by the policy and by the isolated harness; its generated file list comes from the
OpenNext build.

The isolated integration harness sends representative homepage/event HTML,
JavaScript, CSS, image and font fixtures through the same Router dispatch helper.
It verifies that each request reaches the Platform mock and that the fixture
bytes and 404s are returned. This confirms code-level namespace dispatch only;
it is not evidence of live Worker asset delivery or live CMS collision absence.

## Collision findings

| Namespace | Repository result | Live WordPress collision status |
| --- | --- | --- |
| `/_next/*` | Platform policy; generated build inventory still needs Linux CI output | Unknown |
| `/assets/*` | 306 routed repository assets across shared and event files; policy maps them to Platform | Unknown |
| `/fonts/*` | Self-hosted font files present; policy maps them to Platform | Unknown |
| `/events/*` | Campaign assets are platform-owned; unknown slugs/assets resolve through Platform and should 404 | Existing public sample requests returned 404 before cutover; full namespace unknown |

The broad prefixes shadow any WordPress URL with the same path after the
catch-all Router Route is attached. The earlier read-only audit sampled
`/_next/static/route-audit.js`, `/assets/lilai-logo.png`, and
`/fonts/route-audit.woff2`; each returned 404 before cutover. These samples do not
prove that WordPress plugins, uploads, backlinks, CDN variants, or unlisted
resources never use those names. A complete live inventory and legacy `/events`
backlink review require Cloudflare/WordPress account evidence and remain a
cutover blocker.

## Conclusion

Code and repository assets are consistent with the planned Platform namespaces.
No live collision can be declared absent from the available evidence. Keep the
release **NO-GO** until the generated OpenNext inventory is reviewed and the live
WordPress namespace, signup dependencies, and historical `/events` URLs are
checked before cutover.
