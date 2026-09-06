"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function getPresignedUploadUrl(bucket: string, fileName: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(fileName);

  if (error) {
    console.error("Failed to create presigned URL:", error);
    throw new Error("Failed to create upload URL");
  }

  // Get the public URL for it immediately so we can store it in DB
  const { data: pubData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

  return {
    signedUrl: data.signedUrl,
    path: data.path,
    token: data.token,
    publicUrl: pubData.publicUrl
  };
}

export async function createProductDb(productData: {
  name: string;
  type: string;
  price: number;
  material: string;
  tag: string;
  category: string;
  image_url: string;
  zoom_image_url: string;
  pillow_image_url: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin.from('products').insert([productData]);

  if (error) {
    console.error("Failed to insert product into database:", error);
    throw new Error("Failed to create product");
  }

  revalidatePath('/');
  revalidatePath('/admin/products');
}

export async function updateProductDb(id: string, updates: Record<string, string | number>) {
  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error("Failed to update product:", error);
    throw new Error("Failed to update product");
  }

  revalidatePath('/');
  revalidatePath('/admin/products');
}

export async function deleteProduct(id: string) {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete product:", error);
    throw new Error("Failed to delete product");
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}
