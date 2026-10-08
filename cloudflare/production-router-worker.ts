import { routeProductionRequest } from "./production-router";

export default {
  fetch(request, env) {
    return routeProductionRequest(request, { platform: env.PLATFORM });
  },
} satisfies ExportedHandler<ProductionRouterEnv>;
