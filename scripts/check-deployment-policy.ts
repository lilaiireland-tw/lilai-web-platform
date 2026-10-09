import assert from "node:assert/strict";
import { createRequire } from "node:module";
import nextConfig from "../next.config";
import robots from "../src/app/robots";
import { absoluteUrl } from "../src/lib/site";
import { isProductionDeployment } from "../src/lib/deployment";

async function main() {
  // Sitemap imports registered campaigns; CSS is irrelevant to policy assertions.
  createRequire(import.meta.url).extensions[".css"] = module => { module.exports = {}; };
  const { default: sitemap } = await import("../src/app/sitemap");
  const original = process.env.SITE_DEPLOYMENT_ENV;
  try {
    for (const env of [undefined, "preview", "staging", "invalid", "production"]) {
      if (env === undefined) delete process.env.SITE_DEPLOYMENT_ENV;
      else process.env.SITE_DEPLOYMENT_ENV = env;
      const production = env === "production";
      assert.equal(isProductionDeployment(), production);
      const headers = await nextConfig.headers!();
      assert.equal(headers.some(rule => rule.source === "/:path*" &&
        rule.headers.some(header => header.key === "X-Robots-Tag" && header.value.includes("noindex"))), !production);
      const policy = robots();
      if (!production) {
        assert.deepEqual(policy, { rules: [{ userAgent: "*", disallow: "/" }] });
        // Must return before making any CMS network calls.
        assert.deepEqual(await sitemap(), []);
      } else {
        assert.deepEqual(policy.sitemap, [
          "https://lilaiireland.com/sitemap_index.xml",
          "https://lilaiireland.com/sitemap.xml",
          "https://lilaiireland.com/events-sitemap.xml"
        ]);
      }
      assert(headers.some(rule => rule.source === "/checkout/:path*"));
      console.log(`PASS deployment policy: ${env ?? "unset"}`);
    }
    assert.equal(absoluteUrl("/example/"), "https://lilaiireland.com/example/");
    console.log("PASS canonical stays on the public origin");
  } finally {
    if (original === undefined) delete process.env.SITE_DEPLOYMENT_ENV;
    else process.env.SITE_DEPLOYMENT_ENV = original;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
