"use client";

import Link from "next/link";
import CartButton from "./CartButton";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-8 flex items-center justify-between pointer-events-none mix-blend-difference text-white">
      {/* Brand Logo */}
      <Link href="/" className="pointer-events-auto text-lg md:text-xl font-medium tracking-widest uppercase hover:opacity-70 transition-opacity" style={{ fontFamily: "'Playfair Display', serif" }}>
        COMFORT COTTONS
      </Link>
          <div className="flex items-center gap-4">
        <CartButton />
      </div>
    </nav>
  );
}
