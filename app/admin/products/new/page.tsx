import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "New product" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  return <ProductForm defaultCategory={category} />;
}
