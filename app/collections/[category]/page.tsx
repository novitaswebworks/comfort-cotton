import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  
  const mapping: Record<string, string> = {
    "double-bed-king-size": "Double bed king size",
    "double-bed-queen-size": "Double bed queen size",
    "single-bed-without-pillow-cover": "Single Bed without pillow cover",
    "single-bed-with-pillow-cover": "Single Bed with Pilow cover",
    "deewan-sets": "Deewan Sets",
    "dohads-quilt": "Dohads (Quilt)",
  };

  const descriptions: Record<string, string> = {
    "Double bed king size": "Experience unparalleled comfort and grand proportions with our premium king size bedsheets. Designed for spacious luxury.",
    "Double bed queen size": "Perfectly tailored for your queen bed. Woven from the finest cotton for a soft, breathable, and restful sleep.",
    "Single Bed without pillow cover": "Minimalist single bedsheets that bring a crisp, clean aesthetic to any room. Pure comfort, simplified.",
    "Single Bed with Pilow cover": "Complete your single bed setup with these beautifully matched sets, featuring a coordinating pillow cover for a cohesive look.",
    "Deewan Sets": "Transform your living space with our elegant Deewan sets. Traditional craftsmanship meets modern comfort for daytime lounging.",
    "Dohads (Quilt)": "Lightweight, breathable, and incredibly soft. Our Dohads provide the perfect layer of warmth for year-round comfort.",
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
    .eq("status", "Published")
    .order("created_at", { ascending: false });

  const validProducts = products || [];
  const description = descriptions[categoryName] || "Discover our curated collection of premium cotton essentials.";

  return (
    <main className="relative min-h-screen w-full bg-background pt-32 pb-24 text-foreground flex flex-col">
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex-grow">
        
        <Link href="/" className="inline-flex items-center text-sm font-medium hover:opacity-70 transition-opacity mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Link>

        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-6xl font-light mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {categoryName}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {validProducts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            <p>We are currently updating our collection.</p>
            <p className="text-sm mt-2 opacity-70">Please check back soon for new arrivals.</p>
          </div>
        ) : (
          <div className={`grid gap-8 md:gap-12 ${validProducts.length === 1 ? 'grid-cols-1 md:grid-cols-2' : validProducts.length === 2 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {validProducts.map((product) => {
              const hasValidPillowImage = product.pillow_image_url && product.pillow_image_url.startsWith('http');
              return (
                <Link key={product.id} href={`/product/${product.tag}`} className={`group block ${validProducts.length === 1 ? 'max-w-lg' : ''}`}>
                  <div className="aspect-[4/5] overflow-hidden mb-6 bg-muted relative">
                    <Image fill src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    {hasValidPillowImage && (
                      <Image fill src={product.pillow_image_url} alt={`${product.name} Pillow Cover`} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
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
              )
            })}
          </div>
        )}
      </div>
      
      {/* Editorial Footer to fill empty space */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-32 pt-16 border-t border-zinc-100 dark:border-zinc-900">
        <h3 className="text-sm font-medium tracking-widest uppercase mb-8 text-center">Explore Other Collections</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(mapping)
            .filter(([slug, _]) => slug !== categorySlug)
            .slice(0, 4)
            .map(([slug, name]) => (
            <Link key={slug} href={`/collections/${slug}`} className="px-6 py-3 text-sm border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              {name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
