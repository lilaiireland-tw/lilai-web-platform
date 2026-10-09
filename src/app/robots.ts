import type { MetadataRoute } from "next";
import { isProductionDeployment } from "@/lib/deployment";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart/", "/checkout/", "/my-account/"]
      }
    ],
    sitemap: [
      absoluteUrl("/sitemap_index.xml"),
      absoluteUrl("/sitemap.xml"),
      absoluteUrl("/events-sitemap.xml")
    ],
    host: SITE_URL
  };
}
