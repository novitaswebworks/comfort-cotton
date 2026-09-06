import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import ProductGallery from './ProductGallery';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('tag', resolvedParams.tag)
    .eq('status', 'Published')
    .single();

  if (!product) {
    return { title: 'Product Not Found - Comfort Cottons' };
  }

  return {
    title: `${product.name} | Comfort Cottons`,
    description: `${product.material}. Available now for ₹${product.price}.`,
    openGraph: {
      title: `${product.name} | Comfort Cottons`,
      description: `${product.material}. Luxury bedding for your home.`,
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ tag: string }> }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('tag', resolvedParams.tag)
    .eq('status', 'Published')
    .single();

  if (!product) {
    notFound();
  }

  const whatsappText = `Hello Comfort Cottons! I want to order the ${product.name} bedsheet (Tag: #${product.tag}) priced at ₹${product.price}.`;
  const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(whatsappText)}`;

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 mix-blend-difference text-white p-6 md:p-8 flex items-center justify-between pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center gap-2 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm tracking-widest uppercase font-medium">Back to Collection</span>
        </Link>
      </nav>

      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left: Sticky Details (Desktop) / Top Details (Mobile) */}
        <div className="w-full md:w-1/3 p-6 pt-24 md:p-16 md:pt-32 flex flex-col justify-between md:sticky md:top-0 md:h-screen border-r border-border z-10 bg-background/80 backdrop-blur-md md:bg-transparent md:backdrop-blur-none">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs uppercase tracking-widest border border-foreground/20 px-3 py-1 rounded-full">
                {product.type}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {product.tag}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h1>
            
            <p className="text-2xl font-light mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              ₹{product.price}
            </p>

            <div className="space-y-6 text-sm uppercase tracking-widest">
              <div>
                <p className="text-muted-foreground mb-1 text-[10px]">Material</p>
                <p className="font-medium">{product.material}</p>
              </div>
              <div className="pt-6 border-t border-border">
                <p className="text-muted-foreground mb-1 text-[10px]">Details</p>
                <p className="font-medium leading-relaxed">
                  Experience the ultimate luxury. Our fabrics are carefully selected to provide maximum breathability, durability, and a buttery-soft texture that improves with every wash.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 hidden md:block">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between bg-foreground text-background px-8 py-5 hover:bg-transparent hover:text-foreground border border-transparent hover:border-foreground transition-all w-full"
            >
              <span className="font-medium text-xs tracking-[0.15em] uppercase">Inquire / Order</span>
              <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
            </a>
          </div>
        </div>

        {/* Right: Scrollable Gallery */}
        <div className="w-full md:w-2/3 flex flex-col">
          <ProductGallery images={[
            { url: product.image_url, alt: `${product.name} Full View` },
            { url: product.zoom_image_url, alt: `${product.name} Fabric Texture Detail` },
            ...(product.pillow_image_url && product.pillow_image_url.startsWith('http') ? [{ url: product.pillow_image_url, alt: `${product.name} Matching Pillow Covers` }] : [])
          ]} />
        </div>
      </div>

      {/* Mobile Fixed Order Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-background/90 backdrop-blur-md border-t border-border md:hidden z-50">
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-foreground text-background px-6 py-4 w-full"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium text-xs tracking-[0.15em] uppercase">Inquire / Order via WhatsApp</span>
        </a>
      </div>
    </main>
  );
}
