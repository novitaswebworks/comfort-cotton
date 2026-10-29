import { notFound } from "next/navigation";
import { effectivePrice, formatRupees, onSale } from "@/lib/pricing";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getProductsByCategory } from "@/lib/products";
import { CATEGORY_DESCRIPTIONS, CATEGORY_SLUGS, SITE_NAME } from "@/lib/site";

export const revalidate = 60;

export function generateStaticParams() {
  return Object.keys(CATEGORY_SLUGS).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const name = CATEGORY_SLUGS[category];
  if (!name) return { title: "Collection not found" };
  const description = CATEGORY_DESCRIPTIONS[name];
  return {
    title: name,
    description,
    alternates: { canonical: `/collections/${category}` },
    openGraph: { title: `${name} | ${SITE_NAME}`, description, url: `/collections/${category}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const categoryName = CATEGORY_SLUGS[categorySlug];
  if (!categoryName) notFound();

  const { data: products, error } = await getProductsByCategory(categoryName);
  const validProducts = products ?? [];
  const description = CATEGORY_DESCRIPTIONS[categoryName];

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
          <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {error ? (
          <div role="status" className="text-center py-24 text-muted-foreground border border-dashed border-border rounded-lg">
            <p>We couldn&apos;t load this collection just now.</p>
            <p className="text-sm mt-2 opacity-70">Please refresh in a moment.</p>
          </div>
        ) : validProducts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground border border-dashed border-border rounded-lg">
            <p>We are currently updating our collection.</p>
            <p className="text-sm mt-2 opacity-70">Please check back soon for new arrivals.</p>
          </div>
        ) : (
          <div className={`grid gap-8 md:gap-12 ${validProducts.length === 1 ? "grid-cols-1 md:grid-cols-2" : validProducts.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            {validProducts.map((product, i) => {
              const hasValidPillowImage = product.pillow_image_url?.startsWith("http");
              return (
                <Link key={product.id} href={`/product/${product.tag}`} className={`group block ${validProducts.length === 1 ? "max-w-lg" : ""}`}>
                  <div className="aspect-[4/5] overflow-hidden mb-6 bg-muted relative">
                    <Image fill priority={i < 3} src={product.image_url} alt={product.name} className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    {hasValidPillowImage && (
                      <Image fill src={product.pillow_image_url} alt={`${product.name} pillow cover`} className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    )}
                  </div>
                  <h2 className="text-xl font-light tracking-wide">{product.name}</h2>
                  <p className="text-sm text-muted-foreground mt-2 font-medium tracking-wider">{product.in_stock ? formatRupees(effectivePrice(product)) : "Sold out"}{product.in_stock && onSale(product) && <span className="ml-2 line-through opacity-60">{formatRupees(Number(product.price))}</span>}</p>
                  <p className="text-xs text-muted-foreground mt-1 opacity-70">{product.material}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-32 pt-16 border-t border-border">
        <h2 className="text-sm font-medium tracking-widest uppercase mb-8 text-center">Explore Other Collections</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(CATEGORY_SLUGS)
            .filter(([slug]) => slug !== categorySlug)
            .slice(0, 4)
            .map(([slug, name]) => (
              <Link key={slug} href={`/collections/${slug}`} className="px-6 py-3 text-sm border border-border rounded-full hover:bg-muted transition-colors">
                {name}
              </Link>
            ))}
        </div>
      </div>
    </main>
  );
}
