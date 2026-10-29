"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { CartItem } from "@/lib/store/useCartStore";
import { formatRupees } from "@/lib/pricing";
import { PHONE_RE, PINCODE_RE, amountDueNow, type PaymentConfig, type PaymentMethod } from "@/lib/payment";
import type { OrderDetails } from "@/lib/order-message";

const STORAGE_KEY = "cc_checkout_details";

export interface PlacedOrder {
  orderNumber: number | null;
  total: number;
  amountDueNow: number;
  details: OrderDetails;
  items: CartItem[];
}

const input = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-foreground/20";
const label = "mb-1 block text-[11px] font-medium uppercase tracking-widest text-muted-foreground";

export default function CheckoutForm({
  items, total, payment, onBack, onPlaced,
}: {
  items: CartItem[];
  total: number;
  payment: PaymentConfig;
  onBack: () => void;
  onPlaced: (order: PlacedOrder) => void;
}) {
  const [v, setV] = useState({ name: "", phone: "", address: "", city: "", pincode: "", note: "" });
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [canFallback, setCanFallback] = useState(false);
  const [busy, setBusy] = useState(false);

  // Returning customers don't retype their details.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved && typeof saved === "object") setV((s) => ({ ...s, ...saved, note: "" })); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {}
  }, []);

  const set = (k: keyof typeof v, val: string) => { setV((s) => ({ ...s, [k]: val })); setErrors((e) => ({ ...e, [k]: "" })); };

  const dueUpi = amountDueNow("UPI", total, payment.codAdvancePercent);
  const dueCod = amountDueNow("COD", total, payment.codAdvancePercent);

  const validate = () => {
    const e: Record<string, string> = {};
    if (v.name.trim().length < 2) e.name = "Enter your name";
    if (!PHONE_RE.test(v.phone.replace(/[^\d+]/g, ""))) e.phone = "Enter a valid phone number";
    if (v.address.trim().length < 6) e.address = "Enter your full address";
    if (v.city.trim().length < 2) e.city = "Enter your city";
    if (!PINCODE_RE.test(v.pincode.trim())) e.pincode = "Enter a 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const details: OrderDetails = { name: v.name.trim(), phone: v.phone.trim(), address: v.address.trim(), city: v.city.trim(), pincode: v.pincode.trim(), note: v.note.trim(), paymentMethod: method };

  const finish = (orderNumber: number | null, dueNow: number) => {
    try {
      const { note: _note, ...keep } = v;
      void _note;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keep));
    } catch {}
    onPlaced({ orderNumber, total, amountDueNow: dueNow, details, items });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !validate()) return;
    setBusy(true);
    setServerError(null);
    setCanFallback(false);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, quantity: i.quantity })), ...details, paymentMethod: method }),
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return finish(data.orderNumber ?? null, data.amountDueNow ?? (method === "UPI" ? dueUpi : dueCod));
      setServerError(data.error ?? "We couldn't place your order. Please try again.");
      setCanFallback(res.status >= 500);
    } catch {
      setServerError("We couldn't reach the store. Check your connection and try again.");
      setCanFallback(true);
    } finally {
      setBusy(false);
    }
  };

  const field = (k: keyof typeof v, text: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`co-${k}`} className={label}>{text}</label>
      <input id={`co-${k}`} value={v[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} className={input} {...props} />
      {errors[k] && <p role="alert" className="mt-1 text-xs text-red-500">{errors[k]}</p>}
    </div>
  );

  const option = (m: PaymentMethod, title: string, sub: string) => (
    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${method === m ? "border-foreground" : "border-border"}`}>
      <input type="radio" name="payment" checked={method === m} onChange={() => setMethod(m)} className="mt-1" />
      <span><span className="block font-medium">{title}</span><span className="block text-xs text-muted-foreground">{sub}</span></span>
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to bag
        </button>
        <h3 className="text-lg font-light" style={{ fontFamily: "'Playfair Display', serif" }}>Delivery details</h3>
        {field("name", "Full name", { autoComplete: "name", maxLength: 80 })}
        {field("phone", "Phone / WhatsApp", { autoComplete: "tel", inputMode: "tel", maxLength: 20, placeholder: "+91 98765 43210" })}
        {field("address", "Address", { autoComplete: "street-address", maxLength: 300, placeholder: "House no., street, area" })}
        <div className="grid grid-cols-2 gap-3">
          {field("city", "City", { autoComplete: "address-level2", maxLength: 80 })}
          {field("pincode", "Pincode", { autoComplete: "postal-code", inputMode: "numeric", maxLength: 6 })}
        </div>
        {field("note", "Order note (optional)", { maxLength: 300, placeholder: "Gift message, delivery instructions…" })}

        <h3 className="pt-2 text-lg font-light" style={{ fontFamily: "'Playfair Display', serif" }}>Payment</h3>
        <div className="space-y-2" role="radiogroup" aria-label="Payment method">
          {option("UPI", `Pay by UPI · ${formatRupees(dueUpi)}`, "GPay, PhonePe, Paytm or any UPI app. Pay the full amount now.")}
          {option("COD", dueCod > 0 ? `Cash on delivery · ${formatRupees(dueCod)} advance` : "Cash on delivery", dueCod > 0 ? `Pay ${formatRupees(dueCod)} by UPI now (${payment.codAdvancePercent}%), the remaining ${formatRupees(total - dueCod)} when it arrives.` : `Pay ${formatRupees(total)} when it arrives.`)}
        </div>
        {serverError && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs">
            <p>{serverError}</p>
            {canFallback && <button type="button" onClick={() => finish(null, method === "UPI" ? dueUpi : dueCod)} className="mt-2 underline">Continue on WhatsApp without saving</button>}
          </div>
        )}
      </div>
      <div className="border-t border-border bg-muted/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Total</span>
          <span className="text-2xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>{formatRupees(total)}</span>
        </div>
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-4 text-xs font-semibold uppercase tracking-wider text-background disabled:opacity-60">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</> : "Place order"}
        </button>
      </div>
    </form>
  );
}
