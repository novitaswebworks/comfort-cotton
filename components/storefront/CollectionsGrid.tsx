"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export const CATEGORY_DATA = [
  {
    name: "Double bed king size",
    slug: "double-bed-king-size",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2942&auto=format&fit=crop",
    className: "col-span-1 md:col-span-8 aspect-[4/3] md:aspect-[16/9]",
  },
  {
    name: "Double bed queen size",
    slug: "double-bed-queen-size",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    className: "col-span-1 md:col-span-4 aspect-[4/3] md:aspect-[4/5]",
  },
  {
    name: "Single Bed without pillow cover",
    slug: "single-bed-without-pillow-cover",
    image: "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=800&q=80",
    className: "col-span-1 md:col-span-4 aspect-[4/3] md:aspect-square",
  },
  {
    name: "Single Bed with Pilow cover",
    slug: "single-bed-with-pillow-cover",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80",
    className: "col-span-1 md:col-span-4 aspect-[4/3] md:aspect-square",
  },
  {
    name: "Deewan Sets",
    slug: "deewan-sets",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
    className: "col-span-1 md:col-span-4 aspect-[4/3] md:aspect-square",
  },
  {
    name: "Dohads (Quilt)",
    slug: "dohads-quilt",
    image: "https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=1600&q=80",
    className: "col-span-1 md:col-span-12 aspect-[4/3] md:aspect-[21/9]",
  }
];

export default function CollectionsGrid() {
  return (
    <section className="w-full bg-background py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24">
          <h2 className="text-5xl md:text-7xl font-light tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
            The <br/> Collections.
          </h2>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-8 md:mt-0 max-w-[200px]">
            Explore our meticulously curated categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {CATEGORY_DATA.map((cat, idx) => (
            <Link 
              key={cat.slug} 
              href={`/collections/${cat.slug}`}
              className={`group relative overflow-hidden bg-muted block ${cat.className}`}
            >
              <Image fill 
                src={cat.image} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors duration-700 ease-out" />
              
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-y-4 group-hover:translate-y-0 text-white">
                  <span className="text-xs font-medium uppercase tracking-widest">
                    0{idx + 1}
                  </span>
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-light text-white tracking-wide translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
