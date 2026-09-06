import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  
  // Quick hack to map slug back to full category name based on the constants
  const mapping: Record<string, string> = {
    "double-bed-king-size": "Double bed king size",
    "double-bed-queen-size": "Double bed queen size",
    "single-bed-without-pillow-cover": "Single Bed without pillow cover",
    "single-bed-with-pillow-cover": "Single Bed with Pilow cover",
    "deewan-sets": "Deewan Sets",
    "dohads-quilt": "Dohads (Quilt)",
  };

  const categoryName = mapping[categorySlug];
  if (!categoryName) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category", categoryName)
    .order("created_at", { ascending: false });

  return (
    <main className="relative min-h-screen w-full bg-background pt-32 pb-24 text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <Link href="/" className="inline-flex items-center text-sm font-medium hover:opacity-70 transition-opacity mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Link>

        <h1 className="text-4xl md:text-6xl font-light mb-16 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          {categoryName}
        </h1>

        {!products || products.length === 0 ? (
          <div className="text-center py-32 text-muted-foreground">
            <p>No products available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.tag}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden mb-6 bg-muted relative">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {product.pillow_image_url && (
                    <img 
                      src={product.pillow_image_url} 
                      alt={`${product.name} Pillow Cover`}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                    />
                  )}
                </div>
                <h3 className="text-xl font-light tracking-wide">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 font-medium tracking-wider">
                  ₹{product.price}
                </p>
                <p className="text-xs text-muted-foreground mt-1 opacity-70">
                  {product.material}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
