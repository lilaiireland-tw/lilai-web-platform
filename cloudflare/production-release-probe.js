// Local-only remote-binding harness. Never deploy; never forward POST or admin requests.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/(platform|signup)(\/.*)$/);
    if (!match || !["GET", "HEAD"].includes(request.method) ||
        match[2].includes("/api/") ||
        !(match[2] === "/" || match[2].startsWith("/language-school-signup/") || /^\/(?:_next\/static\/|assets\/|fonts\/)/.test(match[2]))) {
      return new Response("Probe request denied", { status: 405 });
    }
    return env[match[1] === "platform" ? "PLATFORM" : "SIGNUP"].fetch(
      new Request(`https://lilaiireland.com${match[2]}${url.search}`, { method: request.method, redirect: "manual" }),
    );
  },
};
