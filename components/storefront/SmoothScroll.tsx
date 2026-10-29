"use client";

import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Lenis keeps its own scroll target. If a page change happens while that target is still
// animating (the user just scrolled), Lenis glides back to the old offset and the next page
// opens scrolled down. Snapping Lenis to the top on every route change prevents that.
function ResetOnNavigate() {
  // Keep GSAP ScrollTrigger (hero parallax) in step with Lenis's smoothed scroll position.
  const lenis = useLenis(() => ScrollTrigger.update());
  const pathname = usePathname();

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [lenis, pathname]);

  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <ResetOnNavigate />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {children as any}
    </ReactLenis>
  );
}
