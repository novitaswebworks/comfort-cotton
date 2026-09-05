import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import HeroResponsive from "@/components/storefront/HeroResponsive";
import ProductLookbook from "@/components/storefront/ProductLookbook";

export const revalidate = 0; // Ensure data is always fresh

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Fetch real products from your Supabase database
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <main className="relative w-full text-foreground selection:bg-muted selection:text-foreground">
      <HeroResponsive />
      
      <ProductLookbook products={products || []} />

      <footer className="py-24 border-t border-border bg-background text-center flex flex-col items-center justify-center">
        <h2 className="text-4xl md:text-6xl font-light mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          Comfort Cotton.
        </h2>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">
          © {new Date().getFullYear()} The Art of Sleep
        </p>
      </footer>
    </main>
  );
}
