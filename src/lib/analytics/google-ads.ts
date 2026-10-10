import {
  DENIED_CONSENT,
  readConsentCookie,
  toGoogleConsent,
  type ConsentPreferences,
} from "./consent";

export const GOOGLE_ADS_TAG_ID = "AW-17610996814";
export const CONSULTATION_CONVERSION_SEND_TO =
  "AW-17610996814/Ynp6CPHkhe4cEM74yc1B";
export const GOOGLE_ADS_SCRIPT_URL =
  "https://www.googletagmanager.com/gtag/js?id=" + GOOGLE_ADS_TAG_ID;

export type GoogleAdsWindow = {
  location: { hostname: string };
  document?: { cookie: string };
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __lilaiGoogleAdsConfigured?: boolean;
};

export type GoogleAdsRuntime = {
  productionDeployment: boolean;
  browserWindow?: GoogleAdsWindow;
};

export type GoogleAdsConversionGuard = {
  sent: boolean;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __lilaiGoogleAdsConfigured?: boolean;
  }
}

function currentWindow() {
  return typeof window === "undefined" ? undefined : window;
}

export function isAuthorizedGoogleAdsRuntime({
  productionDeployment,
  browserWindow = currentWindow(),
}: GoogleAdsRuntime) {
  return Boolean(
    productionDeployment && browserWindow?.location.hostname.toLowerCase() === "lilaiireland.com",
  );
}

/**
 * Queue consent default BEFORE js/config and BEFORE loading gtag.js.
 * Restored, explicit user preferences are applied as an update after the
 * denied default, never as an unconditional grant.
 */
export function initializeGoogleAds(runtime: GoogleAdsRuntime) {
  const browserWindow = runtime.browserWindow ?? currentWindow();
  if (!browserWindow || !isAuthorizedGoogleAdsRuntime({ ...runtime, browserWindow })) return false;

  browserWindow.dataLayer ??= [];
  browserWindow.gtag ??= (...args: unknown[]) => {
    browserWindow.dataLayer?.push(args);
  };

  if (!browserWindow.__lilaiGoogleAdsConfigured) {
    browserWindow.gtag("consent", "default", { ...DENIED_CONSENT, wait_for_update: 500 });
    const saved = readConsentCookie(browserWindow.document?.cookie ?? "");
    if (saved) browserWindow.gtag("consent", "update", toGoogleConsent(saved));
    browserWindow.gtag("js", new Date());
    browserWindow.gtag("config", GOOGLE_ADS_TAG_ID);
    browserWindow.__lilaiGoogleAdsConfigured = true;
  }

  return true;
}

export function updateGoogleAdsConsent(preferences: ConsentPreferences, runtime: GoogleAdsRuntime): boolean {
  if (!initializeGoogleAds(runtime)) return false;
  const browserWindow = runtime.browserWindow ?? currentWindow();
  if (!browserWindow?.gtag) return false;
  browserWindow.gtag("consent", "update", toGoogleConsent(preferences));
  return true;
}

export function trackConsultationConversion(
  guard: GoogleAdsConversionGuard,
  runtime: GoogleAdsRuntime,
) {
  if (guard.sent || !initializeGoogleAds(runtime)) return false;

  const browserWindow = runtime.browserWindow ?? currentWindow();
  if (typeof browserWindow?.gtag !== "function") return false;

  try {
    browserWindow.gtag("event", "conversion", {
      send_to: CONSULTATION_CONVERSION_SEND_TO,
    });
    guard.sent = true;
    return true;
  } catch {
    return false;
  }
}
