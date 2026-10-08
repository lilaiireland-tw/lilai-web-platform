// @ts-ignore OpenNext generates this module at build time.
import handler from "../.open-next/worker.js";
import { stagingResponse } from "./staging-response";
import {
  isStandaloneFrontendPath,
  isStandaloneStaticAssetPath,
  stagingUnavailableResponse,
} from "./staging-policy";

export default {
  async fetch(request, env, ctx) {
    return stagingResponse(async () => {
      if (env.SITE_DEPLOYMENT_ENV !== "staging" || env.EVENT_DEPLOYMENT_ENV !== "preview" ||
          !env.ASSETS) {
        return new Response("Staging environment is not configured", { status: 503 });
      }
      // Standalone staging is read-only. No request is forwarded to WordPress,
      // WooCommerce, production routes or another Worker.
      if (!["GET", "HEAD"].includes(request.method)) {
        return new Response("Read-only staging", { status: 405, headers: { Allow: "GET, HEAD" } });
      }
      const url = new URL(request.url);
      if (url.pathname === "/_next/image") return stagingUnavailableResponse(request.method);
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
      if (isStandaloneFrontendPath(url.pathname)) {
        await asset.body?.cancel();
        return handler.fetch(request, env, ctx);
      }
      if (isStandaloneStaticAssetPath(url.pathname)) return asset;
      await asset.body?.cancel();
      return stagingUnavailableResponse(request.method);
    });
  },
} satisfies ExportedHandler<CloudflareEnv>;
