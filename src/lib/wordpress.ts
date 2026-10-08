import type { WordPressContentItem, WordPressMedia, WordPressTerm } from "@/types/wordpress";

const WP_API_BASE = process.env.WORDPRESS_API_BASE || "https://cms.lilaiireland.com/wp-json/wp/v2";

async function wpFetch<T>(path: string, revalidate = 300): Promise<T> {
  if (process.env.SITE_DEPLOYMENT_ENV === "staging") {
    throw new Error("WordPress is unavailable in standalone staging");
  }
  const res = await fetch(`${WP_API_BASE}${path}`, {
    next: { revalidate }
  });

  if (!res.ok) {
    throw new Error(`WordPress API request failed: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function getPostBySlug(slug: string) {
  const posts = await wpFetch<WordPressContentItem[]>(
    `/posts?slug=${encodeURIComponent(slug)}&_embed=1`
  );
  return posts[0] ?? null;
}

export async function getPageBySlug(slug: string) {
  const pages = await wpFetch<WordPressContentItem[]>(
    `/pages?slug=${encodeURIComponent(slug)}&_embed=1`
  );
  return pages[0] ?? null;
}

export async function getAllPostSlugs() {
  const posts = await wpFetch<Array<Pick<WordPressContentItem, "slug" | "modified">>>(
    "/posts?per_page=100&_fields=slug,modified",
    600
  );
  return posts.map(post => ({ slug: post.slug, modified: post.modified }));
}

export async function getAllPageSlugs() {
  const pages = await wpFetch<Array<Pick<WordPressContentItem, "slug" | "modified">>>(
    "/pages?per_page=100&_fields=slug,modified",
    600
  );
  return pages.map(page => ({ slug: page.slug, modified: page.modified }));
}

export function getFeaturedImage(item: WordPressContentItem): WordPressMedia | null {
  return item._embedded?.["wp:featuredmedia"]?.[0] ?? null;
}

export async function getCategories() {
  return wpFetch<WordPressTerm[]>("/categories?per_page=100", 600);
}
