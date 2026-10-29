import { CATEGORIES, PRODUCT_STATUSES } from "@/lib/constants";

export interface ProductInput {
  name: string;
  type: string;
  price: number;
  material: string;
  description: string | null;
  tag: string;
  category: string;
  status: (typeof PRODUCT_STATUSES)[number];
  image_url: string;
  zoom_image_url: string;
  pillow_image_url: string;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
  sale_price: number | null;
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

const isHttpUrl = (v: string) => /^https?:\/\/\S+$/i.test(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Validates and normalises admin-submitted product fields. `partial` allows omitting fields (updates). */
export function validateProduct(input: unknown, partial: boolean): ValidationResult<Partial<ProductInput>> {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid product data" };
  const raw = input as Record<string, unknown>;
  const out: Partial<ProductInput> = {};
  const has = (k: string) => raw[k] !== undefined;
  const need = (k: string) => !partial || has(k);

  for (const key of ["name", "type", "material"] as const) {
    if (!need(key)) continue;
    const v = str(raw[key]);
    if (!v) return { ok: false, error: `${key[0].toUpperCase()}${key.slice(1)} is required` };
    if (v.length > 200) return { ok: false, error: `${key} is too long (max 200 characters)` };
    out[key] = v;
  }

  if (need("price")) {
    const price = typeof raw.price === "number" ? raw.price : parseFloat(String(raw.price));
    if (!Number.isFinite(price) || price < 0 || price > 10_000_000) return { ok: false, error: "Price must be a number between 0 and 10,000,000" };
    out.price = Math.round(price * 100) / 100;
  }

  if (need("tag")) {
    const tag = str(raw.tag).toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9._-]{1,39}$/.test(tag)) return { ok: false, error: "Tag must be 2-40 characters: letters, numbers, ., - or _" };
    out.tag = tag;
  }

  if (need("category")) {
    const category = str(raw.category);
    if (!(CATEGORIES as readonly string[]).includes(category)) return { ok: false, error: "Unknown category" };
    out.category = category;
  }

  if (need("status")) {
    const status = str(raw.status) || "Published";
    if (!(PRODUCT_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Status must be Published or Draft" };
    out.status = status as ProductInput["status"];
  }

  if (has("description")) {
    const d = str(raw.description);
    if (d.length > 2000) return { ok: false, error: "Description is too long (max 2000 characters)" };
    out.description = d || null;
  }

  for (const key of ["in_stock", "featured"] as const) {
    if (!has(key)) continue;
    if (typeof raw[key] !== "boolean") return { ok: false, error: `${key} must be true or false` };
    out[key] = raw[key] as boolean;
  }

  if (has("sort_order")) {
    const n = Number(raw.sort_order);
    if (!Number.isInteger(n) || n < -9999 || n > 9999) return { ok: false, error: "Display order must be a whole number between -9999 and 9999" };
    out.sort_order = n;
  }

  if (has("sale_price")) {
    const blank = raw.sale_price === null || raw.sale_price === "" || Number.isNaN(raw.sale_price);
    if (blank) out.sale_price = null;
    else {
      const sale = typeof raw.sale_price === "number" ? raw.sale_price : parseFloat(String(raw.sale_price));
      if (!Number.isFinite(sale) || sale < 0) return { ok: false, error: "Sale price must be a positive number" };
      out.sale_price = Math.round(sale * 100) / 100;
    }
  }
  // Only comparable when both are in this payload; the database check enforces it otherwise.
  if (out.sale_price != null && out.price !== undefined && out.sale_price >= out.price) {
    return { ok: false, error: "Sale price must be lower than the regular price" };
  }

  for (const key of ["image_url", "zoom_image_url", "pillow_image_url"] as const) {
    if (!has(key)) {
      if (!partial && key === "image_url") return { ok: false, error: "Main image is required" };
      continue;
    }
    const v = str(raw[key]);
    if (v && !isHttpUrl(v)) return { ok: false, error: `${key} must be an http(s) URL` };
    if (key === "image_url" && !v && !partial) return { ok: false, error: "Main image is required" };
    out[key] = v;
  }

  return { ok: true, value: out };
}
