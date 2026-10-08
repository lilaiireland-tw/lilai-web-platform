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
fails if one of those files is not platform-owned. The local checkout before the
OpenNext build found 325 public files: 32 under `/assets/`, 76 under `/events/`,
and 217 under `/fonts/`. It reported no policy misroutes.

PR #29 Linux validation then built OpenNext and audited 696 files (371 generated,
325 public). It checked 686 routed files with no policy misroutes: 36 under
`/_next/`, 64 under `/assets/`, 152 under `/events/`, and 434 under `/fonts/`.
The remaining 10 OpenNext files are internal build files outside routed URL
namespaces.

Existing source inventory includes the homepage `/assets/*` images and video,
event campaign assets under `/events/daydream-adventure-2027/*` (including
images/fonts), and self-hosted `/fonts/*` families. `/_next/static/*` is covered
by the policy and by the isolated harness; its generated file list is now checked
in PR validation.

The isolated integration harness sends representative homepage/event HTML,
JavaScript, CSS, image and font fixtures through the same Router dispatch helper.
It verifies that each request reaches the Platform mock and that the fixture
bytes and 404s are returned. This confirms code-level namespace dispatch only;
it is not evidence of live Worker asset delivery or live CMS collision absence.

## Collision findings

| Namespace | Repository result | Live WordPress collision status |
| --- | --- | --- |
| `/_next/*` | 36 generated OpenNext files checked against Platform policy in Linux CI | Unknown |
| `/assets/*` | 64 generated plus source assets checked against Platform policy | Unknown |
| `/fonts/*` | Self-hosted font files present; policy maps them to Platform | Unknown |
| `/events/*` | 152 generated plus source assets checked against Platform policy; unknown slugs/assets should remain 404 | Existing public sample requests returned 404 before cutover; full namespace unknown |

The broad prefixes shadow any WordPress URL with the same path after the
catch-all Router Route is attached. The earlier read-only audit sampled
`/_next/static/route-audit.js`, `/assets/lilai-logo.png`, and
`/fonts/route-audit.woff2`; each returned 404 before cutover. These samples do not
prove that WordPress plugins, uploads, backlinks, CDN variants, or unlisted
resources never use those names. A complete live inventory and legacy `/events`
backlink review require Cloudflare/WordPress account evidence and remain a
cutover blocker.

## Conclusion

Code and generated repository assets are consistent with the planned Platform
namespaces. No live collision can be declared absent from the available evidence.
Keep the release **NO-GO** until the live WordPress namespace, signup
dependencies, and historical `/events` URLs are checked before cutover.
