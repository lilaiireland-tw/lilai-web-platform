// Unconditional for this staging-only Worker, including redirects and errors.
// Stream the body and preserve status, cookies and all other origin headers.
export async function stagingResponse(handle: () => Promise<Response>): Promise<Response> {
  let response: Response;
  try {
    response = await handle();
  } catch {
    console.error(JSON.stringify({ message: "Staging request failed" }));
    response = new Response("Staging request failed", { status: 500 });
  }
  const result = new Response(response.body, response);
  result.headers.set("X-Robots-Tag", "noindex, nofollow");
  return result;
}
