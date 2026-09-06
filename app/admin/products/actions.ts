"use server";
import { v2 as cloudinary } from "cloudinary";

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

export async function createProductDb(productData: any) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('products').insert([productData]);
    if (error) return { success: false, error: error.message };
    revalidatePath('/');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed" };
  }
}

export async function updateProductDb(id: string, updates: Record<string, string | number>) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('products').update(updates).eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete product:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Exception deleting product:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function getCloudinarySignature() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) throw new Error("Cloudinary API Secret is missing on server");

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'comfort-cottons' },
    apiSecret
  );

  return { timestamp, signature, cloudName, apiKey };
}
