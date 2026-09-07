"use client";

import { useCartStore } from "@/lib/store/useCartStore";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    tag: string;
    image_url: string;
  };
  className?: string;
}

export default function AddToCartButton({ product, className = "" }: AddToCartButtonProps) {
  const { addItem } = useCartStore();

  return (
    <button
      onClick={() => addItem(product)}
      className={`group flex items-center justify-between bg-foreground text-background px-8 py-5 hover:bg-transparent hover:text-foreground border border-transparent hover:border-foreground transition-all w-full ${className}`}
    >
      <span className="font-semibold text-xs tracking-[0.2em] uppercase">Add to Bag</span>
      <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
    </button>
  );
}
