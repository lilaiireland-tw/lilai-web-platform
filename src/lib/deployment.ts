// Build-time policy. NODE_ENV=production also describes preview builds.
export const PUBLIC_SITE_URL = "https://lilaiireland.com";

export function isProductionDeployment() {
  return process.env.SITE_DEPLOYMENT_ENV === "production";
}
