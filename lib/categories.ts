/**
 * Storefront category routing.
 *
 * The Product model has no `category` column yet — we infer category from the
 * product name using a small keyword list per category. Good enough for v1:
 * gives the perception of full filter functionality without a backend change.
 * Replace with a real `Product.category` field when categories become a
 * merchant-facing concept (taxonomies, filters by attribute, etc).
 */

export const CATEGORIES = [
  { slug: "phones", name: "Phones" },
  { slug: "tablets", name: "Tablets" },
  { slug: "laptops", name: "Laptops" },
  { slug: "fashion", name: "Fashion" },
  { slug: "beauty", name: "Beauty" },
  { slug: "home", name: "Home" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

const KEYWORDS: Record<string, string[]> = {
  phones: ["phone", "iphone", "samsung", "pixel", "smartphone", "android", "infinix", "tecno", "oppo", "redmi"],
  tablets: ["tablet", "ipad"],
  laptops: ["laptop", "macbook", "thinkpad", "chromebook", "notebook"],
  fashion: ["shirt", "dress", "shoe", "sneaker", "jacket", "jeans", "hat", "sandal", "skirt", "fashion", "ankara", "agbada", "bag", "watch", "cap", "hoodie"],
  beauty: ["beauty", "cream", "makeup", "lipstick", "perfume", "skincare", "moisturizer", "cosmetic", "lotion", "scrub", "fragrance"],
  home: ["table", "chair", "sofa", "curtain", "lamp", "kitchen", "decor", "home", "rug", "blanket", "pillow", "candle"],
};

export function matchesCategory(productName: string, slug: string): boolean {
  const keywords = KEYWORDS[slug];
  if (!keywords) return false;
  const name = productName.toLowerCase();
  // Word-boundary match so "phones" doesn't pick up "headphones"/"earphones".
  // Also matches plural forms by tolerating a trailing 's'.
  return keywords.some((k) => {
    const safe = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${safe}s?\\b`).test(name);
  });
}

export function getCategoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
