import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface AuditEntry {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  summary: string;
}

/**
 * Records an admin action. Best effort: a logging failure must never block or fail the
 * change itself, so errors are swallowed (and printed for the server logs).
 */
export async function logAudit(entry: { action: string; entity: string; entityId?: string | null; summary: string }) {
  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    const { error } = await getSupabaseAdmin()
      .from("audit_log")
      .insert([
        {
          actor_id: userId,
          actor_email: user?.primaryEmailAddress?.emailAddress ?? null,
          action: entry.action,
          entity: entry.entity,
          entity_id: entry.entityId ?? null,
          summary: entry.summary.slice(0, 500),
        },
      ]);
    if (error) console.error("Audit log write failed:", error.message);
  } catch (err) {
    console.error("Audit log write failed:", err instanceof Error ? err.message : err);
  }
}

export const AUDIT_PAGE_SIZE = 25;

export async function listAudit(f: { entity?: string; page?: number }) {
  const page = Math.max(1, f.page ?? 1);
  const from = (page - 1) * AUDIT_PAGE_SIZE;
  let query = getSupabaseAdmin()
    .from("audit_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + AUDIT_PAGE_SIZE - 1);
  if (f.entity && ["product", "order", "user", "setting"].includes(f.entity)) query = query.eq("entity", f.entity);
  try {
    const { data, count, error } = await query;
    if (error) return { entries: [] as AuditEntry[], total: 0, page, error: error.message };
    return { entries: (data ?? []) as AuditEntry[], total: count ?? 0, page, error: null };
  } catch (err) {
    return { entries: [] as AuditEntry[], total: 0, page, error: err instanceof Error ? err.message : "Database unreachable" };
  }
}
