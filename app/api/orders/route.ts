import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { effectivePrice } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { PAYMENT_METHODS, PHONE_RE, PINCODE_RE, amountDueNow, type PaymentMethod } from "@/lib/payment";

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

  const fail = (error: string) => NextResponse.json({ error }, { status: 400 });
  const name = clean(body?.name, 80);
  const phone = clean(body?.phone, 20).replace(/[^\d+]/g, "");
  const address = clean(body?.address, 300);
  const city = clean(body?.city, 80);
  const pincode = clean(body?.pincode, 6);
  const note = clean(body?.note, 300);
  const method = body?.paymentMethod as PaymentMethod;

  if (name.length < 2) return fail("Please enter your name");
  if (!PHONE_RE.test(phone)) return fail("Please enter a valid phone number");
  if (address.length < 6) return fail("Please enter your full delivery address");
  if (city.length < 2) return fail("Please enter your city");
  if (!PINCODE_RE.test(pincode)) return fail("Please enter a valid 6-digit pincode");
  if (!(PAYMENT_METHODS as readonly string[]).includes(method)) return fail("Please choose a payment method");

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

    const settings = await getSettings();
    const dueNow = amountDueNow(method, subtotal, settings.cod_advance_percent);

    const { data: order, error: insertError } = await db
      .from("orders")
      .insert([
        {
          items, subtotal, amount_due_now: dueNow, payment_method: method,
          customer_name: name, customer_phone: phone, customer_address: address,
          customer_city: city, customer_pincode: pincode, order_note: note || null,
        },
      ])
      .select("order_number")
      .single();
    if (insertError) throw new Error(insertError.message);

    return NextResponse.json({ orderNumber: order.order_number, subtotal, amountDueNow: dueNow, paymentMethod: method });
  } catch (err) {
    console.error("Order logging failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not record the order" }, { status: 503 });
  }
}
