import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Product } from "@/lib/products";

export const PAGE_SIZE = 10;

export const SORT_OPTIONS = {
  newest: { label: "Newest first", column: "created_at", ascending: false },
  oldest: { label: "Oldest first", column: "created_at", ascending: true },
  "price-desc": { label: "Price: high to low", column: "price", ascending: false },
  "price-asc": { label: "Price: low to high", column: "price", ascending: true },
  name: { label: "Name A–Z", column: "name", ascending: true },
} as const;
export type SortKey = keyof typeof SORT_OPTIONS;

export interface ProductFilters {
  q?: string;
  status?: string;
  category?: string;
  sort?: string;
  page?: number;
}

export async function listProducts(f: ProductFilters) {
  const sort = SORT_OPTIONS[(f.sort as SortKey) in SORT_OPTIONS ? (f.sort as SortKey) : "newest"];
  const page = Math.max(1, f.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = getSupabaseAdmin()
    .from("products")
    .select("*", { count: "exact" })
    .order(sort.column, { ascending: sort.ascending })
    .range(from, from + PAGE_SIZE - 1);

  if (f.status === "Published" || f.status === "Draft") query = query.eq("status", f.status);
  if (f.category) query = query.eq("category", f.category);
  // Strip PostgREST filter syntax characters before embedding in an .or() expression.
  const q = (f.q ?? "").replace(/[^\p{L}\p{N}\s\-_.]/gu, "").trim().slice(0, 60);
  if (q) query = query.or(`name.ilike.%${q}%,tag.ilike.%${q}%,material.ilike.%${q}%`);

  try {
    const { data, count, error } = await query;
    if (error) return { products: [] as Product[], total: 0, page, error: error.message };
    return { products: (data ?? []) as Product[], total: count ?? 0, page, error: null };
  } catch (err) {
    return { products: [] as Product[], total: 0, page, error: err instanceof Error ? err.message : "Database unreachable" };
  }
}

export async function getAllProducts() {
  try {
    const { data, error } = await getSupabaseAdmin().from("products").select("*").order("created_at", { ascending: false });
    if (error) return { products: [] as Product[], error: error.message };
    return { products: (data ?? []) as Product[], error: null };
  } catch (err) {
    return { products: [] as Product[], error: err instanceof Error ? err.message : "Database unreachable" };
  }
}
