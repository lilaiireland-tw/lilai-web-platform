import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Initial read-only staging: serve the build's prerendered pages without creating
// R2, D1, KV or Queues. ISR / on-demand revalidation need a separate cache design.
const config = defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});

// The Windows Turbopack bundle missed runtime SSR chunks in workerd.
// Keep the ordinary Next build unchanged; use webpack only for the Worker build.
config.buildCommand = "npm run build -- --webpack";
export default config;
