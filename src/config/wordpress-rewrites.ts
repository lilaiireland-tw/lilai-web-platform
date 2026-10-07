// Existing Next rewrites, also used by the staging edge to preserve origin
// redirects and stream rewritten responses through its noindex wrapper.
export const wordpressRewritePrefixes = [
  "/wp-json", "/wp-content", "/wp-admin", "/cart", "/checkout", "/my-account",
] as const;

export function isWordPressRewrite(pathname: string) {
  return wordpressRewritePrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
