export const PAYMENT_METHODS = ["UPI", "COD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["Unpaid", "Advance paid", "Paid", "Refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** What the customer must pay right now: everything for UPI, the advance share for COD (whole rupees, rounded up). */
export function amountDueNow(method: PaymentMethod, subtotal: number, advancePercent: number): number {
  if (method === "UPI") return subtotal;
  if (advancePercent <= 0) return 0;
  return Math.min(subtotal, Math.ceil((subtotal * advancePercent) / 100));
}

/** UPI deep link. Opens the customer's UPI app with the payee, amount and order reference filled in. */
export function upiLink(o: { id: string; name: string; amount: number; orderNumber?: number | null }): string {
  const params = new URLSearchParams({ pa: o.id, pn: o.name, am: o.amount.toFixed(2), cu: "INR" });
  if (o.orderNumber) params.set("tn", `Order ${o.orderNumber}`);
  // URLSearchParams encodes spaces as "+", which some UPI apps show literally.
  return `upi://pay?${params.toString().replace(/\+/g, "%20")}`;
}

/** Indian mobile or international number, digits with an optional leading +. */
export const PHONE_RE = /^\+?\d{10,15}$/;
export const PINCODE_RE = /^[1-9]\d{5}$/;

export interface PaymentConfig {
  upiId: string;
  upiName: string;
  codAdvancePercent: number;
}
