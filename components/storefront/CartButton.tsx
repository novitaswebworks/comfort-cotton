"use client";

import { useCartStore } from "@/lib/store/useCartStore";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartButton() {
  const { items, setIsOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <button 
      onClick={() => setIsOpen(true)}
      className="pointer-events-auto flex items-center gap-2 hover:opacity-70 transition-opacity relative p-2"
    >
      <ShoppingBag className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-white text-black text-[10px] font-bold flex items-center justify-center rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}
