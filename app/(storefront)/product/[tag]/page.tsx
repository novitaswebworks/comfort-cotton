import { getProductByTag, getRelatedProducts } from '@/lib/products';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '@/components/storefront/AddToCartButton';
import ProductGallery from './ProductGallery';
import { effectivePrice, formatRupees, onSale } from '@/lib/pricing';
import type { Metadata } from 'next';

export const revalidate = 60;

// Pages are rendered on first request, then cached and revalidated like the rest of the catalogue.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const { data: product } = await getProductByTag(tag);

  if (!product) {
    return { title: 'Product not found', robots: { index: false } };
  }

  const description = product.description || `${product.material}. ${product.in_stock ? 'Available now' : 'Currently sold out'} for ${formatRupees(effectivePrice(product))}.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.tag}` },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      url: `/product/${product.tag}`,
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const { data: product } = await getProductByTag(tag);

  if (!product) {
    notFound();
  }

  const { data: relatedProducts } = await getRelatedProducts(product);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.material,
    sku: product.tag,
    category: product.category,
    material: product.material,
    image: [product.image_url, product.zoom_image_url].filter(Boolean),
    url: `${SITE_URL}/product/${product.tag}`,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: effectivePrice(product),
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/product/${product.tag}`,
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

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
                {formatRupees(effectivePrice(product))}
              </p>
              {onSale(product) && <p className="text-lg text-muted-foreground line-through">{formatRupees(Number(product.price))}</p>}
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
                  {product.description ||
                    'Our fabrics are carefully selected for breathability, durability and a soft texture that improves with every wash.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 hidden md:block">
            <AddToCartButton product={{ id: product.id, name: product.name, price: effectivePrice(product), tag: product.tag, image_url: product.image_url }} inStock={product.in_stock} />
          </div>
        </div>

        {/* Right: Scrollable Gallery */}
        <div className="w-full md:w-[55vw] lg:w-[60vw] flex flex-col bg-muted/20">
          <ProductGallery images={[
            { url: product.image_url, alt: `${product.name} full view`, label: 'Overall drape' },
            ...(product.zoom_image_url ? [{ url: product.zoom_image_url, alt: `${product.name} fabric texture detail`, label: 'Fabric quality' }] : []),
            ...(product.pillow_image_url && product.pillow_image_url.startsWith('http') ? [{ url: product.pillow_image_url, alt: `${product.name} matching pillow covers`, label: 'Matching pillow covers' }] : [])
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
                    <p className="text-sm font-medium">{rel.in_stock ? formatRupees(effectivePrice(rel)) : 'Sold out'}</p>
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
        <AddToCartButton className="justify-center gap-3 py-4" product={{ id: product.id, name: product.name, price: effectivePrice(product), tag: product.tag, image_url: product.image_url }} inStock={product.in_stock} />
      </div>
    </main>
  );
}
