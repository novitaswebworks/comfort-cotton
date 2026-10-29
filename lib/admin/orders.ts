import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { PaymentMethod, PaymentStatus } from "@/lib/payment";

export const ORDER_STATUSES = ["New", "Confirmed", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  id: string;
  tag: string;
  name: string;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: number;
  status: OrderStatus;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_pincode: string | null;
  order_note: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount_due_now: number;
  paid_at: string | null;
  items: OrderItem[];
  subtotal: number;
  admin_note: string | null;
  created_at: string;
}

export const ORDERS_PAGE_SIZE = 15;

export async function listOrders(f: { status?: string; payment?: string; q?: string; page?: number }) {
  const page = Math.max(1, f.page ?? 1);
  const from = (page - 1) * ORDERS_PAGE_SIZE;
  let query = getSupabaseAdmin()
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + ORDERS_PAGE_SIZE - 1);

  if ((ORDER_STATUSES as readonly string[]).includes(f.status ?? "")) query = query.eq("status", f.status!);
  // "unpaid" = anything still waiting on money from the customer, ignoring cancelled orders.
  if (f.payment === "unpaid") query = query.eq("payment_status", "Unpaid").neq("status", "Cancelled");
  const q = (f.q ?? "").replace(/[^\p{L}\p{N}\s+#]/gu, "").replace("#", "").trim().slice(0, 40);
  if (/^\d+$/.test(q) && q.length < 10) query = query.eq("order_number", Number(q));
  else if (q) query = query.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);

  try {
    const { data, count, error } = await query;
    if (error) return { orders: [] as Order[], total: 0, page, error: error.message };
    return { orders: (data ?? []) as Order[], total: count ?? 0, page, error: null };
  } catch (err) {
    return { orders: [] as Order[], total: 0, page, error: err instanceof Error ? err.message : "Database unreachable" };
  }
}

/** Counts per status for the filter chips and the dashboard. */
export async function orderCounts() {
  const counts: Record<string, number> = {};
  try {
    const db = getSupabaseAdmin();
    await Promise.all(
      ORDER_STATUSES.map(async (s) => {
        const { count } = await db.from("orders").select("*", { count: "exact", head: true }).eq("status", s);
        counts[s] = count ?? 0;
      }),
    );
  } catch {}
  return counts;
}
