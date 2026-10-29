import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { effectivePrice } from "@/lib/pricing";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Best-effort throttle per server instance; it blunts casual spam, not a determined attacker.
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 10;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max) : "");

/** Records a WhatsApp checkout. Prices come from the database, never from the browser. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (throttled(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const lines: unknown = body?.items;
  if (
    !Array.isArray(lines) || lines.length === 0 || lines.length > 30 ||
    !lines.every((l) => l && typeof l.id === "string" && UUID.test(l.id) && Number.isInteger(l.quantity) && l.quantity >= 1 && l.quantity <= 50)
  ) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  const phone = clean(body?.phone, 20).replace(/[^\d+]/g, "");
  if (phone && !/^\+?\d{7,15}$/.test(phone)) return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  const name = clean(body?.name, 80);

  try {
    const db = getSupabaseAdmin();
    const ids = [...new Set((lines as { id: string }[]).map((l) => l.id))];
    const { data: products, error } = await db
      .from("products")
      .select("id,name,tag,price,sale_price")
      .in("id", ids)
      .eq("status", "Published")
      .eq("in_stock", true);
    if (error) throw new Error(error.message);

    const byId = new Map((products ?? []).map((p) => [p.id as string, p]));
    const items = [];
    let subtotal = 0;
    for (const l of lines as { id: string; quantity: number }[]) {
      const p = byId.get(l.id);
      if (!p) return NextResponse.json({ error: "Some items are no longer available" }, { status: 409 });
      const unit = effectivePrice(p);
      subtotal += unit * l.quantity;
      items.push({ id: p.id, tag: p.tag, name: p.name, unit_price: unit, quantity: l.quantity });
    }

    const { data: order, error: insertError } = await db
      .from("orders")
      .insert([{ items, subtotal, customer_name: name || null, customer_phone: phone || null }])
      .select("order_number")
      .single();
    if (insertError) throw new Error(insertError.message);

    return NextResponse.json({ orderNumber: order.order_number, subtotal });
  } catch (err) {
    console.error("Order logging failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not record the order" }, { status: 503 });
  }
}
