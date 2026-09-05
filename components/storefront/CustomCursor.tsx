"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("default");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  if (!isMounted) return null;
  if (typeof window !== "undefined" && window.innerWidth < 768) return null;

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      backgroundColor: "transparent",
      border: "1px solid var(--foreground)",
    },
    hover: {
      x: mousePosition.x - 48,
      y: mousePosition.y - 48,
      height: 96,
      width: 96,
      backgroundColor: "var(--foreground)",
      mixBlendMode: "difference" as const,
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] hidden md:flex items-center justify-center"
      variants={variants}
      animate={cursorVariant}
      transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
    />
  );
}
