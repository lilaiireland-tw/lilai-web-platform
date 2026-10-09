const AUTHORIZATION = "I_UNDERSTAND_CLOUDFLARE_USAGE";
export {};
const ORIGIN = "https://lilaiireland.com";
const MAX_REQUESTS = 10;
const PATHS = ["/", "/events", "/events/daydream-adventure-2027", "/consult", "/robots.txt"] as const;

if (process.env.ALLOW_REMOTE_QA !== AUTHORIZATION) {
  console.error("Remote smoke test is disabled. Explicitly authorize with:");
  console.error(`  ALLOW_REMOTE_QA=${AUTHORIZATION} npm run qa:remote-smoke`);
  process.exit(1);
}
if (PATHS.length > MAX_REQUESTS) throw new Error("Remote smoke allowlist exceeds the 10-request limit.");

console.warn("WARNING: this manual check contacts Cloudflare Production. Service Bindings can cause additional downstream Worker invocations.");
let requestCount = 0;
let failed = false;

try {
  for (const pathname of PATHS) {
    const url = new URL(pathname, ORIGIN);
    if (url.origin !== ORIGIN || !PATHS.includes(url.pathname as typeof PATHS[number])) throw new Error(`URL is outside the fixed allowlist: ${url}`);
    if (requestCount >= MAX_REQUESTS) throw new Error("Request cap reached before allowlist completed.");
    requestCount += 1;
    const response = await fetch(url, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(15_000) });
    console.log(`${response.status} GET ${url.pathname}`);
    if (response.status < 200 || response.status >= 400) {
      console.error(`Critical smoke check failed at ${url.pathname}; stopping.`);
      failed = true;
      break;
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  failed = true;
} finally {
  console.log(`Client-initiated HTTP requests: ${requestCount} (maximum ${MAX_REQUESTS})`);
}

if (failed) process.exitCode = 1;
