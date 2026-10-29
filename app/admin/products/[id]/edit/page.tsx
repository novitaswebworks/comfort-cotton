import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Product } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await getSupabaseAdmin().from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <ProductForm product={data as Product} />;
}
