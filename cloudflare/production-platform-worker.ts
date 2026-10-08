// @ts-ignore OpenNext generates this module at build time.
import handler from "../.open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    if (
      env.SITE_DEPLOYMENT_ENV !== "production" ||
      env.EVENT_DEPLOYMENT_ENV !== "production" ||
      env.EVENTS_INCLUDE_DRAFTS !== "false" ||
      !env.ASSETS
    ) {
      return new Response("Production platform environment is not configured", { status: 503 });
    }

    return handler.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<CloudflareEnv>;
