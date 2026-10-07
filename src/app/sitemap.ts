import type { MetadataRoute } from "next";
import { isProductionDeployment } from "@/lib/deployment";
import { STATIC_SITEMAP_URLS } from "@/data/urlMap";
import { absoluteUrl } from "@/lib/site";
import { getAllPageSlugs, getAllPostSlugs } from "@/lib/wordpress";
import { eventRegistry, eventPath } from "@/lib/events/event-registry";
import { eventAbsoluteUrl } from "@/lib/events/event-metadata";
import { getEventPolicy } from "@/lib/events/event-policy";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionDeployment()) return [];
  const staticUrls = STATIC_SITEMAP_URLS.map(path => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" as const : "monthly" as const,
    priority: path === "/" ? 1 : 0.7
  }));

  const eventUrls = getEventPolicy().production ? [
    { url: eventAbsoluteUrl("/events/") },
    ...eventRegistry.indexable().map(event => ({ url: eventAbsoluteUrl(eventPath(event.slug)) }))
  ] : [];

  try {
    const [posts, pages] = await Promise.all([getAllPostSlugs(), getAllPageSlugs()]);
    const wpUrls = [...posts, ...pages]
      .filter(item => item.slug !== "cart" && item.slug !== "checkout" && item.slug !== "my-account")
      .map(item => ({
        url: absoluteUrl(`/${item.slug}/`),
        lastModified: item.modified ? new Date(item.modified) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8
      }));

    return [...staticUrls, ...wpUrls, ...eventUrls];
  } catch {
    return [...staticUrls, ...eventUrls];
  }
}
