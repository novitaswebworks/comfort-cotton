"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ORDER_STATUSES } from "@/lib/admin/orders";
import { logAudit } from "@/lib/admin/audit";
import { PAYMENT_STATUSES } from "@/lib/payment";

type ActionResult = { success: true } | { success: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Server actions are public POST endpoints; the /admin proxy does not cover them.
async function requireAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") throw new Error("Unauthorized");
}

async function update(id: string, patch: Record<string, unknown>, summary: (n: number) => string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (typeof id !== "string" || !UUID.test(id)) return { success: false, error: "Invalid order" };
    const { data, error } = await getSupabaseAdmin().from("orders").update(patch).eq("id", id).select("order_number").maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: "Order not found" };
    await logAudit({ action: "update", entity: "order", entityId: id, summary: summary(data.order_number) });
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

export async function setOrderStatus(id: string, status: string): Promise<ActionResult> {
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return { success: false, error: "Unknown status" };
  return update(id, { status }, (n) => `Order #${n} set to ${status}`);
}

export async function setPaymentStatus(id: string, paymentStatus: string): Promise<ActionResult> {
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) return { success: false, error: "Unknown payment status" };
  const paid = paymentStatus === "Paid" || paymentStatus === "Advance paid";
  return update(id, { payment_status: paymentStatus, paid_at: paid ? new Date().toISOString() : null }, (n) => `Order #${n} payment marked ${paymentStatus}`);
}

export async function saveOrderNote(id: string, note: string): Promise<ActionResult> {
  const text = typeof note === "string" ? note.trim().slice(0, 1000) : "";
  return update(id, { admin_note: text || null }, (n) => `Edited private note on order #${n}`);
}
