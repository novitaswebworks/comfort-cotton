import { createClient } from "@supabase/supabase-js";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export interface SiteSettings {
  whatsapp_number: string;
}

export const SETTING_DEFAULTS: SiteSettings = { whatsapp_number: WHATSAPP_NUMBER };

/** Digits only, country code included, e.g. 917420005600. Returns null when it can't be valid. */
export function normalizeWhatsAppNumber(input: unknown): string | null {
  const digits = typeof input === "string" ? input.replace(/\D/g, "") : "";
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : null;
}

/** Reads settings with the public key; any failure falls back to the built-in defaults. */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await db.from("site_settings").select("key,value");
    if (error || !data) return SETTING_DEFAULTS;
    const map = new Map(data.map((r) => [r.key as string, r.value as string]));
    return { whatsapp_number: normalizeWhatsAppNumber(map.get("whatsapp_number")) ?? SETTING_DEFAULTS.whatsapp_number };
  } catch {
    return SETTING_DEFAULTS;
  }
}
