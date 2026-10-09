# Frontend QA strategy

## Routine local checks

Run `npm run qa:precutover` for UI changes. It starts a local Next.js development
server at `http://127.0.0.1:3100` with `SITE_DEPLOYMENT_ENV=staging`. This disables
WordPress rewrites and Google Ads configuration. Browser external requests are
intercepted locally: Google Apps Script is blocked unless a test-specific mock
handles it, remote images receive a tiny local fixture, external read requests
receive inert local fixtures, and external writes are blocked. The browser base
URL is fixed in the Playwright config and cannot be redirected to a live site
with an environment variable.

The default run uses Chromium at 375px and 1440px and covers the homepage, events
index and detail, consultation page, shell/navigation, responsive layout, URL
behavior, and critical consultation form validation and mocked submissions.
The form success/failure tests intercept GAS requests; no real form submission,
email, booking, or Google Ads conversion is sent.

`npm run qa:precutover:full` is an optional local-only cross-browser run. It adds
Firefox and WebKit plus the 768px tablet viewport. It uses the same loopback
server and outbound request blocking as the default command.

## Remote release smoke check

`npm run qa:remote-smoke` is disabled unless the operator explicitly sets
`ALLOW_REMOTE_QA=I_UNDERSTAND_CLOUDFLARE_USAGE`. After an **approved cutover**,
it makes exactly eight client-initiated `GET` calls (or fewer if an assertion
fails) to a fixed allowlist on `https://lilaiireland.com`:

- Platform: `/`, `/events`, `/events/daydream-adventure-2027`,
  `/consult`, `/events-sitemap.xml`
- WordPress: `/study-in-ireland-guide/`, `/sitemap_index.xml`
- Signup: `/language-school-signup?utm_source=smoke`

The smoke test checks 200 status and Content-Type, the deployed Platform's
observed `x-opennext: 1` marker, expected XML content, and preservation of the
signup query string on a redirect. It stops on the first failure. A valid signup
redirect is only a partial check: it does not prove the redirect destination
is served by the correct live Worker, so the operator must also open the signup
page once during the approved cutover window.

Redirects are not followed. There is no browser, retry, polling, asset crawl,
screenshot, or font/image dependency loading. The hard cap is **10** client
requests and the current allowlist uses **8**. Service Bindings can cause
additional downstream Worker invocations, so this count is not a total of all
Worker executions. No smoke test can certify Cloudflare route precedence before
the public Route is actually attached.

PowerShell example for an intentional post-cutover check:

```powershell
$env:ALLOW_REMOTE_QA = 'I_UNDERSTAND_CLOUDFLARE_USAGE'
npm run qa:remote-smoke
Remove-Item Env:ALLOW_REMOTE_QA
```

Run this manually only after an important approved release. Do not schedule
it or run it for ordinary UI edits.

## Separate remote diagnostics

`probe:production-runtime` starts Wrangler with a remote Router Service Binding;
`verify:production-runtime` sends a larger set of runtime requests. Both npm
commands are guarded by `ALLOW_REMOTE_QA=I_UNDERSTAND_CLOUDFLARE_USAGE`, emit a
quota warning, and are not part of local QA or CI. Do not run the verifier as
part of routine changes.

The former WordPress compatibility assertions are in
`tests/remote-compatibility/`, outside the local browser test directory. They
assert the remote probe headers and WordPress/signup routing behavior; they do
not prove Cloudflare account-level DNS, TLS, rules, or route ownership. They
require explicit authorization and an operator-started probe. The test config
does not start a probe or contact deployed Workers itself. Run them only for an
approved routing diagnostic, with the separately guarded probe running.

Cloudflare account-level checks (DNS, TLS/SNI, Cache, Redirect, Origin, Security
Rules, and public route precedence) remain dashboard/API evidence tasks in the
[production release checklist](../production-release-checklist.md). Do not
represent local browser tests as proving those account settings.

## Historical 111/111 result

The [pre-cutover browser report](precutover-playwright-report.md) records the
111/111 run from 2026-10-09. That run went through a local Wrangler process and
a remote Service Binding to the deployed Router. It remains useful historical
evidence, but it is not evidence that this local-only setup ran 111 tests. The
default suite was intentionally not rerun as a 111-test remote suite during
this infrastructure change.
