"use server";

import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { validateProduct } from "@/lib/product-schema";

type ActionResult = { success: true } | { success: false; error: string };

// Server actions are public POST endpoints; the /admin proxy does not cover them.
async function requireAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") throw new Error("Unauthorized");
}

function revalidateStorefront() {
  // Home, collections and product pages are statically cached.
  revalidatePath("/", "layout");
}

function friendlyDbError(message: string) {
  if (/duplicate key|already exists/i.test(message)) return "That tag is already used by another product";
  return message;
}

export async function createProductDb(productData: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = validateProduct(productData, false);
    if (!parsed.ok) return { success: false, error: parsed.error };

    const { error } = await getSupabaseAdmin().from("products").insert([parsed.value]);
    if (error) return { success: false, error: friendlyDbError(error.message) };
    revalidateStorefront();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function updateProductDb(id: string, updates: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = validateProduct(updates, true);
    if (!parsed.ok) return { success: false, error: parsed.error };

    const { error } = await getSupabaseAdmin().from("products").update(parsed.value).eq("id", id);
    if (error) return { success: false, error: friendlyDbError(error.message) };
    revalidateStorefront();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { error } = await getSupabaseAdmin().from("products").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete product:", error);
      return { success: false, error: error.message };
    }
    revalidateStorefront();
    return { success: true };
  } catch (err) {
    console.error("Exception deleting product:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}

export async function getCloudinarySignature() {
  await requireAdmin();
  const timestamp = Math.round(Date.now() / 1000);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) throw new Error("Cloudinary API Secret is missing on server");

  const signature = cloudinary.utils.api_sign_request({ timestamp, folder: "comfort-cottons" }, apiSecret);

  return { timestamp, signature, cloudName, apiKey };
}

const isIdList = (ids: unknown): ids is string[] =>
  Array.isArray(ids) && ids.length > 0 && ids.length <= 100 && ids.every((i) => typeof i === "string" && /^[0-9a-f-]{36}$/i.test(i));

export async function bulkSetStatus(ids: string[], status: "Published" | "Draft"): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!isIdList(ids) || (status !== "Published" && status !== "Draft")) return { success: false, error: "Invalid request" };
    const { error } = await getSupabaseAdmin().from("products").update({ status }).in("id", ids);
    if (error) return { success: false, error: error.message };
    revalidateStorefront();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function bulkDelete(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!isIdList(ids)) return { success: false, error: "Invalid request" };
    const { error } = await getSupabaseAdmin().from("products").delete().in("id", ids);
    if (error) return { success: false, error: error.message };
    revalidateStorefront();
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

/** Copies a product as a Draft with a unique tag so it can be edited into a variant. */
export async function duplicateProduct(id: string): Promise<ActionResult & { id?: string }> {
  try {
    await requireAdmin();
    const db = getSupabaseAdmin();
    const { data: src, error } = await db.from("products").select("*").eq("id", id).single();
    if (error || !src) return { success: false, error: "Product not found" };

    const { id: _id, created_at: _created, tag, name, ...rest } = src;
    void _id; void _created;
    for (let n = 1; n <= 20; n++) {
      const suffix = n === 1 ? "-COPY" : `-COPY${n}`;
      const { data: created, error: insertError } = await db
        .from("products")
        .insert([{ ...rest, name: `${name} (copy)`, tag: `${tag}${suffix}`.slice(0, 40), status: "Draft" }])
        .select("id")
        .single();
      if (!insertError) {
        revalidateStorefront();
        return { success: true, id: created.id };
      }
      if (!/duplicate key/i.test(insertError.message)) return { success: false, error: insertError.message };
    }
    return { success: false, error: "Could not find a free tag for the copy" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
