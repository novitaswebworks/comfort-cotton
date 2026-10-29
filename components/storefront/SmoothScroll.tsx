"use client";

import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

// Lenis keeps its own scroll target. If a page change happens while that target is still
// animating (the user just scrolled), Lenis glides back to the old offset and the next page
// opens scrolled down. Snapping Lenis to the top on every route change prevents that.
function ResetOnNavigate() {
  const lenis = useLenis();
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
