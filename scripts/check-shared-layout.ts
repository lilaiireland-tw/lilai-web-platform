import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { once } from "node:events";
import { primaryNavigation, serviceNavigation, type NavigationLink } from "../src/config/navigation";
import nextConfig from "../next.config";

const flattenLinks = (links: readonly NavigationLink[]): NavigationLink[] =>
  links.flatMap(link => [link, ...(link.children ? flattenLinks(link.children) : [])]);

// Isolated, read-only fixtures: never contact WordPress or submit service forms.
const requests: string[] = [];
const origin = createServer((request, response) => {
  const url = new URL(request.url || "/", "http://fixture");
  requests.push(url.pathname);
  response.setHeader("Content-Type", "application/json");
  if (url.pathname.startsWith("/wp-json/wp/v2/")) {
    const slug = url.searchParams.get("slug");
    const isPage = url.pathname.endsWith("/pages") && slug === "shared-layout-page";
    const isPost = url.pathname.endsWith("/posts") && slug === "shared-layout-post";
    response.end(JSON.stringify(isPage || isPost ? [{
      id: 1, slug, title: { rendered: isPage ? "Fixture page" : "Fixture post" },
      content: { rendered: "<p>Existing WordPress content</p>" },
      excerpt: { rendered: "<p>Fixture description</p>" }
    }] : []));
  } else {
    response.end(JSON.stringify({ fixturePath: url.pathname }));
  }
});

async function main() {
  const deploymentEnv = process.env.CHECK_DEPLOYMENT_ENV === "production" ? "production" : "staging";
  origin.listen(0, "127.0.0.1");
  await once(origin, "listening");
  const address = origin.address();
  assert(address && typeof address !== "string");
  const fixtureUrl = `http://127.0.0.1:${address.port}`;

  const portProbe = createServer();
  portProbe.listen(0, "127.0.0.1");
  await once(portProbe, "listening");
  const appAddress = portProbe.address();
  assert(appAddress && typeof appAddress !== "string");
  await new Promise<void>(resolve => portProbe.close(() => resolve()));
  const baseUrl = `http://127.0.0.1:${appAddress.port}`;
  const originalNextEnv = readFileSync("next-env.d.ts");
  const app = spawn(process.execPath, [
    "node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(appAddress.port)
  ], {
    env: {
      ...process.env,
      SITE_DEPLOYMENT_ENV: deploymentEnv,
      NEXT_PUBLIC_SITE_URL: "https://invalid-staging.example",
      WORDPRESS_ORIGIN: fixtureUrl,
      WORDPRESS_API_BASE: `${fixtureUrl}/wp-json/wp/v2`,
      WOOCOMMERCE_STORE_API_BASE: `${fixtureUrl}/wp-json/wc/store/v1`
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let logs = "";
  app.stdout.on("data", data => { logs += data; });
  app.stderr.on("data", data => { logs += data; });
  const get = (path: string) => fetch(`${baseUrl}${path}`, {
    headers: { "User-Agent": "Googlebot" }, signal: AbortSignal.timeout(15000)
  });
  const checkShell = (html: string) => {
    assert.equal((html.match(/<header\b/g) || []).length, 1);
    assert.equal((html.match(/<footer\b/g) || []).length, 1);
    assert.equal((html.match(/<main\b/g) || []).length, 1);
    assert(html.includes('id="site-content"'));
    assert(html.includes('aria-controls="mobile-navigation"'));
    assert(html.includes('aria-label="主要導覽"'));
    assert(html.includes('aria-label="手機主要導覽"'));
    assert(html.includes('data-site-top-strip="true"'));
    assert(html.indexOf('data-site-top-strip="true"') < html.indexOf("<header"));
    for (const link of [...flattenLinks(primaryNavigation), ...serviceNavigation]) {
      assert(html.includes(`href="${link.href}"`), link.href);
    }
  };

  try {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      if (app.exitCode !== null) throw new Error(logs);
      try { await get("/"); ready = true; break; } catch { /* wait for startup */ }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    assert(ready, logs);
    const home = await get("/");
    assert.equal(home.status, 200);
    const homeHtml = await home.text();
    checkShell(homeHtml);
    const smoke = spawn(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/check-deployment-smoke.ts"], {
      env: { ...process.env, CHECK_BASE_URL: baseUrl, CHECK_DEPLOYMENT_ENV: deploymentEnv },
      stdio: "inherit"
    });
    const [smokeCode] = await once(smoke, "exit");
    assert.equal(smokeCode, 0, `${deploymentEnv} smoke check against the isolated app`);
    const source = readFileSync("src/content/home.html", "utf8");
    const sourceMain = source.match(/<main[\s\S]*?<\/main>/)?.[0];
    assert(sourceMain);
    assert(homeHtml.includes(sourceMain.replaceAll("./assets/", "/assets/").replaceAll('href="#work"', 'href="#life"')));
    console.log("PASS homepage: unchanged main content, top strip before header, WordPress-aligned navigation");

    for (const path of ["/shared-layout-page/", "/nested/shared-layout-page/", "/shared-layout-post/"]) {
      const result = await get(path);
      assert.equal(result.status, 200, path);
      const html = await result.text();
      checkShell(html);
      assert(html.includes("Existing WordPress content"));
      console.log(`PASS WordPress page/post fallback with shared shell: ${path}`);
    }
    for (const path of ["/shared-layout-missing/", "/product/shared-layout-missing/"]) {
      const result = await get(path);
      assert.equal(result.status, 404, path);
      const html = await result.text();
      assert(html.includes("找不到這個頁面"), html.slice(0, 1800));
      // Next can send notFound() as an error document with the layout in Flight
      // data. Check that payload without claiming browser hydration was tested.
      if (html.includes("<header")) {
        checkShell(html);
      } else {
        const flight = [...html.matchAll(/self\.__next_f\.push\((.*?)\)<\/script>/g)]
          .map(match => JSON.parse(match[1])[1]).filter(value => typeof value === "string").join("");
        for (const element of ["header", "footer", "main"]) {
          assert(flight.includes(`["$","${element}",`), element);
        }
        assert(flight.includes('"id":"site-content"'));
      }
      console.log(`PASS 404 with shared shell: ${path}`);
    }
    const configuredHeaders = await nextConfig.headers?.();
    for (const path of ["/wp-json/layout-probe", "/wp-content/layout-probe", "/wp-admin/layout-probe", "/cart/layout-probe", "/checkout/layout-probe", "/my-account/layout-probe"]) {
      const result = await get(path);
      assert.equal(result.status, 200, path);
      assert.equal((await result.json()).fixturePath, path);
      assert(requests.includes(path));
      if (/^\/(cart|checkout|my-account)\//.test(path)) {
        const source = `/${path.split("/")[1]}/:path*`;
        assert(configuredHeaders?.some(rule => rule.source === source && rule.headers.some(
          header => header.key === "X-Robots-Tag" && header.value === "noindex, nofollow"
        )));
        // Develop also drops this header on external proxy responses. Do not
        // change infrastructure here or mistake config checks for wire checks.
        console.log(`INFO ${path} X-Robots-Tag on response: ${result.headers.get("x-robots-tag")}`);
      }
      console.log(`PASS existing rewrite: ${path}`);
    }
    const logo = await get("/assets/lilai-logo.png");
    assert.equal(logo.status, 200);
    for (const font of ["NotoSansTC-Regular", "NotoSansTC-Bold", "NotoSerifTC-Bold"]) {
      assert.equal((await get(`/fonts/${font}.woff2`)).status, 200);
    }
    console.log("PASS local logo and brand font assets");
  } finally {
    const exited = once(app, "exit");
    app.kill();
    if (app.exitCode === null) await exited;
    // Next dev regenerates this tracked file with a dev-only type import.
    writeFileSync("next-env.d.ts", originalNextEnv);
    await new Promise<void>(resolve => origin.close(() => resolve()));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
