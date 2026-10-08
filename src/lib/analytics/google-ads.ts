export const GOOGLE_ADS_TAG_ID = "AW-17610996814";
export const CONSULTATION_CONVERSION_SEND_TO =
  "AW-17610996814/Ynp6CPHkhe4cEM74yc1B";
export const GOOGLE_ADS_SCRIPT_URL =
  `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_TAG_ID}`;

export type GoogleAdsWindow = {
  location: { hostname: string };
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
 * Creates the standard gtag queue before the remote script is available.
 * This lets a conversion be queued instead of being dropped during startup.
 */
export function initializeGoogleAds(runtime: GoogleAdsRuntime) {
  const browserWindow = runtime.browserWindow ?? currentWindow();
  if (!browserWindow || !isAuthorizedGoogleAdsRuntime({ ...runtime, browserWindow })) return false;

  browserWindow.dataLayer ??= [];
  browserWindow.gtag ??= (...args: unknown[]) => {
    browserWindow.dataLayer?.push(args);
  };

  if (!browserWindow.__lilaiGoogleAdsConfigured) {
    browserWindow.gtag("js", new Date());
    browserWindow.gtag("config", GOOGLE_ADS_TAG_ID);
    browserWindow.__lilaiGoogleAdsConfigured = true;
  }

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
