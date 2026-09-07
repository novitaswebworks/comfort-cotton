"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function DayNightToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-24 left-6 md:bottom-8 md:left-8 z-[9000] p-4 rounded-full bg-foreground text-background shadow-lg hover:scale-105 transition-transform"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
