export type EventPolicy = { production: boolean; includeDrafts: boolean };

export function getEventPolicy(): EventPolicy {
  // Explicit build-time marker: a staging build remains noindex even when it
  // inherits the public site's URL. Do not infer production from NODE_ENV.
  const production = process.env.EVENT_DEPLOYMENT_ENV === "production";
  return { production, includeDrafts: !production && process.env.EVENTS_INCLUDE_DRAFTS === "true" };
}
