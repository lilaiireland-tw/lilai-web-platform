# Consultation analytics

The assessment now has a native form with `noValidate`. Existing custom validation
and GAS submission remain authoritative. Continue/back/consent buttons remain
`type="button"`; only the final button submits. Enter in an input does nothing,
as before; textarea Enter inserts a newline, and focused buttons retain keyboard
activation. The submit handler prevents navigation and only submits step 5.

## Existing GA4 destination required

The repository currently initializes only Google Ads. Set the build-time
`NEXT_PUBLIC_GA4_MEASUREMENT_ID` to the **existing** GA4 `G-...` destination after
confirming that destination is already connected/configured by the existing
Google tag setup. This change does not install, initialize or configure GA4.
Without that ID, the custom events deliberately remain disabled. Do not replace
the Ads tag ID or conversion label. Do not add a second GTM/custom-event sender.

Events use the existing `window.gtag`, explicitly route to GA4 using `send_to`,
and require the existing consent cookie's analytics preference. Advertising
consent is independent. No consent defaults/updates or Ads code are changed.
Only the production apex hostname is eligible, matching the existing deployment
gate. No events are replayed when consent is granted later.

| Event | Meaning |
| --- | --- |
| `consult_form_start` | First nonblank input/textarea change, option change or consent-button interaction per mounted assessment; focus/navigation alone do not count. This is meaningful interaction, not successful field validation. |
| `consult_step_complete` | Once per step per mounted assessment after existing validation passes; `step_number` 1–5. Going back or retrying does not duplicate it. |
| `consult_validation_error` | One per failed continue/submit validation or rejected fourth barrier selection, with only the failing `step_number`; no values, messages or field names. |
| `consult_submit_attempt` | Final submit action before validation; in-flight/completed submissions ignored; intentional retries count separately. |
| `consult_submit_success` | Once when the existing GAS fetch resolves, at the existing Ads success boundary. |

All custom payloads contain only a fixed `form_id`, GA4 `send_to`, and optional
bounded `step_number`. No form data is passed to the analytics helper. GAS uses
`no-cors`, so success means the fetch resolved, **not** confirmed server-side
processing or email delivery. This limitation is unchanged.

Native `form_start`/`form_submit` depend on GA4 Enhanced Measurement settings.
We do not manually emit these names. Automatic `form_submit` is not a business
success signal. Do not import the new success event as another Ads conversion
without separately reviewing duplicate conversion counting.

## Browser QA

Use local request interception; never submit a real GAS form or send real Ads
conversions during tests. Check 375px and 1440px widths, overflow, focus-visible,
console/hydration errors, Enter/IME, textarea newline, consent keyboard activation,
back/continue state retention, failed validation, rapid double submission,
rejected-request retry and result/feedback behavior. With a stubbed production
runtime and gtag, check all five events, backtracking deduplication, analytics-only
consent, rejection/withdrawal, missing tag and throwing tag. Verify the Ads
conversion destination and one-conversion-on-resolved behavior are unchanged.

After the existing GA4 destination is confirmed, verify receipt using DebugView
in an authorized test setup. Native events and external GTM/account-level rules
cannot be verified from this repository alone.

References: [Google tag routing](https://developers.google.com/tag-platform/gtagjs/routing),
[Enhanced Measurement](https://support.google.com/analytics/answer/9216061).
