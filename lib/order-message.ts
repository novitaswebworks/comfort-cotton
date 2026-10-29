import { formatRupees } from "@/lib/pricing";
import type { PaymentMethod } from "@/lib/payment";

export interface MessageItem {
  name: string;
  tag: string;
  type?: string;
  price: number;
  quantity: number;
}

/** WhatsApp bold/italic markers inside user text would garble the message; neutralise them. */
const plain = (v: string) => v.replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();

export interface OrderDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

/** The pre-filled message a customer sends once the order is placed. */
export function buildOrderMessage(o: {
  items: MessageItem[];
  total: number;
  baseUrl: string;
  orderNumber?: number | null;
  details: OrderDetails;
  /** What the customer pays right now (UPI: whole order, COD: the advance). */
  amountDueNow: number;
  upiConfigured: boolean;
}): string {
  const d = o.details;
  const lines = o.items.map((i, n) => {
    const detail = i.type ? ` — ${plain(i.type)}` : "";
    return `${n + 1}. *${plain(i.name)}*${detail}\n   Ref: ${i.tag} · ${i.quantity} × ${formatRupees(i.price)} = ${formatRupees(i.price * i.quantity)}\n   ${o.baseUrl}/product/${encodeURIComponent(i.tag)}`;
  });

  const balance = o.total - o.amountDueNow;
  let payment: string;
  if (d.paymentMethod === "UPI") {
    payment = o.upiConfigured
      ? `UPI — ${formatRupees(o.amountDueNow)}. I'll send the payment screenshot here.`
      : "UPI — please share the payment details.";
  } else if (o.amountDueNow > 0) {
    payment = `Cash on delivery. Advance ${formatRupees(o.amountDueNow)} by UPI${o.upiConfigured ? " (screenshot to follow)" : ""}; ${formatRupees(balance)} to pay on delivery.`;
  } else {
    payment = `Cash on delivery — ${formatRupees(o.total)} to pay on delivery.`;
  }

  return [
    `Hello Comfort Cottons! I've placed an order${o.orderNumber ? ` (Order #${o.orderNumber})` : ""}.`,
    "",
    "*Items*",
    lines.join("\n\n"),
    "",
    `*Total: ${formatRupees(o.total)}* (prices include taxes; shipping to be confirmed)`,
    "",
    "*Delivery details*",
    `Name: ${plain(d.name)}`,
    `Phone: ${plain(d.phone)}`,
    `Address: ${plain(d.address)}, ${plain(d.city)} - ${plain(d.pincode)}`,
    ...(d.note?.trim() ? [`Note: ${plain(d.note)}`] : []),
    "",
    "*Payment*",
    payment,
    "",
    "Please confirm availability and delivery time. Thank you!",
  ].join("\n");
}

/** Pre-filled text for the floating chat button; mentions the product when opened from its page. */
export function buildChatMessage(path: string, origin: string): string {
  const m = path.match(/^\/product\/([^/?#]+)/);
  if (m) return `Hello Comfort Cottons! I have a question about this product:\n${origin}/product/${m[1]}`;
  const c = path.match(/^\/collections\/([^/?#]+)/);
  if (c) return `Hello Comfort Cottons! I have a question about your ${decodeURIComponent(c[1]).replace(/-/g, " ")} collection:\n${origin}/collections/${c[1]}`;
  return "Hello Comfort Cottons! I have a question about your products.";
}
