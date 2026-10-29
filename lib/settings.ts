import { createClient } from "@supabase/supabase-js";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export interface SiteSettings {
  whatsapp_number: string;
  /** Empty until the owner sets it; UPI payment screens are hidden without it. */
  upi_id: string;
  upi_name: string;
  cod_advance_percent: number;
}

export const SETTING_DEFAULTS: SiteSettings = {
  whatsapp_number: WHATSAPP_NUMBER,
  upi_id: "",
  upi_name: "Comfort Cottons",
  cod_advance_percent: 20,
};

/** Digits only, country code included, e.g. 917420005600. Returns null when it can't be valid. */
export function normalizeWhatsAppNumber(input: unknown): string | null {
  const digits = typeof input === "string" ? input.replace(/\D/g, "") : "";
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : null;
}

export function normalizeUpiId(input: unknown): string | null {
  const v = typeof input === "string" ? input.trim() : "";
  return /^[A-Za-z0-9._-]{2,64}@[A-Za-z][A-Za-z0-9]{1,30}$/.test(v) ? v : null;
}

export function normalizeAdvancePercent(input: unknown): number | null {
  const n = typeof input === "number" ? input : /^\d{1,3}$/.test(String(input ?? "").trim()) ? Number(String(input).trim()) : NaN;
  return Number.isInteger(n) && n >= 0 && n <= 100 ? n : null;
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
    return {
      whatsapp_number: normalizeWhatsAppNumber(map.get("whatsapp_number")) ?? SETTING_DEFAULTS.whatsapp_number,
      upi_id: normalizeUpiId(map.get("upi_id")) ?? "",
      upi_name: (map.get("upi_name") ?? "").trim().slice(0, 60) || SETTING_DEFAULTS.upi_name,
      cod_advance_percent: normalizeAdvancePercent(map.get("cod_advance_percent")) ?? SETTING_DEFAULTS.cod_advance_percent,
    };
  } catch {
    return SETTING_DEFAULTS;
  }
}
