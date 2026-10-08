import type { NextConfig } from "next";
import { assertDeploymentEnvironment, isProductionDeployment } from "./src/lib/deployment";
import { wordpressRewritePrefixes } from "./src/config/wordpress-rewrites";

assertDeploymentEnvironment();

const WP_ORIGIN = process.env.WORDPRESS_ORIGIN || "https://cms.lilaiireland.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.lilaiireland.com"
      },
      {
        protocol: "https",
        hostname: "lilaiireland.com"
      }
    ]
  },
  async rewrites() {
    if (process.env.SITE_DEPLOYMENT_ENV === "staging") return [];
    return wordpressRewritePrefixes.map(prefix => ({
      source: `${prefix}/:path*`,
      destination: `${WP_ORIGIN}${prefix}/:path*`,
    }));
  },
  async headers() {
    return [
      ...(!isProductionDeployment() ? [{
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      }] : []),
      {
        source: "/cart/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      },
      {
        source: "/checkout/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      },
      {
        source: "/my-account/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
      }
    ];
  }
};

export default nextConfig;
