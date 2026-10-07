// @ts-ignore OpenNext generates this module at build time.
import handler from "../.open-next/worker.js";
import { stagingResponse } from "./staging-response";
import { isWordPressRewrite } from "../src/config/wordpress-rewrites";

export default {
  async fetch(request, env, ctx) {
    return stagingResponse(async () => {
      if (env.SITE_DEPLOYMENT_ENV !== "staging" || env.EVENT_DEPLOYMENT_ENV !== "preview" ||
          !env.WORDPRESS_ORIGIN || !env.WORDPRESS_API_BASE || !env.WOOCOMMERCE_STORE_API_BASE || !env.ASSETS) {
        return new Response("Staging environment is not configured", { status: 503 });
      }
      // This provisioning stage is read-only: never forward forms, Woo writes or
      // revalidation requests to an origin. GET/HEAD still exercise rendering.
      if (!["GET", "HEAD"].includes(request.method)) {
        return new Response("Read-only staging", { status: 405, headers: { Allow: "GET, HEAD" } });
      }
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
      await asset.body?.cancel();
      const url = new URL(request.url);
      if (isWordPressRewrite(url.pathname)) {
        // Keep the existing rewrite paths, but preserve redirect responses and
        // use the destination Host. The adapter's default proxy follows redirects.
        const target = new URL(url.pathname + url.search, env.WORDPRESS_ORIGIN);
        const headers = new Headers(request.headers);
        headers.delete("host");
        headers.delete("cf-connecting-ip");
        return fetch(target, { method: request.method, headers, redirect: "manual" });
      }
      return handler.fetch(request, env, ctx);
    });
  },
} satisfies ExportedHandler<CloudflareEnv>;
