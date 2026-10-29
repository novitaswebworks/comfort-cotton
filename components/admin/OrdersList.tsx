"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Panel, btn, field } from "@/components/admin/ui";
import { saveOrderNote, setOrderStatus } from "@/app/admin/orders/actions";
import { formatRupees } from "@/lib/pricing";

// Mirrors lib/admin/orders.ts, which is server-only and can't be imported here.
const STATUSES = ["New", "Confirmed", "Shipped", "Delivered", "Cancelled"] as const;

export interface OrderRow {
  id: string;
  order_number: number;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: { tag: string; name: string; unit_price: number; quantity: number }[];
  subtotal: number;
  admin_note: string | null;
  created_at: string;
}

const TONE: Record<string, string> = {
  New: "bg-primary/15 text-foreground",
  Confirmed: "bg-warning/15 text-warning",
  Shipped: "bg-warning/15 text-warning",
  Delivered: "bg-success/15 text-success",
  Cancelled: "bg-destructive/15 text-destructive",
};

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function Row({ o }: { o: OrderRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(o.admin_note ?? "");
  const [busy, startTransition] = useTransition();

  const run = (fn: () => Promise<{ success: true } | { success: false; error: string }>, ok: string) =>
    startTransition(async () => {
      const res = await fn();
      if (res.success) { toast.success(ok); router.refresh(); } else toast.error(res.error);
    });

  const wa = o.customer_phone ? `https://wa.me/${o.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello${o.customer_name ? " " + o.customer_name : ""}, this is Comfort Cottons about your order #${o.order_number}.`)}` : null;

  return (
    <li>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
            #{o.order_number}
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[o.status] ?? ""}`}>{o.status}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {o.customer_name || "No name"} · {o.customer_phone || "No phone"} · {when(o.created_at)}
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium">{formatRupees(Number(o.subtotal))}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border bg-muted/20 p-4 sm:px-5">
          <ul className="space-y-1 text-sm">
            {o.items.map((i) => (
              <li key={i.tag} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">{i.quantity} × {i.name} <span className="text-muted-foreground">({i.tag})</span></span>
                <span className="shrink-0">{formatRupees(i.unit_price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium" htmlFor={`st-${o.id}`}>Status</label>
            <select id={`st-${o.id}`} value={o.status} disabled={busy} onChange={(e) => run(() => setOrderStatus(o.id, e.target.value), "Status updated")} className={`${field} !w-auto`}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {wa && <a href={wa} target="_blank" rel="noreferrer" className={btn.secondary}><MessageCircle className="h-4 w-4" /> Message customer</a>}
          </div>
          <div>
            <label htmlFor={`nt-${o.id}`} className="mb-1.5 block text-sm font-medium">Private note</label>
            <textarea id={`nt-${o.id}`} rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Address, payment received, courier details…" className={field} />
            <button disabled={busy || note.trim() === (o.admin_note ?? "")} onClick={() => run(() => saveOrderNote(o.id, note), "Note saved")} className={`${btn.secondary} mt-2`}>Save note</button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function OrdersList({ orders }: { orders: OrderRow[] }) {
  return (
    <Panel className="overflow-hidden !p-0">
      <ul className="divide-y divide-border">{orders.map((o) => <Row key={o.id} o={o} />)}</ul>
    </Panel>
  );
}
