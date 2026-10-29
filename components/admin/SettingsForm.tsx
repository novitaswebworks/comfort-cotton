"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { btn, field } from "@/components/admin/ui";
import { saveSettings } from "@/app/admin/settings/actions";

export default function SettingsForm({ whatsappNumber }: { whatsappNumber: string }) {
  const router = useRouter();
  const [value, setValue] = useState(whatsappNumber);
  const [saving, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveSettings({ whatsapp_number: value });
      if (res.success) {
        setValue(res.whatsapp_number);
        toast.success("Settings saved");
        router.refresh();
      } else toast.error(res.error);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label htmlFor="wa" className="mb-1.5 block text-sm font-medium">WhatsApp number for orders</label>
        <input id="wa" inputMode="tel" value={value} onChange={(e) => setValue(e.target.value)} className={field} placeholder="917420005600" />
        <p className="mt-1.5 text-xs text-muted-foreground">Country code first, digits only (91 for India). Used by the chat button and the checkout.</p>
      </div>
      <button className={btn.primary} disabled={saving || value.replace(/\D/g, "") === whatsappNumber}>{saving ? "Saving…" : "Save"}</button>
    </form>
  );
}
