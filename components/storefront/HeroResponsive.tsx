"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Inline film grain; avoids a third-party request for the noise texture.
const GRAIN = `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function HeroResponsive({ heroImage = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2942&auto=format&fit=crop" }: { heroImage?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLSpanElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const title3Ref = useRef<HTMLSpanElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      // Image clip-path reveal (Hardware accelerated)
      tl.fromTo(imgWrapperRef.current,
        { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.5, ease: "power4.inOut" }
      )
      // Image scale down (Hardware accelerated)
      .fromTo(imgRef.current,
        { scale: 1.2, force3D: true },
        { scale: 1, duration: 1.5, ease: "power4.out", force3D: true },
        "-=1.5"
      )
      // Title 1 Slide up
      .fromTo(title1Ref.current,
        { yPercent: 100, force3D: true },
        { yPercent: 0, duration: 1, ease: "power4.out", force3D: true },
        "-=1.0"
      )
      // Title 2 Slide up
      .fromTo(title2Ref.current,
        { yPercent: 100, force3D: true },
        { yPercent: 0, duration: 1, ease: "power4.out", force3D: true },
        "-=0.8"
      )
      // Title 3 Slide up
      .fromTo(title3Ref.current,
        { yPercent: 100, force3D: true },
        { yPercent: 0, duration: 1, ease: "power4.out", force3D: true },
        "-=0.8"
      );

      // Parallax Effect on scroll (Smooth scrub for mobile lag fix)
      gsap.to(imgRef.current, {
        yPercent: 15, // Reduced from 30 to prevent aggressive cropping
        ease: "none",
        force3D: true, // Hardware acceleration for buttery smooth mobile scroll
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1 // Adding a 1 second smoothing delay fixes "jitter/lag" on touch screens
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-[100svh] max-h-[1080px] max-w-[1920px] mx-auto flex flex-col justify-between px-4 py-6 md:px-12 md:py-12 overflow-hidden bg-background">
      
      {/* Spacer to push content down since Navbar is fixed */}
      <div className="h-12 md:h-16 w-full" />

      {/* Editorial Typography Reveal */}
      <h1 aria-label="The art of modern sleep" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full px-2 md:px-6 flex flex-col items-center pointer-events-none mix-blend-difference text-white">
        
        <span className="block reveal-mask md:-ml-48 -ml-8">
          <span
            ref={title1Ref}
            aria-hidden="true"
            className="block text-[17vw] md:text-[clamp(4rem,9vw,150px)] font-light leading-[0.85] tracking-tighter whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            THE ART
          </span>
        </span>

        <span className="block reveal-mask -mt-1 md:-mt-6 z-10">
          <span
            ref={title2Ref}
            aria-hidden="true"
            className="block text-[15vw] md:text-[clamp(4rem,9vw,150px)] font-light leading-[0.85] tracking-tighter text-outline mix-blend-difference whitespace-nowrap" 
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            OF MODERN
          </span>
        </span>

        <span className="block reveal-mask md:ml-48 ml-10 -mt-1 md:-mt-6 z-10">
          <span
            ref={title3Ref}
            aria-hidden="true"
            className="block text-[17vw] md:text-[clamp(4rem,9vw,150px)] font-light leading-[0.85] tracking-tighter whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            SLEEP.
          </span>
        </span>

      </h1>

      {/* Main Image with Mask */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-2 md:p-12 pointer-events-none">
        <div ref={imgWrapperRef} className="relative w-full h-[85vh] md:w-[80%] md:max-w-[1400px] md:h-[90%] md:max-h-[800px] xl:max-h-[900px] overflow-hidden rounded-2xl md:rounded-none mt-10 md:mt-0 shadow-2xl">
          <Image
            ref={imgRef}
            src={heroImage}
            alt="Premium cotton bedsheets from Comfort Cottons"
            width={1920}
            height={1280}
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
            className="absolute top-0 left-0 w-full h-[120%] object-cover object-[center_30%] origin-top brightness-[0.85]"
          />
          {/* Grain overlay for luxury feel */}
          <div className="absolute inset-0 opacity-[0.05] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-between items-end z-20 mix-blend-difference text-white pb-2 md:pb-0 px-2 md:px-0">
        <p className="max-w-[150px] md:max-w-[200px] text-[9px] md:text-xs font-medium tracking-wide uppercase opacity-80 leading-relaxed">
          Crafted with care. <br/> For the ultimate comfort.
        </p>
        
        {/* Centered Scroll Indicator */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 mix-blend-difference text-white">
          <div className="w-[1px] h-12 bg-white/50 animate-pulse" />
          <p className="text-[9px] md:text-xs font-medium tracking-widest uppercase opacity-80">
            Scroll
          </p>
        </div>

        {/* Right side spacer to balance flex-between since scroll is now absolute */}
        <div className="w-[150px] md:w-[200px]" />
      </div>
    </section>
  );
}
