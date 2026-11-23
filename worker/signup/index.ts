import { routeApiRequest } from "./router";
import { errorResponse } from "./shared/http";
import { enqueueDueIntegrationJobs, handleIntegrationQueue } from "./queue/consumer";

const worker = {
  async fetch(request: Request, env: Cloudflare.Env): Promise<Response> {
    const url = new URL(request.url);

    try {
      const apiResponse = await routeApiRequest(request, env);
      if (apiResponse) return apiResponse;
      // Keep the existing signup routes while Platform renders the shared page/assets.
      if ((url.pathname === "/language-school-signup" || url.pathname.startsWith("/language-school-signup/")) &&
          (request.method === "GET" || request.method === "HEAD") && env.PLATFORM) {
        return await env.PLATFORM.fetch(request);
      }
      return errorResponse(404, "not_found", "找不到此頁面。");
    } catch (error) {
      console.error(JSON.stringify({ event: "api_request_failed", path: url.pathname, error: error instanceof Error ? error.message : "unknown" }));
      return errorResponse(500, "internal_error", "伺服器發生錯誤，請稍後再試。");
    }

  },
  async queue(batch: MessageBatch<unknown>, env: Cloudflare.Env): Promise<void> {
    await handleIntegrationQueue(batch, env);
  },
  async scheduled(_controller: ScheduledController, env: Cloudflare.Env): Promise<void> {
    await enqueueDueIntegrationJobs(env);
  },
} satisfies ExportedHandler<Cloudflare.Env>;

export default worker;
