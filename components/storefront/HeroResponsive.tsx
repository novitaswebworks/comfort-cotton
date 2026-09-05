"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroResponsive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLDivElement>(null);
  const title2Ref = useRef<HTMLDivElement>(null);
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
        "-=0.8"
      )
      // Title 2 Slide up
      .fromTo(title2Ref.current,
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
    <section ref={containerRef} className="relative w-full h-[100svh] flex flex-col justify-between px-4 py-6 md:px-12 md:py-12 overflow-hidden bg-background">
      
      {/* Spacer to push content down since Navbar is fixed */}
      <div className="h-12 md:h-16 w-full" />

      {/* Avant-Garde Typography Reveal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full px-2 md:px-6 flex flex-col items-center pointer-events-none mix-blend-difference text-white">
        
        <div className="reveal-mask md:-ml-32 -ml-8">
          <h1 
            ref={title1Ref} 
            className="text-[22vw] md:text-[10vw] leading-[0.8] tracking-tighter"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            COMFORT
          </h1>
        </div>

        {/* Staggered overlapping outline text */}
        <div className="reveal-mask md:ml-32 ml-16 -mt-3 md:-mt-10 z-10">
          <h1 
            ref={title2Ref} 
            className="text-[22vw] md:text-[10vw] leading-[0.8] tracking-tighter text-outline drop-shadow-xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            COTTON
          </h1>
        </div>

      </div>

      {/* Main Image with Mask */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-2 md:p-12 pointer-events-none">
        <div ref={imgWrapperRef} className="relative w-full h-[85vh] md:w-[80%] md:h-[90%] overflow-hidden rounded-2xl md:rounded-none mt-10 md:mt-0 shadow-2xl">
          <img 
            ref={imgRef}
            src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2942&auto=format&fit=crop" 
            alt="Premium Cotton Bedsheets"
            className="absolute top-0 left-0 w-full h-[120%] object-cover object-[center_30%] origin-top brightness-[0.85]"
          />
          {/* Grain overlay for luxury feel */}
          <div className="absolute inset-0 opacity-[0.05] mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-between items-end z-20 mix-blend-difference text-white pb-2 md:pb-0 px-2 md:px-0">
        <p className="max-w-[150px] md:max-w-[200px] text-[9px] md:text-xs font-medium tracking-wide uppercase opacity-80 leading-relaxed">
          The art of sleep. <br/> Redefined for the modern aesthetic.
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
