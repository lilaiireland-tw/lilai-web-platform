import { isProductionDeployment } from "@/lib/deployment";
import { eventRegistry } from "@/lib/events/event-registry";
import { buildEventSitemapXml } from "@/lib/events/event-sitemap";

export function GET() {
  if (!isProductionDeployment()) return new Response(null, { status: 404 });

  return new Response(buildEventSitemapXml(eventRegistry.indexable()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}
