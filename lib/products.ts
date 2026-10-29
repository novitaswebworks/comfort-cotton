import { createClient } from "@supabase/supabase-js";

export interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  material: string;
  description: string | null;
  tag: string;
  category: string;
  status: "Published" | "Draft";
  image_url: string;
  zoom_image_url: string;
  pillow_image_url: string;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
  sale_price: number | null;
  created_at: string;
}

export type Result<T> = { data: T; error: null } | { data: null; error: string };

// Cookie-free anon client: the public catalogue needs no session, which lets
// pages be statically cached and revalidated instead of rendered per request.
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function run<T>(query: () => PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<Result<T>> {
  try {
    const { data, error } = await query();
    if (error || data === null) return { data: null, error: error?.message ?? "No data returned" };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Catalogue unavailable" };
  }
}

export function getPublishedProducts(limit?: number) {
  return run<Product[]>(() => {
    const q = publicClient().from("products").select("*").eq("status", "Published").order("featured", { ascending: false }).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    return (limit ? q.limit(limit) : q) as PromiseLike<{ data: Product[] | null; error: { message: string } | null }>;
  });
}

export function getProductsByCategory(category: string) {
  return run<Product[]>(
    () =>
      publicClient()
        .from("products")
        .select("*")
        .eq("category", category)
        .eq("status", "Published")
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }) as PromiseLike<{ data: Product[] | null; error: { message: string } | null }>,
  );
}

export async function getProductByTag(tag: string): Promise<Result<Product | null>> {
  try {
    const { data, error } = await publicClient()
      .from("products")
      .select("*")
      .eq("tag", tag)
      .eq("status", "Published")
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: (data as Product | null) ?? null, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Catalogue unavailable" };
  }
}

export function getRelatedProducts(product: Pick<Product, "id" | "category">, limit = 3) {
  return run<Product[]>(
    () =>
      publicClient()
        .from("products")
        .select("*")
        .eq("category", product.category)
        .eq("status", "Published")
        .neq("id", product.id)
        .limit(limit) as PromiseLike<{ data: Product[] | null; error: { message: string } | null }>,
  );
}

type CartProduct = Pick<Product, "id" | "name" | "price" | "sale_price" | "tag" | "image_url">;

/** Published, in-stock products only: anything else should drop out of a customer's cart. */
export function getPublishedProductsByIds(ids: string[]) {
  return run<CartProduct[]>(
    () =>
      publicClient()
        .from("products")
        .select("id,name,price,sale_price,tag,image_url")
        .in("id", ids)
        .eq("status", "Published")
        .eq("in_stock", true) as PromiseLike<{ data: CartProduct[] | null; error: { message: string } | null }>,
  );
}
