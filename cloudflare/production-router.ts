import { productionRouteOwner } from "./production-routing-policy";

export interface ProductionRouterServices {
  platform: { fetch(request: Request): Promise<Response> };
  originFetch?: (request: Request) => Promise<Response>;
}

/**
 * Dispatch an incoming request to the private platform service only when the
 * production ownership policy allows it. Origin requests use the original
 * Request object so method, body, query, headers, and cookies stay intact.
 */
export function routeProductionRequest(
  request: Request,
  services: ProductionRouterServices,
): Promise<Response> {
  if (productionRouteOwner(request.url) === "platform") {
    return services.platform.fetch(request);
  }

  return (services.originFetch ?? fetch)(request);
}
