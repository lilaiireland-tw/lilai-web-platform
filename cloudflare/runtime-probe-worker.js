const PRODUCTION_ORIGIN = "https://lilaiireland.com";
const SAFE_METHODS = new Set(["GET", "HEAD"]);

export default {
  async fetch(request, env) {
    if (!SAFE_METHODS.has(request.method)) {
      return new Response("Production runtime probe permits only GET and HEAD", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, PRODUCTION_ORIGIN);
    const headers = new Headers(request.headers);

    for (const name of [
      "host",
      "origin",
      "referer",
      "cf-connecting-ip",
      "cf-ipcountry",
      "cf-ray",
      "cf-visitor",
      "forwarded",
      "x-forwarded-for",
      "x-forwarded-host",
      "x-forwarded-proto",
    ]) {
      headers.delete(name);
    }

    const upstream = await env.ROUTER.fetch(new Request(targetUrl, {
      method: request.method,
      headers,
      redirect: "manual",
    }));

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set(
      "x-lilai-runtime-probe-upstream",
      "remote-service-binding:lilai-web-platform-router",
    );
    responseHeaders.set("x-lilai-runtime-probe-request-url", targetUrl.toString());

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  },
};
