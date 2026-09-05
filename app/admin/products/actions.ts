"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function updateProduct(id: string, formData: FormData) {
  const supabaseAdmin = getSupabaseAdmin();

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const price = parseFloat(formData.get('price') as string);
  const material = formData.get('material') as string;
  const tag = formData.get('tag') as string;
  
  const mainImageFile = formData.get('main_image') as File | null;
  const zoomImageFile = formData.get('zoom_image') as File | null;

  const updates: any = { name, type, price, material, tag };

  // Upload Main Image if provided
  if (mainImageFile && mainImageFile.size > 0) {
    const fileName = `main_${Date.now()}_${mainImageFile.name.replace(/\\s/g, '_')}`;
    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(fileName, mainImageFile);
    
    if (error) throw error;
    const { data: pubData } = supabaseAdmin.storage.from('products').getPublicUrl(data.path);
    updates.image_url = pubData.publicUrl;
  }

  // Upload Zoom Image if provided
  if (zoomImageFile && zoomImageFile.size > 0) {
    const fileName = `zoom_${Date.now()}_${zoomImageFile.name.replace(/\\s/g, '_')}`;
    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(fileName, zoomImageFile);
    
    if (error) throw error;
    const { data: pubData } = supabaseAdmin.storage.from('products').getPublicUrl(data.path);
    updates.zoom_image_url = pubData.publicUrl;
  }

  const { error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error(error);
    throw new Error("Failed to update product");
  }

  revalidatePath('/');
  revalidatePath('/admin/products');
  redirect('/admin/products');
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
