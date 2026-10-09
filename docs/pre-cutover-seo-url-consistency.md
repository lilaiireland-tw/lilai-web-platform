# Pre-cutover SEO URL consistency

## URL policy

The production runtime check found that `/consult`, `/events`, and event detail
pages are served at slashless URLs and that slash-suffixed requests receive a
308 redirect to the slashless URL. Platform canonicals, internal event links,
and Platform sitemap entries now use those directly served URLs. The global
Next.js `trailingSlash` setting remains unchanged, and WordPress-owned
permalinks retain their existing slash behavior.

Query strings are retained when a slash-suffixed alias redirects. Automated
regression checks cover direct 200 responses for canonical URLs, redirects,
canonical metadata, robots directives, and sitemap membership.

## Sitemap discovery

WordPress remains the owner of `/robots.txt`, `/sitemap_index.xml`, and
`/sitemap.xml`. The exact `/events-sitemap.xml` path is owned by the Platform.
The event sitemap lists `/events` and only event detail pages whose production
event policy is indexable. Daydream continues to emit `noindex, follow` and is
excluded from the sitemap.

After an approved public cutover, manually submit
`https://lilaiireland.com/events-sitemap.xml` in Google Search Console so its
event discovery status is visible independently of the WordPress sitemap
index because the WordPress-owned `robots.txt` and sitemap index remain
unchanged. Keep the existing Search Console property and verification in place.
This change does not alter verification tokens or WordPress sitemap settings.

## Remaining launch checks

Both GitHub validation workflows passed on Node 22 Linux, including the
production OpenNext build and packaging checks. The equivalent local
OpenNext command fails on this Windows/Node 24 environment with child-process
exit `3221226505`.

- Complete desktop and mobile browser checks for overflow, sticky shell,
  focus-visible behavior, console errors, and hydration errors.
- After the production hostname can safely reach the Platform, use Tag
  Assistant to confirm `AW-17610996814` initializes once. Do not submit the
  consultation form or fire the conversion during verification; the existing
  conversion identifier remains `AW-17610996814/Ynp6CPHkhe4cEM74yc1B`.
- During an approved cutover window, verify public signup, WordPress fallback,
  assets, and route precedence, with rollback ready.

This change does not deploy Production, modify live WordPress, alter Cloudflare
Routes, or perform public cutover.
