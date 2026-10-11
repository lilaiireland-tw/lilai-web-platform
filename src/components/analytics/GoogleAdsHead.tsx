import { CONSENT_COOKIE_NAME } from "@/lib/analytics/consent";
import {
  GOOGLE_ADS_SCRIPT_URL,
  GOOGLE_ADS_TAG_ID,
} from "@/lib/analytics/google-ads";

const consentBootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;

gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});

(function restoreSavedConsent() {
  var cookieName = ${JSON.stringify(CONSENT_COOKIE_NAME)} + '=';
  var entry = document.cookie.split(';').map(function (part) { return part.trim(); })
    .find(function (part) { return part.indexOf(cookieName) === 0; });
  if (!entry) return;

  try {
    var value = decodeURIComponent(entry.slice(cookieName.length));
    var match = /^v1\\.([01])([01])([01])$/.exec(value);
    if (!match) return;

    gtag('consent', 'update', {
      'analytics_storage': match[1] === '1' ? 'granted' : 'denied',
      'ad_storage': match[2] === '1' ? 'granted' : 'denied',
      'ad_user_data': match[2] === '1' ? 'granted' : 'denied',
      'ad_personalization': match[2] === '1' && match[3] === '1' ? 'granted' : 'denied'
    });
  } catch (error) {
    // Invalid consent cookies fall back to the denied defaults above.
  }
})();
`;

const configBootstrap = `
gtag('js', new Date());
gtag('config', ${JSON.stringify(GOOGLE_ADS_TAG_ID)});
window.__lilaiGoogleAdsConfigured = true;
`;

/**
 * Production-only Google Ads head integration.
 *
 * Ordering is intentional:
 * 1. establish Consent Mode v2 defaults synchronously;
 * 2. restore any saved visitor choice;
 * 3. load Google's official gtag.js;
 * 4. queue js/config for the Ads destination.
 */
export function GoogleAdsHead() {
  return (
    <>
      <script
        id="lilai-google-consent-default"
        dangerouslySetInnerHTML={{ __html: consentBootstrap }}
      />
      <script
        id="lilai-google-ads-tag"
        async
        src={GOOGLE_ADS_SCRIPT_URL}
      />
      <script
        id="lilai-google-ads-config"
        dangerouslySetInnerHTML={{ __html: configBootstrap }}
      />
    </>
  );
}
