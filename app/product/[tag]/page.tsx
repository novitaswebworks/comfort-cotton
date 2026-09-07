import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import AddToCartButton from '@/components/storefront/AddToCartButton';
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

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .eq('status', 'Published')
    .neq('id', product.id)
    .limit(3);

  

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      

      <div className="flex flex-col-reverse md:flex-row min-h-screen">
        {/* Left: Sticky Details */}
        <div className="w-full md:w-[45vw] lg:w-[40vw] p-8 pt-8 md:p-16 md:pt-32 flex flex-col justify-between md:sticky md:top-0 md:h-screen border-r border-border z-10 bg-background">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium border border-foreground/20 px-4 py-1.5 rounded-full">
                {product.type}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground bg-muted px-4 py-1.5 rounded-full">
                REF: {product.tag}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter mb-6 leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-2 mb-12">
              <p className="text-3xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                ₹{product.price}
              </p>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Incl. of all taxes</span>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-semibold">Material & Quality</p>
                <p className="font-medium text-lg tracking-wide">{product.material}</p>
              </div>
              <div className="pt-8 border-t border-border">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-semibold">The Details</p>
                <p className="text-base text-foreground/80 leading-relaxed font-normal">
                  Experience the ultimate luxury. Our fabrics are carefully selected to provide maximum breathability, durability, and a buttery-soft texture that improves with every wash. Designed to bring a touch of elegance to your most intimate spaces.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 hidden md:block">
            <AddToCartButton product={{ id: product.id, name: product.name, price: product.price, tag: product.tag, image_url: product.image_url }} />
          </div>
        </div>

        {/* Right: Scrollable Gallery */}
        <div className="w-full md:w-[55vw] lg:w-[60vw] flex flex-col bg-muted/20">
          <ProductGallery images={[
            { url: product.image_url, alt: `${product.name} Full View` },
            { url: product.zoom_image_url, alt: `${product.name} Fabric Texture Detail` },
            ...(product.pillow_image_url && product.pillow_image_url.startsWith('http') ? [{ url: product.pillow_image_url, alt: `${product.name} Matching Pillow Covers` }] : [])
          ]} />
        </div>
      </div>

      {/* Moved "You Might Also Like" OUTSIDE the flex row so it stacks at the bottom! */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="w-full bg-background py-32 px-6 md:px-16 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                Complete the <br/> aesthetic.
              </h2>
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground hidden md:block">More from {product.category}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
              {relatedProducts.map((rel) => (
                <Link key={rel.id} href={`/product/${rel.tag}`} className="group block">
                  <div className="aspect-[4/5] relative overflow-hidden mb-6 bg-muted">
                    <Image 
                      fill 
                      src={rel.image_url} 
                      alt={rel.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <h3 className="font-light text-2xl tracking-wide mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{rel.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">₹{rel.price}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{rel.type}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Order Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-background/90 backdrop-blur-md border-t border-border md:hidden z-50">
        <AddToCartButton className="justify-center gap-3 py-4" product={{ id: product.id, name: product.name, price: product.price, tag: product.tag, image_url: product.image_url }} />
      </div>
    </main>
  );
}
