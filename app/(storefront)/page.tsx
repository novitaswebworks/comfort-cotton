import Link from "next/link";
import HeroResponsive from "@/components/storefront/HeroResponsive";
import ProductLookbook from "@/components/storefront/ProductLookbook";
import CollectionsGrid from "@/components/storefront/CollectionsGrid";
import { getPublishedProducts } from "@/lib/products";
import { CATEGORY_SLUGS } from "@/lib/site";

// Statically cached; admin actions call revalidatePath so edits show up immediately.
export const revalidate = 60;

const FALLBACK_HERO = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2942&auto=format&fit=crop";

export default async function Home() {
  const { data: products, error } = await getPublishedProducts(5);
  const featured = products ?? [];
  const heroImage = featured[0]?.image_url || FALLBACK_HERO;

  return (
    <main className="relative w-full text-foreground selection:bg-muted selection:text-foreground">
      <HeroResponsive heroImage={heroImage} />

      {error ? (
        <section className="w-full py-32 px-6 text-center border-t border-border">
          <h2 className="text-3xl md:text-5xl font-light mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Our collection is taking a short rest.
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn&apos;t load the catalogue just now. Please refresh in a moment, or message us on WhatsApp and we&apos;ll help you directly.
          </p>
        </section>
      ) : (
        featured.length > 0 && <ProductLookbook products={featured} chapter={1} title="Featured Picks" />
      )}

      <CollectionsGrid />

      <footer className="py-24 px-6 border-t border-border bg-background text-center flex flex-col items-center justify-center">
        <h2 className="text-4xl md:text-6xl font-light mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
          Comfort Cottons.
        </h2>
        <nav aria-label="Collections" className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10 max-w-3xl">
          {Object.entries(CATEGORY_SLUGS).map(([slug, name]) => (
            <Link key={slug} href={`/collections/${slug}`} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              {name}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground tracking-wide mb-10 max-w-sm">
          Orders and enquiries are handled personally on WhatsApp. Use the chat button to reach us.
        </p>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">
          © {new Date().getFullYear()} The Art of Sleep
        </p>
        <Link href="/admin" className="mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 hover:text-foreground transition-colors">
          Admin
        </Link>
      </footer>
    </main>
  );
}
