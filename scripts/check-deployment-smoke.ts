import assert from "node:assert/strict";
import { PUBLIC_SITE_URL } from "../src/lib/deployment";

async function main() {
  assert(process.env.CHECK_BASE_URL, "Set CHECK_BASE_URL explicitly");
  const environment = process.env.CHECK_DEPLOYMENT_ENV;
  assert(["preview", "staging", "production"].includes(environment ?? ""), "Set CHECK_DEPLOYMENT_ENV");
  const production = environment === "production";
  const base = new URL(process.env.CHECK_BASE_URL);
  assert(["http:", "https:"].includes(base.protocol));
  assert(!base.username && !base.password && base.pathname === "/" && !base.search && !base.hash,
    "CHECK_BASE_URL must be an origin without credentials/path/query");
  for (const path of ["/", "/?utm_source=smoke", "/robots.txt", "/sitemap.xml"]) {
    const response = await fetch(new URL(path, base), {
      method: "GET", redirect: "manual", signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "LilaiDeploymentSmoke/1.0" }
    });
    assert.equal(response.status, 200, `${path}: expected 200`);
    const text = await response.text();
    const noindex = /\bnoindex\b/i.test(response.headers.get("x-robots-tag") ?? "");
    assert.equal(noindex, !production, `${path}: unexpected indexing header`);
    if (path.startsWith("/?") || path === "/") {
      assert(/<main\b/.test(text), `${path}: missing main content`);
      const canonical = text.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/);
      assert(canonical, `${path}: missing canonical`);
      assert.equal(new URL(canonical[1]).toString(), `${PUBLIC_SITE_URL}/`, `${path}: incorrect canonical`);
      if (!production) assert(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/.test(text));
    } else if (path === "/robots.txt") {
      assert.equal(/^Disallow:\s*\/\s*$/m.test(text), !production);
      if (production) assert(text.includes(`Sitemap: ${PUBLIC_SITE_URL}/sitemap.xml`));
      else assert(!/^Sitemap:/m.test(text));
    } else {
      assert(/<urlset\b/.test(text), "Expected sitemap XML");
      const locations = [...text.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
      if (!production) assert.equal(locations.length, 0);
      else {
        assert(locations.length > 0);
        for (const location of locations) assert.equal(new URL(location).origin, PUBLIC_SITE_URL);
      }
    }
    console.log(`PASS ${environment} ${path}`);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
