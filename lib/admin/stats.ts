import type { Product } from "@/lib/products";
import { CATEGORIES } from "@/lib/constants";

export interface CategoryStat {
  name: string;
  total: number;
  published: number;
  drafts: number;
}

export interface HealthIssue {
  id: string;
  label: string;
  products: Pick<Product, "id" | "name">[];
}

const DAY = 86_400_000;

export function computeStats(products: Product[]) {
  const published = products.filter((p) => p.status === "Published");
  const drafts = products.filter((p) => p.status === "Draft");
  const prices = published.map((p) => Number(p.price));
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  const categories: CategoryStat[] = CATEGORIES.map((name) => {
    const inCat = products.filter((p) => p.category === name);
    return {
      name,
      total: inCat.length,
      published: inCat.filter((p) => p.status === "Published").length,
      drafts: inCat.filter((p) => p.status === "Draft").length,
    };
  });
  // Products whose category is not in the known list (e.g. legacy spelling).
  const unknown = products.filter((p) => !(CATEGORIES as readonly string[]).includes(p.category));

  // Products added per month, last 6 months (oldest → newest).
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en-IN", { month: "short" }), count: 0 };
  });
  for (const p of products) {
    const d = new Date(p.created_at);
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) m.count += 1;
  }

  const issues: HealthIssue[] = [
    { id: "no-desc", label: "Missing description", products: products.filter((p) => !p.description?.trim()) },
    { id: "no-zoom", label: "Missing texture image", products: products.filter((p) => !p.zoom_image_url) },
    { id: "stale-draft", label: "Drafts older than 14 days", products: drafts.filter((p) => Date.now() - new Date(p.created_at).getTime() > 14 * DAY) },
    { id: "unknown-cat", label: "Unrecognised category", products: unknown },
  ].filter((i) => i.products.length > 0);

  return {
    total: products.length,
    published: published.length,
    drafts: drafts.length,
    avgPrice,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    categories,
    emptyCategories: categories.filter((c) => c.published === 0),
    months,
    issues,
    recent: products.slice(0, 5),
  };
}

export const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
