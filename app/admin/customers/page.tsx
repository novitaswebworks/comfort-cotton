import { AlertTriangle, MessageCircle } from "lucide-react";
import { EmptyState, PageHeader, Panel, btn } from "@/components/admin/ui";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { formatRupees } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

interface Customer {
  key: string;
  name: string | null;
  phone: string | null;
  orders: number;
  spent: number;
  last: string;
}

// Customers are derived from orders (grouped by phone, else by name); there is no separate table.
async function loadCustomers() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("orders")
      .select("customer_name,customer_phone,subtotal,status,created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) return { customers: [] as Customer[], anonymous: 0, error: error.message };

    const map = new Map<string, Customer>();
    let anonymous = 0;
    for (const o of data ?? []) {
      const phone = o.customer_phone as string | null;
      const name = (o.customer_name as string | null)?.trim() || null;
      if (!phone && !name) { anonymous += 1; continue; }
      const key = phone ?? `name:${name!.toLowerCase()}`;
      const c = map.get(key) ?? { key, name, phone, orders: 0, spent: 0, last: o.created_at as string };
      c.orders += 1;
      if (o.status !== "Cancelled") c.spent += Number(o.subtotal);
      c.name ??= name;
      map.set(key, c);
    }
    return { customers: [...map.values()].sort((a, b) => b.last.localeCompare(a.last)), anonymous, error: null };
  } catch (err) {
    return { customers: [] as Customer[], anonymous: 0, error: err instanceof Error ? err.message : "Database unreachable" };
  }
}

export default async function CustomersPage() {
  const { customers, anonymous, error } = await loadCustomers();
  return (
    <div>
      <PageHeader title="Customers" description="People who have started a checkout with their name or phone. Cancelled orders don't count towards spend." />
      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p>{/orders/i.test(error) ? "The orders table doesn't exist yet." : error}</p>
        </div>
      ) : customers.length === 0 ? (
        <Panel><EmptyState title="No customers yet" body="Customers appear once someone checks out and gives a name or phone number." /></Panel>
      ) : (
        <>
          <Panel className="overflow-hidden !p-0">
            <ul className="divide-y divide-border">
              {customers.map((c) => (
                <li key={c.key} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name ?? "No name"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.phone ?? "No phone"} · {c.orders} order{c.orders === 1 ? "" : "s"} · last {new Date(c.last).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatRupees(c.spent)}</span>
                    {c.phone && (
                      <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className={btn.secondary}>
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          {anonymous > 0 && <p className="mt-3 text-xs text-muted-foreground">{anonymous} order{anonymous === 1 ? "" : "s"} had no name or phone and aren&apos;t listed.</p>}
        </>
      )}
    </div>
  );
}
