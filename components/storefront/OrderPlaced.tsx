"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Copy, MessageCircle, Smartphone } from "lucide-react";
import { formatRupees } from "@/lib/pricing";
import { upiLink, type PaymentConfig } from "@/lib/payment";
import { buildOrderMessage } from "@/lib/order-message";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import type { PlacedOrder } from "@/components/storefront/CheckoutForm";

export default function OrderPlaced({
  order, payment, whatsappNumber, onDone,
}: {
  order: PlacedOrder;
  payment: PaymentConfig;
  whatsappNumber?: string;
  onDone: () => void;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const upiConfigured = !!payment.upiId;
  const needsPayNow = upiConfigured && order.amountDueNow > 0;
  const link = needsPayNow ? upiLink({ id: payment.upiId, name: payment.upiName, amount: order.amountDueNow, orderNumber: order.orderNumber }) : null;

  useEffect(() => {
    if (!link) return;
    let cancelled = false;
    QRCode.toDataURL(link, { margin: 1, width: 220 }).then((url) => !cancelled && setQr(url)).catch(() => {});
    return () => { cancelled = true; };
  }, [link]);

  const sendWhatsApp = () => {
    const baseUrl = window.location.origin;
    const message = buildOrderMessage({
      items: order.items, total: order.total, baseUrl, orderNumber: order.orderNumber,
      details: order.details, amountDueNow: order.amountDueNow, upiConfigured,
    });
    const wa = generateWhatsAppLink(message, whatsappNumber);
    if (!window.open(wa, "_blank")) window.location.href = wa;
    onDone();
  };

  const copyUpi = async () => {
    try { await navigator.clipboard.writeText(payment.upiId); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
          <div>
            <h3 className="text-lg font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              {order.orderNumber ? `Order #${order.orderNumber} placed` : "Almost done"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {order.orderNumber ? "We have your details." : "We couldn't save your order online, but you can still send it to us on WhatsApp."} Send it on WhatsApp so we can confirm and ship.
            </p>
          </div>
        </div>

        {needsPayNow && link && (
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm">
              {order.details.paymentMethod === "UPI" ? "Pay now by UPI" : "Pay your advance by UPI"}
              <span className="block text-2xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>{formatRupees(order.amountDueNow)}</span>
            </p>
            <a href={link} className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-xs font-semibold uppercase tracking-wider text-background">
              <Smartphone className="h-4 w-4" /> Pay with UPI app
            </a>
            {qr && (
              <div className="flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt={`UPI QR code to pay ${formatRupees(order.amountDueNow)}`} width={180} height={180} className="rounded-lg bg-white p-2" />
                <p className="text-[11px] text-muted-foreground">On a computer? Scan this with any UPI app.</p>
              </div>
            )}
            <button type="button" onClick={copyUpi} className="flex w-full items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : `Copy UPI ID: ${payment.upiId}`}
            </button>
            <p className="text-[11px] text-muted-foreground">After paying, send the screenshot on WhatsApp. Your order is confirmed once we see the payment.</p>
          </div>
        )}
        {order.details.paymentMethod === "COD" && order.amountDueNow === 0 && (
          <p className="rounded-xl border border-border p-4 text-sm">Cash on delivery: pay {formatRupees(order.total)} when your order arrives.</p>
        )}
        {!upiConfigured && order.amountDueNow > 0 && (
          <p className="rounded-xl border border-border p-4 text-sm">We&apos;ll share the payment details with you on WhatsApp.</p>
        )}
      </div>
      <div className="space-y-2 border-t border-border bg-muted/10 p-6">
        <button onClick={sendWhatsApp} className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-600 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-green-600/20 hover:bg-green-700">
          <MessageCircle className="h-5 w-5" /> Send order on WhatsApp
        </button>
        <button onClick={onDone} className="w-full py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Close</button>
      </div>
    </div>
  );
}
