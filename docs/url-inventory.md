# Lilai Ireland URL Inventory

Generated: 2026-07-20

Assessment entry update (2026-11-24, Issues #61/#62): `/free-departure-assessment/` is retired. The only current assessment entry is `/consult`; `/consult/` retains its existing 308 redirect to `/consult`. Homepage source links and Platform sitemap entries use the current entry. The historical audit below does not establish the current external WordPress state; operations must check any remaining WP form and WP-served sitemap manually. No WordPress page or routing was changed.

Constraint: public URLs must be preserved exactly. This inventory is based only on public sitemap and public REST API data. No WordPress admin credentials were used.

## Sources Audited

| Source | Result |
|---|---:|
| `https://lilaiireland.com/sitemap_index.xml` | 3 child sitemaps |
| `https://lilaiireland.com/post-sitemap.xml` | 7 URLs |
| `https://lilaiireland.com/page-sitemap.xml` | 8 URLs |
| `https://lilaiireland.com/category-sitemap.xml` | 1 URL |
| `/wp-json/wp/v2/posts?per_page=100` | 6 posts |
| `/wp-json/wp/v2/pages?per_page=100` | 10 pages |
| `/wp-json/wp/v2/categories?per_page=100` | 2 categories |
| `/wp-json/wp/v2/tags?per_page=100` | 56 tags |
| `/wp-json/wp/v2/media?per_page=100` | 44 media items |
| `/wp-json/wc/store/v1/products` | 0 products |

## Child Sitemaps

| Sitemap | Last modified |
|---|---|
| `https://lilaiireland.com/post-sitemap.xml` | `2026-07-20T07:38:00+00:00` |
| `https://lilaiireland.com/page-sitemap.xml` | `2026-07-09T20:20:33+00:00` |
| `https://lilaiireland.com/category-sitemap.xml` | `2026-07-18T17:27:04+00:00` |

## Canonical URL Inventory

| URL | Route type | Source | WP slug / object | Recommended handling | Notes |
|---|---|---|---|---|---|
| `/` | Homepage | post sitemap, page sitemap | homepage/front page | Render in Next.js | Current custom homepage should replace WP frontend. Preserve `/`. |
| `/about/` | Page | page sitemap, REST pages | `about` | Render in Next.js or WP API fallback | Existing title: `哩來品牌故事`. |
| `/consult` | Page / lead form | Current Platform entry; historically `/consult/` in page sitemap / REST pages | `consult` | Render in Next.js | 唯一正式免費評估入口；`/consult/` 保留現有 308 至 `/consult`。 |
| `/free-departure-assessment/` | Retired assessment entry | Historical homepage links | `free-departure-assessment` | Exclude from Platform links and sitemap | 營運已確認停用；外部 WP 頁面／sitemap 是否仍存在待人工檢查，未新增 redirect 或修改 WP。 |
| `/ireland-study-consultation/` | Page | page sitemap, REST pages | `ireland-study-consultation` | Render in Next.js or WP API fallback | Existing title: `出發方案選擇`. |
| `/ireland-study-planning/` | Page | page sitemap, REST pages | `ireland-study-planning` | Render in Next.js or WP API fallback | Existing title: `規劃出發流程`. |
| `/recommended-ireland-language-schools/` | Page | page sitemap, REST pages | `recommended-ireland-language-schools` | Render in Next.js or WP API fallback | Title is empty in REST output. Needs metadata check. |
| `/agreement/` | Page / legal | page sitemap, REST pages | `agreement` | Render in Next.js or WP API fallback | Existing title: `隱私權政策`. |
| `/shop/` | Shop archive / system page | page sitemap, REST pages | `shop` | Proxy or link back to WordPress in phase 1 | Woo Store API returned no products. Do not rebuild until products are visible. |
| `/cart/` | WooCommerce system page | REST pages | `cart` | Proxy to WordPress | Noindex. Needs Woo session/payment testing. |
| `/checkout/` | WooCommerce system page | REST pages | `checkout` | Proxy to WordPress | Noindex. Do not rebuild in phase 1. |
| `/my-account/` | WooCommerce system page | REST pages | `my-account` | Proxy to WordPress | Noindex. Preserve member/download behavior. |
| `/ireland-bank-account-ppsn-tax-guide/` | Post | post sitemap, REST posts | `ireland-bank-account-ppsn-tax-guide` | Render via Next.js WP API fallback | Existing SEO article. High priority. |
| `/ireland-study-city-guide/` | Post | post sitemap, REST posts | `ireland-study-city-guide` | Render via Next.js WP API fallback | Existing SEO article. High priority. |
| `/ireland-study-agent-questions/` | Post | post sitemap, REST posts | `ireland-study-agent-questions` | Render via Next.js WP API fallback | Existing SEO article. High priority. |
| `/dublin-renting-guide-taiwan/` | Post | post sitemap, REST posts | `dublin-renting-guide-taiwan` | Render via Next.js WP API fallback | Existing SEO article. High priority. |
| `/__trashed-8/` | Post-like URL in sitemap | post sitemap, REST posts | `__trashed-8` | Audit before launch | This looks like a trashed slug but is public in sitemap/API. Do not delete route blindly; decide whether to preserve as 200, redirect to final slug, or remove from WP sitemap before DNS cutover. |
| `/__trashed-9/` | Post-like URL in sitemap | post sitemap, REST posts | `__trashed-9` | Audit before launch | Same risk as `__trashed-8`. |
| `/category/ireland-study-abroad-info/` | Category archive | category sitemap, REST categories | `ireland-study-abroad-info` | Render in Next.js | Count: 6. Should list posts in this category. |
| `/category/life-in-ireland/` | Category archive | REST categories | `life-in-ireland` | Optional: render or 404/noindex after SEO review | Count: 0 and not in sitemap. Preserve only if it has external/internal links. |
| `/tag/*/` | Tag archives | REST tags | 56 tag slugs | Phase 2: render or noindex strategy | 43 tags have post count > 0. Not present in sitemap index, but public archive URLs exist. |
| `/wp-content/uploads/*` | Media asset URLs | REST media | 44 recent media items | Proxy to WordPress | Must keep image URLs readable. |
| `/wp-json/*` | REST API | public WP API | n/a | Proxy to WordPress | Required for frontend data fetching and preview testing. |
| `/wp-admin/*` | Admin/system | WordPress | n/a | Redirect/proxy to WordPress origin | Not a frontend route. |

## REST Posts

| URL | Slug | Date | Title |
|---|---|---|---|
| `/dublin-renting-guide-taiwan/` | `dublin-renting-guide-taiwan` | `2026-06-23T20:57:03` | 都柏林租房完整攻略｜2025–2026 台灣人實戰指南｜哩來愛爾蘭 |
| `/ireland-study-agent-questions/` | `ireland-study-agent-questions` | `2026-06-25T14:07:20` | 出發前，你一定要問代辦的 5 個問題｜愛爾蘭遊學代辦選擇完全指南 |
| `/ireland-study-city-guide/` | `ireland-study-city-guide` | `2026-06-29T15:27:33` | 都柏林 vs 高威 vs 科克｜愛爾蘭遊學城市選擇完全指南：台灣人視角的四點評估 |
| `/ireland-bank-account-ppsn-tax-guide/` | `ireland-bank-account-ppsn-tax-guide` | `2026-07-01T23:13:27` | 愛爾蘭銀行開戶完整指南｜2025–2026 台灣人實戰手冊（含 PPSN、退稅串接全流程） |
| `/__trashed-9/` | `__trashed-9` | `2026-07-18T17:38:22` | 2026 愛爾蘭打工度假完整攻略｜申請時間、名額、財力證明全解析（含 Alex 2023 年實際申請經驗） |
| `/__trashed-8/` | `__trashed-8` | `2026-07-20T08:38:00` | 哩來愛打心得系列：Alex 的愛爾蘭打工度假故事｜2026最新心得，比dcard更真實的第一手經驗 |

## REST Pages

| URL | Slug | Date | Title | Route type |
|---|---|---|---|---|
| `/about/` | `about` | `2026-02-08T16:46:17` | 哩來品牌故事 | Content page |
| `/shop/` | `shop` | `2026-03-11T15:26:20` | 商店 | WooCommerce shop/system |
| `/my-account/` | `my-account` | `2026-03-11T15:26:21` | 我的帳號 | WooCommerce system |
| `/checkout/` | `checkout` | `2026-03-11T15:26:21` | 結帳 | WooCommerce system |
| `/cart/` | `cart` | `2026-03-11T15:26:21` | 購物車 | WooCommerce system |
| `/agreement/` | `agreement` | `2026-06-02T10:20:48` | 隱私權政策 | Legal page |
| `/consult/` | `consult` | `2026-06-23T23:28:27` | 哩來出發計畫｜免費語校評估 | Lead page |
| `/ireland-study-planning/` | `ireland-study-planning` | `2026-07-07T22:01:57` | 規劃出發流程 | Content page |
| `/ireland-study-consultation/` | `ireland-study-consultation` | `2026-07-07T23:27:46` | 出發方案選擇 | Lead/service page |
| `/recommended-ireland-language-schools/` | `recommended-ireland-language-schools` | `2026-07-09T01:53:52` | Empty in REST output | Content page / school listing |

## Categories

| URL | Slug | Count | Name | Sitemap status |
|---|---|---:|---|---|
| `/category/ireland-study-abroad-info/` | `ireland-study-abroad-info` | 6 | 哩來遊學情報站 | In sitemap |
| `/category/life-in-ireland/` | `life-in-ireland` | 0 | 愛爾蘭生活 | Not in sitemap |

## Non-Empty Tag Archives

These URLs are public through REST tag objects. They are not listed in the child sitemaps found in `sitemap_index.xml`.

| Pattern | Count |
|---|---:|
| `/tag/{tag-slug}/` | 43 non-empty tags |

Highest-count examples:

| URL | Count | Name |
|---|---:|---|
| `/tag/%e6%84%9b%e7%88%be%e8%98%ad%e6%89%93%e5%b7%a5%e9%81%8a%e5%ad%b8/` | 3 | 愛爾蘭打工遊學 |
| `/tag/%e6%84%9b%e7%88%be%e8%98%ad%e8%aa%9e%e8%a8%80%e5%ad%b8%e6%a0%a1/` | 3 | 愛爾蘭語言學校 |
| `/tag/ireland-working-holiday/` | 2 | 愛爾蘭打工度假 |
| `/tag/alex/` | 2 | Alex |
| `/tag/%e6%84%9b%e7%88%be%e8%98%ad%e9%81%8a%e5%ad%b8/` | 2 | 愛爾蘭遊學 |

## Products and Product Categories

`/wp-json/wc/store/v1/products` returned an empty array.

No product URLs and no product category URLs were discovered from the required public sources. The existing `/shop/`, `/cart/`, `/checkout/`, and `/my-account/` URLs still exist as WordPress/WooCommerce pages.

## Media

The media endpoint returned 44 recent media records. These are not content pages, but their public URLs under `/wp-content/uploads/*` must remain readable after the frontend migration.

Route handling: proxy `/wp-content/:path*` to the WordPress origin.

## Key Risks Found

| Risk | Severity | Detail | Action |
|---|---|---|---|
| `__trashed-8` and `__trashed-9` are public | High | Both appear in sitemap/API as post URLs. | Confirm intended final slugs before DNS cutover. Either preserve exact URLs, 301 to correct slugs, or remove from WP sitemap if truly unwanted. |
| Homepage appears in both post and page sitemap | Medium | Rank Math exposes `/` in two child sitemaps. | Next sitemap should include `/` only once. |
| Woo Store API returns no products | Medium | Product rendering cannot be verified from public Store API. | Keep Woo routes proxied in phase 1. Revisit product API after products are published or API visibility is fixed. |
| Tag archives are public but not in sitemap | Medium | 56 tag routes exist, 43 non-empty. | Decide whether to render tag archives, noindex them, or redirect. Do not accidentally 404 indexed tags without GSC review. |
