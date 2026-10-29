"use client";

import { useCartStore } from "@/lib/store/useCartStore";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { AnimatePresence, motion } from "framer-motion";
import CheckoutForm, { type PlacedOrder } from "@/components/storefront/CheckoutForm";
import OrderPlaced from "@/components/storefront/OrderPlaced";
import { formatRupees } from "@/lib/pricing";
import type { PaymentConfig } from "@/lib/payment";

export default function CartDrawer({ whatsappNumber, payment }: { whatsappNumber?: string; payment: PaymentConfig }) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, syncWithCatalogue, clearCart } = useCartStore();
  const mounted = useMounted();
  const [view, setView] = useState<"bag" | "details" | "placed">("bag");
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Refresh prices/availability whenever the drawer opens on the bag.
  const itemIds = items.map((i) => i.id).join(",");
  useEffect(() => {
    if (!isOpen || !itemIds || view === "placed") return;
    const controller = new AbortController();
    fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: itemIds.split(",") }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.items && syncWithCatalogue(data.items))
      .catch(() => {});
    return () => controller.abort();
  }, [isOpen, itemIds, view, syncWithCatalogue]);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const finish = () => {
    clearCart();
    setPlaced(null);
    setView("bag");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // Lenis (smooth scroll) would otherwise hijack wheel events and scroll the page behind the drawer.
            data-lenis-prevent
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-[10000] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-light tracking-wide flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <ShoppingBag className="w-5 h-5" /> {view === "placed" ? "Order placed" : view === "details" ? "Checkout" : "Your Bag"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {view === "placed" && placed ? (
              <OrderPlaced order={placed} payment={payment} whatsappNumber={whatsappNumber} onDone={finish} />
            ) : view === "details" && items.length > 0 ? (
              <CheckoutForm
                items={items}
                total={total}
                payment={payment}
                onBack={() => setView("bag")}
                onPlaced={(order) => { setPlaced(order); setView("placed"); }}
              />
            ) : (
            <>
            <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70">
                  <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm uppercase tracking-widest font-medium">Your bag is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="relative w-20 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <Image fill src={item.image_url} alt={item.name} className="object-cover" sizes="80px" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{item.tag}</p>
                          {item.type && <p className="text-xs text-muted-foreground mt-0.5">{item.type}</p>}
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-background border border-border rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-foreground/70">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-foreground/70">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="font-semibold text-sm">{formatRupees(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Estimated Total</span>
                  <span className="text-2xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>{formatRupees(total)}</span>
                </div>
                <button
                  onClick={() => setView("details")}
                  className="w-full flex items-center justify-center gap-3 bg-foreground text-background px-6 py-4 rounded-xl hover:opacity-90 transition-all font-semibold uppercase tracking-wider text-xs"
                >
                  Continue to checkout
                </button>
                <p className="text-center text-[10px] text-muted-foreground mt-4 tracking-wide uppercase">
                  Prices include taxes · pay by UPI or cash on delivery
                </p>
              </div>
            )}
            </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
