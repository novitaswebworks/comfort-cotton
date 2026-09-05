"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Loader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bedsheetRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const counter = { val: 0 };
    const filterState = { scale: 0, baseFrequency: 0.001 };

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setIsComplete(true);
      }
    });

    // 1. Rapid editorial counter
    tl.to(counter, {
      val: 100,
      duration: 1.8,
      ease: "power3.inOut",
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.innerText = Math.floor(counter.val).toString().padStart(2, '0');
        }
      }
    })
    .to(numberRef.current, {
      scale: 0.85,
      opacity: 0,
      duration: 0.4,
      ease: "power2.out"
    })
    // 2. Comfort Cotton branding fades in
    .fromTo(textRef.current, {
      y: 50,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.2")
    // 3. Pause
    .to({}, { duration: 0.4 })
    // 4. The "Floating Cloth Ripple" Animation (Majestic and Slow)
    .to(filterState, {
      scale: 120, // Majestic, large ripples
      baseFrequency: 0.01, // Even smoother waves
      duration: 3.0,
      ease: "sine.inOut", // Ultra smooth float easing
      onUpdate: () => {
        if (turbulenceRef.current && displacementRef.current) {
          turbulenceRef.current.setAttribute("baseFrequency", filterState.baseFrequency.toString());
          displacementRef.current.setAttribute("scale", filterState.scale.toString());
        }
      }
    }, "peel")
    // Float the cloth upward and fade it out gently
    .to(bedsheetRef.current, {
      yPercent: -80, // Float up gently, not shooting off
      rotation: 3,
      opacity: 0,
      duration: 3.0,
      ease: "sine.inOut",
    }, "peel");

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (isComplete) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden">
      
      {/* SVG Filter Definition for the Cloth Ripple */}
      <svg className="hidden">
        <filter id="cloth-ripple" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence 
            ref={turbulenceRef} 
            type="fractalNoise" 
            baseFrequency="0.001" 
            numOctaves="2" 
            result="noise" 
          />
          <feDisplacementMap 
            ref={displacementRef} 
            in="SourceGraphic" 
            in2="noise" 
            scale="0" 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>

      {/* The Physical Bedsheet */}
      <div 
        ref={bedsheetRef} 
        // We use a rich, deep Navy Blue to bring color and high-end luxury feel
        className="absolute inset-0 w-full h-full bg-[#172535] flex flex-col items-center justify-center origin-center p-6 md:p-12"
        style={{ 
          willChange: "transform, filter, opacity",
          filter: "url(#cloth-ripple)"
        }}
      >
        
        {/* Subtle Diagonal Twill Texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.1] mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px)" }} 
        />

        {/* 
          BEDSHEET DESIGN ELEMENT: The Hem / Stitching 
          This creates a border that looks like the stitched edge of a premium bedsheet.
        */}
        <div className="absolute inset-6 md:inset-12 border-[2px] border-dashed border-[#EAE6DF]/20 pointer-events-none rounded-lg" />
        <div className="absolute inset-8 md:inset-14 border border-[#EAE6DF]/10 pointer-events-none rounded-md" />

        {/* 
          BEDSHEET DESIGN ELEMENT: The Product Tag 
          A physical-looking tag stitched into the top right corner.
        */}
        <div className="absolute top-12 right-12 md:top-24 md:right-24 bg-[#EAE6DF] text-[#172535] px-4 py-8 flex flex-col items-center shadow-lg transform rotate-3 origin-top">
          <div className="w-2 h-2 rounded-full bg-[#172535]/30 mb-4 absolute top-2" /> {/* Stitch hole */}
          <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest writing-vertical-rl" style={{ writingMode: "vertical-rl" }}>
            100% Organic Cotton
          </p>
        </div>

        {/* Massive Serif Number (Cream color) */}
        <div 
          ref={numberRef}
          className="absolute z-10 text-[40vw] md:text-[25vw] font-light text-[#EAE6DF] tracking-tighter"
          style={{ fontFamily: "'Playfair Display', serif", lineHeight: 0.8 }}
        >
          00
        </div>

        {/* Brand Text Reveal (Cream color) */}
        <div 
          ref={textRef}
          className="absolute z-10 text-3xl md:text-6xl tracking-[0.2em] uppercase font-light text-[#EAE6DF] opacity-0 text-center px-4 leading-relaxed"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Comfort <br className="md:hidden"/> Cotton
        </div>

      </div>
      
    </div>
  );
}
