import { stagingResponse } from "../../cloudflare/staging-response";
import { isSignupStaticAssetPath, prepareStagingSignupRequest, stagingSignupMethod, STAGING_SIGNUP_ORIGIN } from "../../cloudflare/staging-signup";
import { routeApiRequest } from "./router";
import { errorResponse } from "./shared/http";

// No Queue binding, provider credentials, queue handler or scheduled handler in staging.
const mockQueue: Queue = {
  async metrics() { return { backlogCount: 0, backlogBytes: 0 }; },
  async send() { return { metadata: { metrics: { backlogCount: 0, backlogBytes: 0 } } }; },
  async sendBatch() { return { metadata: { metrics: { backlogCount: 0, backlogBytes: 0 } } }; },
};

export default {
  async fetch(request: Request, env: SignupStagingEnv): Promise<Response> {
    return stagingResponse(async () => {
      if (env.SITE_DEPLOYMENT_ENV !== "staging" || env.TURNSTILE_HOSTNAMES !== new URL(STAGING_SIGNUP_ORIGIN).hostname) {
        return errorResponse(503, "staging_not_configured", "測試環境設定不完整。");
      }
      const path = new URL(request.url).pathname;
      if (stagingSignupMethod(path)) {
        const prepared = await prepareStagingSignupRequest(request);
        if (prepared instanceof Response) return prepared;
        return await routeApiRequest(prepared, { ...env, INTEGRATION_QUEUE: mockQueue }) ?? errorResponse(404, "api_not_found", "找不到此 API。");
      }
      if ((request.method === "GET" || request.method === "HEAD") &&
          (path === "/language-school-signup" || path === "/language-school-signup/" || isSignupStaticAssetPath(path))) {
        return env.PLATFORM.fetch(request);
      }
      return errorResponse(404, "api_not_found", "找不到此 API。");
    });
  },
} satisfies ExportedHandler<SignupStagingEnv>;
