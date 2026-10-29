"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

// Lives in the navbar; the "dark" class on <html> is the single source of truth.

// The <html class="dark"> flag is the source of truth (set before paint by the
// inline script in the root layout), so we subscribe to it instead of mirroring it.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export default function DayNightToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("cc_theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      className={className ?? "pointer-events-auto flex items-center justify-center p-2 hover:opacity-70 transition-opacity"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
