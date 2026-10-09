import type { FullConfig } from "@playwright/test";

export default function globalSetup(_config: FullConfig) {
  if (process.env.ALLOW_REMOTE_QA !== "I_UNDERSTAND_CLOUDFLARE_USAGE") {
    throw new Error("Remote compatibility checks require ALLOW_REMOTE_QA=I_UNDERSTAND_CLOUDFLARE_USAGE.");
  }
  console.warn("WARNING: compatibility checks use the manually started remote Service Binding probe and consume Cloudflare request quota.");
}
