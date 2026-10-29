"use client";

import Link from "next/link";
import CartButton from "./CartButton";
import DayNightToggle from "./DayNightToggle";

export default function Navbar() {
  return (
    <nav
      aria-label="Main"
      className="fixed top-0 left-0 w-full z-50 px-4 py-4 md:p-8 flex items-center justify-between pointer-events-none mix-blend-difference text-white"
    >
      <Link
        href="/"
        className="pointer-events-auto text-sm sm:text-lg md:text-xl font-medium tracking-[0.2em] sm:tracking-widest uppercase hover:opacity-70 transition-opacity"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Comfort Cottons
      </Link>
      <div className="flex items-center gap-1 sm:gap-3">
        <DayNightToggle />
        <CartButton />
      </div>
    </nav>
  );
}
