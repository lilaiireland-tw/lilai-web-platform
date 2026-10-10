# Consent Mode v2 (Next.js portion only)

This implementation covers the **Next.js platform pages** at
`https://lilaiireland.com/`. It does not automatically configure Consent Mode,
block third-party scripts, or alter cookies on WordPress / the separate
language-school-signup Worker. No CMP was present in this repository.
A legal/privacy review and coordination with the other applications remain
required before claiming comprehensive site-wide consent compliance.

## Current behavior

- Only production-marked builds on the exact hostname `lilaiireland.com` run
  the Google Ads tag or render the consent banner.
- The tag bootstrap queues four `denied` Consent Mode v2 defaults (with a short
  `wait_for_update`) **before** Google Ads config or conversion. A previously
  recorded preference is then queued as an explicit `update` before config.
- The persistent banner offers accept all, reject optional, and granular
  analytics / advertising / personalization preferences. Personalization
  requires advertising. The small `Cookie 設定` button allows later changes.
- The 180-day host-only `lilai_consent_v1` cookie encodes three boolean flags
  (no names, email or identifiers). Scope: `Path=/; SameSite=Lax; Secure`.
  It may be read by other same-host applications, but they **must implement**
  their own integration before its presence has any practical effect.
- This is an **Advanced Consent Mode** model: denied-consent Google tags can
  still send consent-mode cookieless pings. This is not blanket pre-consent
  blocking of all third-party resources, including existing video embeds.
  Obtain privacy/legal sign-off before rollout. A licensed CMP/basic consent
  mode may be preferable depending on your compliance decision.
- The consultation conversion retains its existing ID and submission trigger.
  `dataLayer` recording an event is NOT proof that Google received an HTTP hit.
  With the existing `no-cors` GAS request, a resolved fetch likewise does NOT
  prove that a lead reached the backend.

## Cross-application handoff

WordPress pages and `site-creator-vinext-starter` must be audited separately
for independent Google tags, cookies, YouTube embeds, privacy disclosures and
existing consent tools. Coordinate a common consent policy before connecting
them to the `lilai_consent_v1` cookie. Do not blindly grant consent because the
cookie merely exists; parse its version and explicit bits. Avoid conflicting
consent banners. This PR does not change WP / the signup Worker.

## Safe acceptance checks (no real conversions)

Run locally:
- `npx tsx scripts/check-consent.ts`
- `npm run check:consult`
- `npx tsc --noEmit --incremental false`

Manually on approved production deployment, use Tag Assistant to inspect
consent **default** (`denied`) and **update** after actual choice. Confirm
withdrawal and refresh persistence. Check 375px / 1440px overlay layout,
keyboard navigation, privacy policy link and a return visit.

Separately inspect a **previously recorded real** Ads conversion network trace.
If no hit is observed, investigate consent policy, tag transport, privacy/Ad
Block extensions, Ads destination and Tag Assistant selection independently.
Do NOT synthesize production conversions or submit test GAS leads.

## Cloudflare deployment safety

The live public `lilaiireland.com/*` Worker route was added in Dashboard.
`cloudflare/production-router.jsonc` still declares `routes: []`. Before any
production redeploy, explicitly reconcile Dashboard-managed routes with
Wrangler deployment behavior and prepare rollback: do not redeploy as an
automatic follow-up to this PR.
