type SignupEndpoint = "applications" | "turnstile-config";

function unavailable(message: string) {
  return Response.json({ error: { code: "signup_backend_unavailable", message } }, {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}

// Local bridge only. Production API ownership remains with the existing signup Worker.
export async function forwardLocalSignupRequest(request: Request, endpoint: SignupEndpoint) {
  const origin = process.env.SIGNUP_LOCAL_BACKEND_ORIGIN;
  if (process.env.NODE_ENV !== "development" || !origin) {
    return unavailable("本地報名後端尚未啟用，請設定 SIGNUP_LOCAL_BACKEND_ORIGIN 連接本機原報名 Worker。");
  }

  let backend: URL;
  try {
    backend = new URL(origin);
    if (backend.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(backend.hostname) ||
        backend.username || backend.password || backend.pathname !== "/" || backend.search || backend.hash) {
      throw new Error("Not a loopback origin");
    }
  } catch {
    return unavailable("本地報名後端只允許 http://localhost 或 http://127.0.0.1 的本機服務。");
  }

  const headers = new Headers();
  for (const name of ["Content-Type", "Idempotency-Key"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const response = await fetch(new URL(`/language-school-signup/api/${endpoint}`, backend), {
      method: request.method,
      headers,
      body: request.method === "POST" ? await request.text() : undefined,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (response.status >= 300 && response.status < 400) {
      return unavailable("本地報名後端回傳非預期轉址，請檢查本機 Worker 設定。");
    }
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
        ...(response.headers.has("Retry-After") ? { "Retry-After": response.headers.get("Retry-After")! } : {}),
      },
    });
  } catch {
    return unavailable("無法連接本地報名後端，請確認原報名 Worker 已啟動。");
  }
}
