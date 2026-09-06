import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import HeroResponsive from "@/components/storefront/HeroResponsive";
import ProductLookbook from "@/components/storefront/ProductLookbook";
import CollectionsGrid from "@/components/storefront/CollectionsGrid";
import SecretLogout from "@/components/storefront/SecretLogout";

export const revalidate = 0; // Ensure data is always fresh

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Fetch real products from your Supabase database
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  const allProducts = products || [];

  const heroImage = allProducts[0]?.image_url || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2942&auto=format&fit=crop";

  return (
    <main className="relative w-full text-foreground selection:bg-muted selection:text-foreground">
      <HeroResponsive heroImage={heroImage} />
      
      {/* Featured Picks Lookbook */}
      {allProducts.length > 0 && (
        <ProductLookbook 
          products={allProducts.slice(0, 5)} // Show top 5 products
          chapter={1}
          title="Featured Picks"
        />
      )}

      {/* Editorial Category Grid */}
      <CollectionsGrid />

      <footer className="py-24 border-t border-border bg-background text-center flex flex-col items-center justify-center">
        <h2 className="text-4xl md:text-6xl font-light mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          Comfort Cottons.
        </h2>
        <SecretLogout>
          <p className="text-sm text-muted-foreground uppercase tracking-widest relative z-10">
            © {new Date().getFullYear()} The Art of Sleep
          </p>
        </SecretLogout>
      </footer>
    </main>
  );
}
