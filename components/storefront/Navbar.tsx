"use client";

import Link from "next/link";
import { User, Menu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-8 flex items-center justify-between pointer-events-none mix-blend-difference text-white">
      {/* Brand Logo */}
      <Link href="/" className="pointer-events-auto text-lg md:text-xl font-medium tracking-widest uppercase hover:opacity-70 transition-opacity" style={{ fontFamily: "'Playfair Display', serif" }}>
        Comfort Cotton
      </Link>

      {/* Right Actions */}
      <div className="flex items-center gap-6 pointer-events-auto">
        <Link href="/admin" className="text-xs uppercase tracking-[0.2em] font-medium hover:opacity-70 transition-opacity">
          Admin Portal
        </Link>
      </div>
    </nav>
  );
}
