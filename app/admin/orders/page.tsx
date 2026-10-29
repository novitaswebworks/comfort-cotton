import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { EmptyState, PageHeader, Panel, btn, field } from "@/components/admin/ui";
import OrdersList from "@/components/admin/OrdersList";
import { ORDERS_PAGE_SIZE, ORDER_STATUSES, listOrders, orderCounts } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const [{ orders, total, error }, counts] = await Promise.all([listOrders({ status: sp.status, q: sp.q, page }), orderCounts()]);
  const pages = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));
  const href = (extra: Record<string, string>) => {
    const params = new URLSearchParams({ ...(sp.status ? { status: sp.status } : {}), ...(sp.q ? { q: sp.q } : {}), ...extra });
    return `/admin/orders?${params}`;
  };

  return (
    <div>
      <PageHeader title="Orders" description="Checkouts started from the store's WhatsApp button. Confirm and track them here." />

      <div className="mb-4 flex flex-wrap gap-2" aria-label="Filter by status">
        <Link href="/admin/orders" className={sp.status ? btn.secondary : btn.primary}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={sp.status === s ? btn.primary : btn.secondary}>
            {s} <span className="opacity-60">{counts[s] ?? 0}</span>
          </Link>
        ))}
      </div>
      <form className="mb-4 flex gap-2" role="search">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Order number, name or phone" aria-label="Search orders" className={`${field} max-w-sm`} />
        <button className={btn.secondary}>Search</button>
      </form>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Couldn&apos;t load orders</p>
            <p className="mt-0.5 text-muted-foreground">{/orders/i.test(error) ? "The orders table doesn't exist yet. Run the orders SQL migration in Supabase." : error}</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <Panel><EmptyState title="No orders yet" body="Orders appear here when a customer taps Checkout via WhatsApp." /></Panel>
      ) : (
        <>
          <OrdersList orders={orders} />
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{total} order{total === 1 ? "" : "s"} · page {page} of {pages}</span>
            <span className="flex gap-2">
              {page > 1 && <Link href={href({ page: String(page - 1) })} className={btn.secondary}>Previous</Link>}
              {page < pages && <Link href={href({ page: String(page + 1) })} className={btn.secondary}>Next</Link>}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
