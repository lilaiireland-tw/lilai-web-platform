/**
 * Shared on-host consent preference contract. Other site applications may read
 * the cookie only after independently integrating their own consent handling.
 */
export const CONSENT_COOKIE_NAME = "lilai_consent_v1";
export type ConsentPreferences = {
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
};

export type GoogleConsentState = {
  ad_storage: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
};

export const DENIED_CONSENT: GoogleConsentState = {
  ad_storage: "denied",
  analytics_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

export const REJECTED_PREFERENCES: ConsentPreferences = {
  analytics: false,
  advertising: false,
  personalization: false,
};

export const ACCEPTED_PREFERENCES: ConsentPreferences = {
  analytics: true,
  advertising: true,
  personalization: true,
};

export function toGoogleConsent(preferences: ConsentPreferences): GoogleConsentState {
  return {
    ad_storage: preferences.advertising ? "granted" : "denied",
    analytics_storage: preferences.analytics ? "granted" : "denied",
    ad_user_data: preferences.advertising ? "granted" : "denied",
    ad_personalization: preferences.advertising && preferences.personalization ? "granted" : "denied",
  };
}

export function encodeConsent(preferences: ConsentPreferences): string {
  return "v1." + Number(preferences.analytics) + Number(preferences.advertising) + Number(preferences.personalization);
}

export function parseConsent(value: string): ConsentPreferences | null {
  const match = /^v1\.([01])([01])([01])$/.exec(value);
  if (!match) return null;
  return {
    analytics: match[1] === "1",
    advertising: match[2] === "1",
    personalization: match[3] === "1",
  };
}

export function readConsentCookie(cookieHeader: string): ConsentPreferences | null {
  const entry = cookieHeader.split(";").map(part => part.trim())
    .find(part => part.startsWith(CONSENT_COOKIE_NAME + "="));
  if (!entry) return null;
  try {
    return parseConsent(decodeURIComponent(entry.slice(CONSENT_COOKIE_NAME.length + 1)));
  } catch {
    return null;
  }
}

export function saveConsentCookie(documentRef: Pick<Document, "cookie">, preferences: ConsentPreferences): void {
  // Host-only apex cookie: visible to WordPress and the signup Worker on this
  // same hostname, not shared with unrelated subdomains.
  documentRef.cookie = CONSENT_COOKIE_NAME + "=" + encodeURIComponent(encodeConsent(preferences)) +
    "; Path=/; Max-Age=15552000; SameSite=Lax; Secure";
}
