"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeAdvancePercent, normalizeUpiId, normalizeWhatsAppNumber, type SiteSettings } from "@/lib/settings";
import { logAudit } from "@/lib/admin/audit";

type ActionResult = { success: true; settings: SiteSettings } | { success: false; error: string };

// Server actions are public POST endpoints; the /admin proxy does not cover them.
async function requireAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") throw new Error("Unauthorized");
}

export async function saveSettings(input: { whatsapp_number: string; upi_id: string; upi_name: string; cod_advance_percent: string | number }): Promise<ActionResult> {
  try {
    await requireAdmin();
    const whatsapp = normalizeWhatsAppNumber(input?.whatsapp_number);
    if (!whatsapp) return { success: false, error: "Enter the WhatsApp number with country code, e.g. 917420005600" };

    const upiRaw = typeof input?.upi_id === "string" ? input.upi_id.trim() : "";
    const upi = upiRaw === "" ? "" : normalizeUpiId(upiRaw);
    if (upi === null) return { success: false, error: "That doesn't look like a UPI ID. It should be like name@bank" };

    const upiName = (typeof input?.upi_name === "string" ? input.upi_name : "").trim().slice(0, 60);
    if (upi && !upiName) return { success: false, error: "Enter the name that should show on the UPI payment" };

    const advance = normalizeAdvancePercent(input?.cod_advance_percent);
    if (advance === null) return { success: false, error: "COD advance must be a whole number from 0 to 100" };

    const now = new Date().toISOString();
    const { error } = await getSupabaseAdmin()
      .from("site_settings")
      .upsert([
        { key: "whatsapp_number", value: whatsapp, updated_at: now },
        { key: "upi_id", value: upi || "-", updated_at: now },
        { key: "upi_name", value: upiName || "Comfort Cottons", updated_at: now },
        { key: "cod_advance_percent", value: String(advance), updated_at: now },
      ]);
    if (error) {
      return { success: false, error: /site_settings/i.test(error.message) ? "The site_settings table doesn't exist yet. Run the settings SQL migration in Supabase." : error.message };
    }
    await logAudit({ action: "update", entity: "setting", summary: `Updated store settings (WhatsApp +${whatsapp}, UPI ${upi || "not set"}, COD advance ${advance}%)` });
    revalidatePath("/", "layout");
    return { success: true, settings: { whatsapp_number: whatsapp, upi_id: upi, upi_name: upiName || "Comfort Cottons", cod_advance_percent: advance } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
