// Build-time policy. NODE_ENV=production also describes preview builds.
export const PUBLIC_SITE_URL = "https://lilaiireland.com";

export function isProductionDeployment() {
  return process.env.SITE_DEPLOYMENT_ENV === "production";
}

// Staging intentionally pairs SITE=staging with EVENT=preview.
// Compare production intent, not the literal labels. Missing markers are preview.
export function assertDeploymentEnvironment(env: Record<string, string | undefined> = process.env) {
  if ((env.SITE_DEPLOYMENT_ENV === "production") !== (env.EVENT_DEPLOYMENT_ENV === "production")) {
    throw new Error("SITE_DEPLOYMENT_ENV / EVENT_DEPLOYMENT_ENV mismatch: production requires both markers to be production; staging requires staging / preview.");
  }
}
