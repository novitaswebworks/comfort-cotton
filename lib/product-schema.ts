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
    if (!/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(tag)) return { ok: false, error: "Tag must be 2-40 characters: letters, numbers, - or _" };
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
