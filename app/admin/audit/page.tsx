import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { EmptyState, PageHeader, Panel, btn } from "@/components/admin/ui";
import { AUDIT_PAGE_SIZE, listAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity" };

const FILTERS = [["", "All"], ["product", "Products"], ["order", "Orders"], ["user", "Users"], ["setting", "Settings"]] as const;
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ entity?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const { entries, total, error } = await listAudit({ entity: sp.entity, page });
  const pages = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));
  const href = (p: number) => `/admin/audit?${new URLSearchParams({ ...(sp.entity ? { entity: sp.entity } : {}), page: String(p) })}`;

  return (
    <div>
      <PageHeader title="Activity" description="A record of changes made in the admin: who did what, and when." />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([value, label]) => (
          <Link key={label} href={value ? `/admin/audit?entity=${value}` : "/admin/audit"} className={(sp.entity ?? "") === value ? btn.primary : btn.secondary}>{label}</Link>
        ))}
      </div>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p>{/audit_log/i.test(error) ? "The audit_log table doesn't exist yet. Run the audit SQL migration in Supabase." : error}</p>
        </div>
      ) : entries.length === 0 ? (
        <Panel><EmptyState title="No activity yet" body="Changes you make to products, orders and users will be listed here." /></Panel>
      ) : (
        <>
          <Panel className="overflow-hidden !p-0">
            <ul className="divide-y divide-border">
              {entries.map((e) => (
                <li key={e.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-5">
                  <div className="min-w-0">
                    <p className="text-sm">{e.summary}</p>
                    <p className="text-xs text-muted-foreground">{e.actor_email ?? "Unknown user"}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">{when(e.created_at)}</p>
                </li>
              ))}
            </ul>
          </Panel>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{total} entr{total === 1 ? "y" : "ies"} · page {page} of {pages}</span>
            <span className="flex gap-2">
              {page > 1 && <Link href={href(page - 1)} className={btn.secondary}>Previous</Link>}
              {page < pages && <Link href={href(page + 1)} className={btn.secondary}>Next</Link>}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
