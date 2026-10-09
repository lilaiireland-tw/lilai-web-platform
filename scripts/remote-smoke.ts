// Manual, bounded HTTP smoke test. Never invoked by routine local QA or CI.
const AUTHORIZATION = "I_UNDERSTAND_CLOUDFLARE_USAGE";
const ORIGIN = "https://lilaiireland.com";
const MAX_REQUESTS = 10;

type SmokeCheck = {
  path: string;
  owner: "platform" | "wordpress" | "signup";
  contentType: RegExp;
  xmlContains?: RegExp;
};

const CHECKS: readonly SmokeCheck[] = [
  { path: "/", owner: "platform", contentType: /^text\/html\b/i },
  { path: "/events", owner: "platform", contentType: /^text\/html\b/i },
  { path: "/events/daydream-adventure-2027", owner: "platform", contentType: /^text\/html\b/i },
  { path: "/consult", owner: "platform", contentType: /^text\/html\b/i },
  { path: "/events-sitemap.xml", owner: "platform", contentType: /xml/i, xmlContains: /<loc>\s*https:\/\/lilaiireland\.com\/events\s*<\/loc>/i },
  { path: "/study-in-ireland-guide/", owner: "wordpress", contentType: /^text\/html\b/i },
  { path: "/sitemap_index.xml", owner: "wordpress", contentType: /xml/i, xmlContains: /<sitemapindex\b/i },
  { path: "/language-school-signup?utm_source=smoke", owner: "signup", contentType: /^text\/html\b/i },
];

if (process.env.ALLOW_REMOTE_QA !== AUTHORIZATION) {
  console.error("Remote smoke test is DISABLED by default. To authorize this one invocation:");
  console.error("  ALLOW_REMOTE_QA=" + AUTHORIZATION + " npm run qa:remote-smoke");
  process.exit(1);
}
if (CHECKS.length > MAX_REQUESTS) throw new Error("The remote smoke allowlist exceeds the hard 10-request cap.");

console.warn("WARNING: this command calls the live public hostname. Each client request may trigger multiple Worker/Service Binding invocations.");
console.warn("Run only after an approved cutover, with available quota and an operator ready to roll back.");

let requestCount = 0;
let failed = false;

try {
  for (const check of CHECKS) {
    const url = new URL(check.path, ORIGIN);
    if (url.origin !== ORIGIN) throw new Error("Unsafe smoke target: " + url);
    if (requestCount >= MAX_REQUESTS) throw new Error("Hard request limit exceeded.");

    requestCount += 1;
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    const status = response.status;
    const mime = response.headers.get("content-type") ?? "";
    const openNext = response.headers.get("x-opennext");

    if (check.owner === "signup" && status >= 300 && status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error(check.path + ": redirect has no Location");
      const target = new URL(location, url);
      if (target.origin !== ORIGIN ||
          !["/language-school-signup", "/language-school-signup/"].includes(target.pathname) ||
          target.searchParams.get("utm_source") !== "smoke") {
        throw new Error(check.path + ": unexpected signup redirect: " + location);
      }
    } else {
      if (status !== 200) throw new Error(check.path + ": expected HTTP 200; got " + status);
      if (!check.contentType.test(mime)) throw new Error(check.path + ": unexpected Content-Type " + mime);
      if (check.owner === "platform" && openNext !== "1") {
        throw new Error(check.path + ": missing x-opennext: 1; public traffic may not reach the Platform");
      }
      if (check.owner === "wordpress" && openNext === "1") {
        throw new Error(check.path + ": unexpectedly handled by the Next.js Platform");
      }
      if (check.xmlContains) {
        const xml = await response.text();
        if (!check.xmlContains.test(xml)) throw new Error(check.path + ": missing expected sitemap XML content");
      }
    }
    if (!check.xmlContains) await response.body?.cancel();
    console.log("PASS " + status + " " + check.path + " (" + check.owner + ")");
  }
} catch (error) {
  failed = true;
  console.error("FAIL: " + (error instanceof Error ? error.message : String(error)));
  console.error("STOP. Investigate route ownership and use the approved rollback if public traffic is affected.");
} finally {
  console.log("Client-initiated HTTP requests: " + requestCount + "/" + MAX_REQUESTS + " (fixed allowlist: " + CHECKS.length + ")");
}

if (failed) process.exitCode = 1;
