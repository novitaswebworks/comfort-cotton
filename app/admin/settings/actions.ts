"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeWhatsAppNumber } from "@/lib/settings";
import { logAudit } from "@/lib/admin/audit";

type ActionResult = { success: true; whatsapp_number: string } | { success: false; error: string };

// Server actions are public POST endpoints; the /admin proxy does not cover them.
async function requireAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") throw new Error("Unauthorized");
}

export async function saveSettings(input: { whatsapp_number: string }): Promise<ActionResult> {
  try {
    await requireAdmin();
    const number = normalizeWhatsAppNumber(input?.whatsapp_number);
    if (!number) return { success: false, error: "Enter the WhatsApp number with country code, e.g. 917420005600" };

    const { error } = await getSupabaseAdmin()
      .from("site_settings")
      .upsert({ key: "whatsapp_number", value: number, updated_at: new Date().toISOString() });
    if (error) {
      return { success: false, error: /site_settings/i.test(error.message) ? "The site_settings table doesn't exist yet. Run the settings SQL migration in Supabase." : error.message };
    }
    await logAudit({ action: "update", entity: "setting", entityId: "whatsapp_number", summary: `Changed the WhatsApp number to +${number}` });
    revalidatePath("/", "layout");
    return { success: true, whatsapp_number: number };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
