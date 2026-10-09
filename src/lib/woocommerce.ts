import type { WooCommerceProduct } from "@/types/woocommerce";

const STORE_API_BASE =
  process.env.WOOCOMMERCE_STORE_API_BASE || "https://cms.lilaiireland.com/wp-json/wc/store/v1";

async function storeFetch<T>(path: string, revalidate = 300): Promise<T> {
  if (process.env.SITE_DEPLOYMENT_ENV === "staging") {
    throw new Error("WooCommerce is unavailable in standalone staging");
  }
  const res = await fetch(`${STORE_API_BASE}${path}`, {
    next: { revalidate }
  });

  if (!res.ok) {
    throw new Error(`WooCommerce Store API request failed: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function getProducts() {
  return storeFetch<WooCommerceProduct[]>("/products");
}

export async function getProductBySlug(slug: string) {
  const products = await storeFetch<WooCommerceProduct[]>(`/products?slug=${encodeURIComponent(slug)}`);
  return products[0] ?? null;
}
