"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  GOOGLE_ADS_SCRIPT_URL,
  initializeGoogleAds,
} from "@/lib/analytics/google-ads";

export function GoogleAdsTag({ productionDeployment }: { productionDeployment: boolean }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    setAuthorized(initializeGoogleAds({ productionDeployment }));
  }, [productionDeployment]);

  if (!authorized) return null;

  return (
    <Script
      id="lilai-google-ads-tag"
      src={GOOGLE_ADS_SCRIPT_URL}
      strategy="afterInteractive"
    />
  );
}
