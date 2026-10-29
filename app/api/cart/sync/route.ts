import { NextResponse } from "next/server";
import { getPublishedProductsByIds } from "@/lib/products";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Returns current price/availability for cart items so stale browser-stored carts self-correct.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 50 || !ids.every((i) => typeof i === "string" && UUID.test(i))) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }
  const { data, error } = await getPublishedProductsByIds(ids as string[]);
  if (error) return NextResponse.json({ error: "Catalogue unavailable" }, { status: 503 });
  return NextResponse.json({ items: data });
}
