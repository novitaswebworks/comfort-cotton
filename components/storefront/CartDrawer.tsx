"use client";

import { useCartStore } from "@/lib/store/useCartStore";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { X, Minus, Plus, ShoppingBag, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { AnimatePresence, motion } from "framer-motion";

export default function CartDrawer({ whatsappNumber }: { whatsappNumber?: string }) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, syncWithCatalogue } = useCartStore();
  const mounted = useMounted();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [placing, setPlacing] = useState(false);

  // Refresh prices/availability whenever the drawer opens.
  const itemIds = items.map((i) => i.id).join(",");
  useEffect(() => {
    if (!isOpen || !itemIds) return;
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
  }, [isOpen, itemIds, syncWithCatalogue]);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Log the order first so the WhatsApp message can carry its number. If logging fails
  // for any reason, the customer still gets through to WhatsApp.
  const handleCheckout = async () => {
    if (placing) return;
    setPlacing(true);
    let orderNumber: number | null = null;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, quantity: i.quantity })), name, phone }),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) orderNumber = (await res.json()).orderNumber ?? null;
    } catch {}

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://comfort-cotton.vercel.app";
    let message = `Hello Comfort Cottons! I would like to place an order${orderNumber ? ` (Order #${orderNumber})` : ""}:\n\n`;
    items.forEach((item) => {
      message += `- ${item.quantity}x ${item.name}\n  Tag: #${item.tag}\n  Price: ₹${item.price * item.quantity}\n  Link: ${baseUrl}/product/${item.tag}\n\n`;
    });
    message += `*Total Estimated Value: ₹${total}*\n\nName: ${name}\nDelivery address & pincode:\n\nPlease confirm availability, payment and shipping details.`;

    const link = generateWhatsAppLink(message, whatsappNumber);
    // A window opened after an await can be blocked by the browser; fall back to navigating.
    if (!window.open(link, "_blank")) window.location.href = link;
    setPlacing(false);
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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-[10000] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-light tracking-wide flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <ShoppingBag className="w-5 h-5" /> Your Bag
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                        <p className="font-semibold text-sm">₹{item.price * item.quantity}</p>
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
                  <span className="text-2xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>₹{total}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" placeholder="Your name (optional)" aria-label="Your name" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/70" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} inputMode="tel" autoComplete="tel" placeholder="Phone (optional)" aria-label="Phone number" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/70" />
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={placing}
                  className="w-full disabled:opacity-60 flex items-center justify-center gap-3 bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 transition-all font-semibold uppercase tracking-wider text-xs shadow-lg shadow-green-600/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  {placing ? "Opening WhatsApp…" : "Checkout via WhatsApp"}
                </button>
                <p className="text-center text-[10px] text-muted-foreground mt-4 tracking-wide uppercase">
                  Shipping & Taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
