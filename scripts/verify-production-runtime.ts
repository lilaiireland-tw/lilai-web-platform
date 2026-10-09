import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const PRODUCTION_ORIGIN = "https://lilaiireland.com";
const PROBE_ORIGIN = process.env.RUNTIME_PROBE_ORIGIN ?? "http://127.0.0.1:8791";
const OUTPUT_PATH = process.env.RUNTIME_PROBE_OUTPUT ?? ".cloudflare/production-runtime-verification.json";
const MAX_REDIRECTS = 10;
const PLATFORM_PREFIXES = ["/_next/", "/assets/", "/fonts/", "/events/"] as const;

type RequestMode = "remote-service-binding" | "public";

type ResponseHop = {
  url: string;
  status: number;
  location: string | null;
  contentType: string | null;
  bytes: number;
  headers: Record<string, string>;
};

type CapturedResponse = {
  label: string;
  mode: RequestMode;
  method: "GET" | "HEAD";
  requestedUrl: string;
  finalUrl: string;
  status: number | null;
  contentType: string | null;
  bytes: number;
  redirects: ResponseHop[];
  headers: Record<string, string>;
  error: string | null;
  externalRedirect: string | null;
  body: string;
};

type SerializableResponse = Omit<CapturedResponse, "body">;

const selectedHeaderNames = [
  "cache-control",
  "cf-cache-status",
  "cf-ray",
  "content-length",
  "content-type",
  "etag",
  "last-modified",
  "link",
  "location",
  "server",
  "vary",
  "x-content-type-options",
  "x-lilai-runtime-probe-request-url",
  "x-lilai-runtime-probe-upstream",
  "x-powered-by",
  "x-robots-tag",
];

function selectedHeaders(headers: Headers) {
  const result: Record<string, string> = {};
  for (const name of selectedHeaderNames) {
    const value = headers.get(name);
    if (value !== null) result[name] = value;
  }
  return result;
}

function transportUrl(publicUrl: URL, mode: RequestMode) {
  if (mode === "public") return publicUrl;
  return new URL(`${publicUrl.pathname}${publicUrl.search}`, PROBE_ORIGIN);
}

function isRedirect(status: number) {
  return status >= 300 && status < 400;
}

async function captureRequest(
  label: string,
  input: string,
  mode: RequestMode,
  method: "GET" | "HEAD" = "GET",
): Promise<CapturedResponse> {
  let current = new URL(input, PRODUCTION_ORIGIN);
  const requestedUrl = current.toString();
  const redirects: ResponseHop[] = [];
  const visited = new Set<string>();

  try {
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      if (visited.has(current.toString())) throw new Error(`redirect loop at ${current}`);
      visited.add(current.toString());

      const response = await fetch(transportUrl(current, mode), {
        method,
        redirect: "manual",
        headers: {
          Accept: method === "HEAD" ? "*/*" : "text/html,application/xhtml+xml,application/json,text/css,*/*;q=0.8",
          "User-Agent": "Lilai-Production-Runtime-Verification/1.0",
        },
      });
      const bytes = method === "HEAD" ? new Uint8Array() : new Uint8Array(await response.arrayBuffer());
      const location = response.headers.get("location");
      const hop: ResponseHop = {
        url: current.toString(),
        status: response.status,
        location,
        contentType: response.headers.get("content-type"),
        bytes: bytes.byteLength,
        headers: selectedHeaders(response.headers),
      };

      if (isRedirect(response.status) && location) {
        redirects.push(hop);
        const next = new URL(location, current);
        if (next.hostname.toLowerCase() !== new URL(PRODUCTION_ORIGIN).hostname) {
          return {
            label,
            mode,
            method,
            requestedUrl,
            finalUrl: current.toString(),
            status: response.status,
            contentType: response.headers.get("content-type"),
            bytes: bytes.byteLength,
            redirects,
            headers: selectedHeaders(response.headers),
            error: null,
            externalRedirect: next.toString(),
            body: new TextDecoder().decode(bytes),
          };
        }
        current = next;
        continue;
      }

      return {
        label,
        mode,
        method,
        requestedUrl,
        finalUrl: current.toString(),
        status: response.status,
        contentType: response.headers.get("content-type"),
        bytes: bytes.byteLength,
        redirects,
        headers: selectedHeaders(response.headers),
        error: null,
        externalRedirect: null,
        body: new TextDecoder().decode(bytes),
      };
    }
    throw new Error(`more than ${MAX_REDIRECTS} redirects`);
  } catch (error) {
    return {
      label,
      mode,
      method,
      requestedUrl,
      finalUrl: current.toString(),
      status: null,
      contentType: null,
      bytes: 0,
      redirects,
      headers: {},
      error: error instanceof Error ? error.message : String(error),
      externalRedirect: null,
      body: "",
    };
  }
}

function getAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'")
    .trim();
}

function extractMetadata(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  let canonical: string | null = null;
  let description: string | null = null;
  let robots: string | null = null;

  for (const tag of html.match(/<(?:meta|link)\b[^>]*>/gi) ?? []) {
    const rel = getAttribute(tag, "rel")?.toLowerCase();
    const name = getAttribute(tag, "name")?.toLowerCase();
    if (rel?.split(/\s+/).includes("canonical")) canonical = getAttribute(tag, "href");
    if (name === "description") description = getAttribute(tag, "content");
    if (name === "robots") robots = getAttribute(tag, "content");
  }

  return {
    canonical,
    title: title ? decodeEntities(title.replace(/<[^>]*>/g, "")) : null,
    description: description ? decodeEntities(description) : null,
    robots,
    correctPublicHostname: !/workers\.dev|pages\.dev|localhost|127\.0\.0\.1/i.test(
      [canonical, title, description].filter(Boolean).join(" "),
    ),
    nextStaticReferenceCount: (html.match(/\/_next\/static\//g) ?? []).length,
    googleTagReferences: [...new Set(html.match(/AW-\d+(?:\/[A-Za-z0-9_-]+)?|googletagmanager\.com/gi) ?? [])],
  };
}

function normalizeDependency(rawValue: string, baseUrl: string) {
  const value = decodeEntities(rawValue.trim().replace(/^['"]|['"]$/g, ""));
  if (!value || value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("#")) return null;
  try {
    const url = new URL(value, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function extractHtmlDependencies(html: string, baseUrl: string) {
  const dependencies = new Set<string>();
  for (const tag of html.match(/<(?:script|link|img|source|video|audio)\b[^>]*>/gi) ?? []) {
    const tagName = tag.match(/^<([a-z]+)/i)?.[1]?.toLowerCase();
    const rel = getAttribute(tag, "rel")?.toLowerCase().split(/\s+/) ?? [];
    const attributes = tagName === "link"
      ? (rel.some(value => ["stylesheet", "icon", "preload", "modulepreload", "manifest"].includes(value)) ? ["href"] : [])
      : ["src", "poster"];
    for (const attribute of attributes) {
      const value = getAttribute(tag, attribute);
      const url = value ? normalizeDependency(value, baseUrl) : null;
      if (url && url.hostname === new URL(PRODUCTION_ORIGIN).hostname) dependencies.add(url.toString());
    }
    const srcset = getAttribute(tag, "srcset");
    if (srcset) {
      for (const candidate of srcset.split(",")) {
        const url = normalizeDependency(candidate.trim().split(/\s+/)[0] ?? "", baseUrl);
        if (url && url.hostname === new URL(PRODUCTION_ORIGIN).hostname) dependencies.add(url.toString());
      }
    }
  }
  for (const dependency of extractCssDependencies(html, baseUrl)) dependencies.add(dependency);
  return dependencies;
}

function extractCssDependencies(css: string, baseUrl: string) {
  const dependencies = new Set<string>();
  for (const match of css.matchAll(/url\(\s*([^)]*?)\s*\)/gi)) {
    const url = normalizeDependency(match[1], baseUrl);
    if (url && url.hostname === new URL(PRODUCTION_ORIGIN).hostname) dependencies.add(url.toString());
  }
  for (const match of css.matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)["']?\s*\)?/gi)) {
    const url = normalizeDependency(match[1], baseUrl);
    if (url && url.hostname === new URL(PRODUCTION_ORIGIN).hostname) dependencies.add(url.toString());
  }
  return dependencies;
}

function isPlatformNamespace(url: string) {
  const path = new URL(url).pathname;
  return PLATFORM_PREFIXES.some(prefix => path.startsWith(prefix));
}

function expectedContentType(url: string) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".js") || pathname.endsWith(".mjs")) return /javascript/;
  if (pathname.endsWith(".css")) return /^text\/css\b/;
  if (pathname.endsWith(".woff2")) return /^font\/woff2\b/;
  if (pathname.endsWith(".woff")) return /^font\/woff\b/;
  if (pathname.endsWith(".svg")) return /^image\/svg\+xml\b/;
  if (pathname.endsWith(".png")) return /^image\/png\b/;
  if (pathname.endsWith(".webp")) return /^image\/webp\b/;
  if (pathname.endsWith(".jpe") || pathname.endsWith(".jpeg") || pathname.endsWith(".jpg")) return /^image\/jpeg\b/;
  if (pathname.endsWith(".gif")) return /^image\/gif\b/;
  if (pathname.endsWith(".mp4")) return /^video\/mp4\b/;
  return null;
}

function serializable(response: CapturedResponse): SerializableResponse {
  const { body: _body, ...rest } = response;
  return rest;
}

async function collectDependencies(
  seeds: Iterable<string>,
  mode: RequestMode,
  filter: (url: string) => boolean,
) {
  const pending = [...new Set(seeds)].filter(filter);
  const seen = new Set<string>();
  const responses: CapturedResponse[] = [];

  while (pending.length > 0) {
    const batch = pending.splice(0, 8).filter(url => !seen.has(url));
    if (batch.length === 0) continue;
    for (const url of batch) seen.add(url);
    const captured = await Promise.all(batch.map(url => captureRequest(`dependency ${new URL(url).pathname}`, url, mode)));
    responses.push(...captured);

    for (const response of captured) {
      if (response.status !== 200 || !response.body) continue;
      if (response.contentType?.toLowerCase().includes("text/css") || new URL(response.finalUrl).pathname.endsWith(".css")) {
        for (const dependency of extractCssDependencies(response.body, response.finalUrl)) {
          if (filter(dependency) && !seen.has(dependency)) pending.push(dependency);
        }
      }
    }
  }

  return responses;
}

function summarizeFailures(
  platformPages: CapturedResponse[],
  platformHeadChecks: CapturedResponse[],
  platformAssets: CapturedResponse[],
  negativeChecks: CapturedResponse[],
  wordpress: CapturedResponse[],
  signupPages: CapturedResponse[],
  signupAssets: CapturedResponse[],
  publicSeo: CapturedResponse[],
) {
  const failures: string[] = [];
  for (const response of platformPages) {
    if (response.error || response.status !== 200) failures.push(`${response.label}: expected final 200, received ${response.error ?? response.status}`);
    if (response.headers["x-lilai-runtime-probe-upstream"] !== "remote-service-binding:lilai-web-platform-router") {
      failures.push(`${response.label}: missing remote Service Binding evidence header`);
    }
  }
  for (const response of platformHeadChecks) {
    if (response.error || response.status !== 200 || response.bytes !== 0) {
      failures.push(`${response.label}: expected bodyless final 200, received ${response.error ?? `${response.status}/${response.bytes} bytes`}`);
    }
  }
  for (const response of platformAssets) {
    if (response.error || response.status !== 200 || response.bytes === 0) {
      failures.push(`${response.label}: expected non-empty 200 asset, received ${response.error ?? `${response.status}/${response.bytes} bytes`}`);
    }
    const expected = expectedContentType(response.finalUrl);
    if (expected && !expected.test(response.contentType ?? "")) {
      failures.push(`${response.label}: unexpected Content-Type ${response.contentType ?? "missing"}`);
    }
  }
  for (const response of negativeChecks) {
    if (response.error || response.status !== 404) failures.push(`${response.label}: expected 404, received ${response.error ?? response.status}`);
  }
  const expectedWordPressStatuses = [200, 200, 200, 404, 200, 200, 200];
  wordpress.forEach((response, index) => {
    if (response.error || response.status !== expectedWordPressStatuses[index]) {
      failures.push(`${response.label}: expected ${expectedWordPressStatuses[index]}, received ${response.error ?? response.status}`);
    }
    if (response.redirects.length > MAX_REDIRECTS) failures.push(`${response.label}: unexpected redirect loop`);
  });
  for (const response of signupPages) {
    if (response.error || response.status !== 200) failures.push(`${response.label}: expected final 200, received ${response.error ?? response.status}`);
  }
  const signupQuery = signupPages.find(response => response.label === "signup query");
  if (signupQuery) {
    const requested = new URL(signupQuery.requestedUrl);
    const final = new URL(signupQuery.finalUrl);
    if (signupQuery.redirects.length !== 1 || signupQuery.redirects[0]?.status !== 301) {
      failures.push(`signup query: expected one 301 slash redirect, received ${signupQuery.redirects.length} hops`);
    }
    if (final.pathname !== "/language-school-signup/" || final.search !== requested.search) {
      failures.push(`signup query: redirect did not preserve path/query (${signupQuery.finalUrl})`);
    }
  }
  for (const response of signupAssets) {
    if (response.error || response.status !== 200 || response.bytes === 0) {
      failures.push(`${response.label}: expected non-empty 200 asset, received ${response.error ?? `${response.status}/${response.bytes} bytes`}`);
    }
    const expected = expectedContentType(response.finalUrl);
    if (expected && !expected.test(response.contentType ?? "")) {
      failures.push(`${response.label}: unexpected Content-Type ${response.contentType ?? "missing"}`);
    }
  }
  for (const response of publicSeo) {
    if (response.error || response.status !== 200) failures.push(`${response.label}: expected 200, received ${response.error ?? response.status}`);
  }
  return failures;
}

async function main() {
  assert.equal(new URL(PROBE_ORIGIN).hostname, "127.0.0.1", "RUNTIME_PROBE_ORIGIN must use 127.0.0.1");

  const platformPaths = [
    "/",
    "/?utm_source=runtime-test",
    "/events",
    "/events/",
    "/events/daydream-adventure-2027/",
    "/consult",
    "/consult/",
  ];
  const platformPages = await Promise.all(
    platformPaths.map(path => captureRequest(`platform ${path}`, path, "remote-service-binding")),
  );
  const platformHeadChecks = await Promise.all([
    captureRequest("platform HEAD /", "/", "remote-service-binding", "HEAD"),
    captureRequest("platform HEAD event", "/events/daydream-adventure-2027/", "remote-service-binding", "HEAD"),
  ]);

  const dependencySeeds = new Set<string>();
  for (const response of platformPages) {
    if (response.status === 200 && response.contentType?.includes("text/html")) {
      for (const dependency of extractHtmlDependencies(response.body, response.finalUrl)) dependencySeeds.add(dependency);
    }
  }
  const platformAssets = await collectDependencies(dependencySeeds, "remote-service-binding", () => true);

  const negativeChecks = await Promise.all([
    captureRequest("missing Platform asset", "/_next/static/runtime-probe-missing-20261009.js", "remote-service-binding"),
    captureRequest("nonexistent event slug", "/events/runtime-probe-missing-event-20261009/", "remote-service-binding"),
  ]);

  const wordpressPaths = [
    ["WordPress about", "/about/"],
    ["WordPress REST index", "/wp-json/"],
    ["WordPress article", "/ireland-bank-account-ppsn-tax-guide/"],
    ["WordPress unknown path", "/runtime-probe-unknown-wordpress-path-20261009/"],
    ["WordPress search query", "/?s=runtime-probe-no-match-20261009"],
    ["WordPress REST query route", "/?rest_route=/wp/v2/posts&per_page=1"],
    ["WordPress feed query", "/?feed=rss2"],
  ] as const;
  const wordpress = await Promise.all(
    wordpressPaths.map(([label, path]) => captureRequest(label, path, "remote-service-binding")),
  );

  const signupPages = await Promise.all([
    captureRequest("signup bare", "/language-school-signup", "public"),
    captureRequest("signup slash", "/language-school-signup/", "public"),
    captureRequest("signup query", "/language-school-signup?utm_source=runtime-test", "public"),
  ]);
  const signupDependencySeeds = new Set<string>();
  for (const response of signupPages) {
    if (response.status === 200 && response.contentType?.includes("text/html")) {
      for (const dependency of extractHtmlDependencies(response.body, response.finalUrl)) signupDependencySeeds.add(dependency);
    }
  }
  const signupAssets = await collectDependencies(signupDependencySeeds, "public", () => true);

  const publicSeo = await Promise.all([
    captureRequest("public robots.txt", "/robots.txt", "public"),
    captureRequest("public sitemap index", "/sitemap_index.xml", "public"),
    captureRequest("public post sitemap", "/post-sitemap.xml", "public"),
    captureRequest("public page sitemap", "/page-sitemap.xml", "public"),
  ]);

  const metadata = Object.fromEntries(platformPages.map(response => [
    new URL(response.requestedUrl).pathname + new URL(response.requestedUrl).search,
    extractMetadata(response.body),
  ]));
  const signupCollisions = signupAssets
    .filter(response => isPlatformNamespace(response.requestedUrl))
    .map(response => new URL(response.requestedUrl).pathname);
  const googleAdsRuntimeEvidence = {
    tagId: "AW-17610996814",
    consultationConversionSendTo: "AW-17610996814/Ynp6CPHkhe4cEM74yc1B",
    assetsContainingTagId: platformAssets
      .filter(result => result.body.includes("AW-17610996814"))
      .map(result => new URL(result.requestedUrl).pathname),
    assetsContainingConversionId: platformAssets
      .filter(result => result.body.includes("AW-17610996814/Ynp6CPHkhe4cEM74yc1B"))
      .map(result => new URL(result.requestedUrl).pathname),
    assetsContainingGoogleTagManager: platformAssets
      .filter(result => result.body.includes("googletagmanager.com"))
      .map(result => new URL(result.requestedUrl).pathname),
    limitation: "Bundle/source presence does not prove browser execution or conversion delivery on the production hostname.",
  };
  const publicSeoInspection = {
    robotsSitemapLines: publicSeo[0].body.split(/\r?\n/).filter(line => /^\s*Sitemap:/i.test(line.trim())),
    sitemapLocations: publicSeo.slice(1).flatMap(result => [...result.body.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(match => decodeEntities(match[1]))),
    eventUrlsInCheckedSitemaps: publicSeo.slice(1).flatMap(result => [...result.body.matchAll(/<loc>([^<]*\/events\/?[^<]*)<\/loc>/gi)].map(match => decodeEntities(match[1]))),
  };
  const failures = summarizeFailures(
    platformPages,
    platformHeadChecks,
    platformAssets,
    negativeChecks,
    wordpress,
    signupPages,
    signupAssets,
    publicSeo,
  );

  const evidence = {
    generatedAt: new Date().toISOString(),
    requestedProductionOrigin: PRODUCTION_ORIGIN,
    localProbeOrigin: PROBE_ORIGIN,
    remoteBindingTarget: "lilai-web-platform-router",
    platformPages: platformPages.map(serializable),
    platformHeadChecks: platformHeadChecks.map(serializable),
    metadata,
    dependencySummary: {
      extractedSeedCount: dependencySeeds.size,
      checkedCount: platformAssets.length,
      passedCount: platformAssets.filter(result => result.status === 200 && result.bytes > 0).length,
      failedCount: platformAssets.filter(result => result.status !== 200 || result.bytes === 0 || result.error).length,
      byNamespace: Object.fromEntries(PLATFORM_PREFIXES.map(prefix => [
        prefix,
        platformAssets.filter(result => new URL(result.requestedUrl).pathname.startsWith(prefix)).length,
      ])),
      outsidePlatformNamespaces: platformAssets.filter(result => !isPlatformNamespace(result.requestedUrl)).length,
      results: platformAssets.map(serializable),
    },
    negativeChecks: negativeChecks.map(serializable),
    wordpressFallback: wordpress.map(serializable),
    signup: {
      limitation: "Public checks exercise route precedence; Service Binding calls cannot prove the signup Worker wins public route matching.",
      pages: signupPages.map(serializable),
      dependencies: signupAssets.map(serializable),
      platformNamespaceCollisions: [...new Set(signupCollisions)].sort(),
    },
    publicSeo: publicSeo.map(serializable),
    publicSeoInspection,
    googleAdsRuntimeEvidence,
    failures,
  };

  const output = resolve(OUTPUT_PATH);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");

  console.log(`Wrote runtime evidence to ${output}`);
  console.log(`Platform pages: ${platformPages.filter(result => result.status === 200).length}/${platformPages.length} final 200`);
  console.log(`Platform assets: ${evidence.dependencySummary.passedCount}/${platformAssets.length} non-empty 200`);
  console.log(`Signup dependencies: ${signupAssets.filter(result => result.status === 200 && result.bytes > 0).length}/${signupAssets.length} non-empty 200`);
  console.log(`Signup namespace collisions: ${evidence.signup.platformNamespaceCollisions.length}`);
  console.log(`Verification failures: ${failures.length}`);
  for (const failure of failures) console.error(`FAIL ${failure}`);
  if (failures.length > 0) process.exitCode = 1;
}

void main();
