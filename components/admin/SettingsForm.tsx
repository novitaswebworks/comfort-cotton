"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { btn, field } from "@/components/admin/ui";
import { saveSettings } from "@/app/admin/settings/actions";
import type { SiteSettings } from "@/lib/settings";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [v, setV] = useState({
    whatsapp_number: settings.whatsapp_number,
    upi_id: settings.upi_id,
    upi_name: settings.upi_name,
    cod_advance_percent: String(settings.cod_advance_percent),
  });
  const [saved, setSaved] = useState(v);
  const [saving, startTransition] = useTransition();
  const set = (k: keyof typeof v, val: string) => setV((s) => ({ ...s, [k]: val }));
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveSettings(v);
      if (res.success) {
        const next = { whatsapp_number: res.settings.whatsapp_number, upi_id: res.settings.upi_id, upi_name: res.settings.upi_name, cod_advance_percent: String(res.settings.cod_advance_percent) };
        setV(next);
        setSaved(next);
        toast.success("Settings saved");
        router.refresh();
      } else toast.error(res.error);
    });
  };

  const label = "mb-1.5 block text-sm font-medium";
  const hint = "mt-1.5 text-xs text-muted-foreground";

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="wa" className={label}>WhatsApp number for orders</label>
        <input id="wa" inputMode="tel" value={v.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} className={field} placeholder="917420005600" />
        <p className={hint}>Country code first, digits only (91 for India). Used by the chat button and the checkout.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="upi" className={label}>UPI ID</label>
          <input id="upi" value={v.upi_id} onChange={(e) => set("upi_id", e.target.value)} className={field} placeholder="name@bank" autoCapitalize="none" />
          <p className={hint}>Customers pay to this ID. Leave empty to hide payment buttons (you&apos;ll share payment details on WhatsApp).</p>
        </div>
        <div>
          <label htmlFor="upiname" className={label}>Name shown on the payment</label>
          <input id="upiname" value={v.upi_name} onChange={(e) => set("upi_name", e.target.value)} maxLength={60} className={field} placeholder="Comfort Cottons" />
        </div>
      </div>
      <div className="max-w-xs">
        <label htmlFor="adv" className={label}>Cash on delivery advance (%)</label>
        <input id="adv" type="number" min="0" max="100" step="1" value={v.cod_advance_percent} onChange={(e) => set("cod_advance_percent", e.target.value)} className={field} />
        <p className={hint}>Share of the order paid by UPI up front for COD orders. 0 means no advance.</p>
      </div>
      <button className={btn.primary} disabled={saving || !dirty}>{saving ? "Saving…" : "Save"}</button>
    </form>
  );
}
