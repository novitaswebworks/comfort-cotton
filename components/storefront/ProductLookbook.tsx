"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  material: string;
  tag: string;
  image_url: string;
  zoom_image_url: string;
  category: string;
  pillow_image_url: string;
}

export default function ProductLookbook({ products, chapter = 1, title = "The Collection" }: { products: Product[]; chapter?: number; title?: string }) {
  const lookbookRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeProduct, setActiveProduct] = useState<string | null>(null);

  useEffect(() => {
    // If no products, don't run animation
    if (!products || products.length === 0) return;

    const ctx = gsap.context(() => {
      const matchMedia = gsap.matchMedia();
      
      matchMedia.add("(min-width: 768px)", () => {
        const track = trackRef.current;
        if (!track) return;

        const walk = -(track.scrollWidth - window.innerWidth);

        // 1. Pin and move the track horizontally
        gsap.to(track, {
          x: walk,
          ease: "none",
          scrollTrigger: {
            trigger: lookbookRef.current,
            start: "top top",
            end: () => `+=${track.scrollWidth}`, 
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          }
        });

        // 2. Parallax effect on the images inside the moving track
        const images = gsap.utils.toArray('.lookbook-img') as HTMLElement[];
        images.forEach(img => {
          gsap.to(img, {
            xPercent: 20, 
            ease: "none",
            scrollTrigger: {
              trigger: lookbookRef.current,
              start: "top top",
              end: () => `+=${track.scrollWidth}`,
              scrub: 1,
              invalidateOnRefresh: true,
            }
          });
        });
      });
    });

    return () => ctx.revert();
  }, [products]);

  const handleOrder = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `Hello Comfort Cotton! I want to order the ${product.name} bedsheet (Tag: #${product.tag}) priced at ₹${product.price}.`;
    window.open(`https://wa.me/1234567890?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!products || products.length === 0) {
    return (
      <section className="w-full h-screen flex flex-col items-center justify-center bg-background border-t border-border">
        <h2 className="text-4xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
          Collection launching soon.
        </h2>
      </section>
    );
  }

  return (
    <section ref={lookbookRef} className="relative w-full h-[100svh] overflow-hidden bg-background border-t border-border">
      <div 
        ref={trackRef} 
        className="flex h-full w-full md:w-max overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none hide-scrollbar items-center"
      >
        {/* Editorial Intro Slide */}
        <div className="w-[85vw] md:w-[100vw] h-full flex flex-col justify-center px-6 md:px-24 shrink-0 snap-center border-r border-border relative">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-8">Vol. {chapter}</p>
          <h2 className="text-6xl md:text-[9rem] font-light leading-[0.9] tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
            {title}.
          </h2>
          <div className="mt-12 md:mt-24 max-w-sm flex items-start gap-4">
            <ArrowUpRight className="shrink-0 text-muted-foreground hidden md:block" />
            <p className="text-sm text-foreground/80 leading-relaxed font-medium uppercase tracking-wider">
              An exploration of texture and form. <br className="hidden md:block"/> 
              <span className="text-muted-foreground hidden md:inline">Hover over any piece to inspect the intricate details of our weave.</span>
              <span className="text-muted-foreground md:hidden block mt-2 animate-pulse">Swipe left to explore ➔</span>
            </p>
          </div>
        </div>

        {/* Product Slides */}
        {products.map((product, index) => (
          <div 
            key={product.id}
            className="w-[95vw] md:w-[70vw] h-full shrink-0 snap-center flex flex-col justify-center px-6 md:px-16 border-r border-border"
          >
            <div className="flex justify-between items-end mb-6">
              <span className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground">
                No. 0{index + 1}
              </span>
              <span className="text-xs uppercase tracking-widest">{product.type}</span>
            </div>

            <Link 
              href={`/product/${product.tag}`}
              className="relative w-full h-[60vh] md:h-[70vh] group cursor-pointer overflow-hidden bg-muted block"
              onMouseEnter={() => setActiveProduct(product.id)}
              onMouseLeave={() => setActiveProduct(null)}
              onTouchStart={() => setActiveProduct(product.id)}
              onTouchEnd={() => setActiveProduct(null)}
            >
              <div className="absolute inset-0 w-[120%] -left-[10%]">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className={`lookbook-img absolute inset-0 w-full h-full object-cover transition-opacity duration-[1.5s] ${activeProduct === product.id ? 'opacity-0' : 'opacity-100'}`}
                />
              </div>
              
              <img 
                src={product.zoom_image_url} 
                alt={`${product.name} texture`}
                className={`absolute inset-0 w-full h-full object-cover scale-[1.15] transition-all duration-[2s] ease-out ${activeProduct === product.id ? 'opacity-100 scale-100' : 'opacity-0'}`}
              />

              <div className={`absolute inset-0 bg-background/20 backdrop-blur-sm flex flex-col items-center justify-center text-foreground transition-all duration-[1s] ease-[cubic-bezier(0.16,1,0.3,1)] ${activeProduct === product.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <p className="text-xs tracking-[0.2em] uppercase mb-4 font-medium">{product.material}</p>
                <p className="text-5xl font-light mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ₹{product.price}
                </p>
                <button 
                  onClick={(e) => handleOrder(product, e)}
                  className="group/btn flex items-center gap-3 bg-foreground text-background px-8 py-4 hover:bg-transparent hover:text-foreground border border-transparent hover:border-foreground transition-all pointer-events-auto"
                >
                  <MessageCircle className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                  <span className="font-medium text-xs tracking-[0.15em] uppercase">Inquire / Order</span>
                </button>
              </div>
            </Link>

            <div className="mt-6 flex justify-between items-start">
              <h3 className="text-3xl font-light tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>{product.name}</h3>
              <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{product.tag}</p>
            </div>
          </div>
        ))}
        
        <div className="w-[30vw] shrink-0 h-full flex flex-col justify-center px-12">
           <h2 className="text-4xl font-light tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
            More <br/> coming <br/> soon.
          </h2>
        </div>
      </div>
    </section>
  );
}
