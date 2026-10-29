import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, Download, Eye, ExternalLink, FileText, Package, Plus, Tag } from "lucide-react";
import { EmptyState, PageHeader, Panel, StatCard, StatusBadge, btn } from "@/components/admin/ui";
import { getAllProducts } from "@/lib/admin/queries";
import { computeStats, inr } from "@/lib/admin/stats";
import { categorySlug } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

export default async function AdminDashboard() {
  const { products, error } = await getAllProducts();
  const s = computeStats(products);
  const maxMonth = Math.max(1, ...s.months.map((m) => m.count));

  return (
    <div>
      <PageHeader
        title="Overview"
        description="How the store looks right now, and what needs attention."
        actions={
          <>
            <Link href="/" target="_blank" className={btn.secondary}>
              <ExternalLink className="h-4 w-4" /> View store
            </Link>
            <Link href="/admin/products/new" className={btn.primary}>
              <Plus className="h-4 w-4" /> Add product
            </Link>
          </>
        }
      />

      {error && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">The database is unreachable</p>
            <p className="mt-0.5 text-muted-foreground">Figures below may be empty. Details: {error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Products" value={s.total} note="In the catalogue" icon={<Package className="h-4 w-4" />} />
        <StatCard label="Published" value={s.published} note="Live on the store" icon={<Eye className="h-4 w-4" />} />
        <StatCard label="Drafts" value={s.drafts} note="Hidden from customers" icon={<FileText className="h-4 w-4" />} />
        <StatCard
          label="Avg. price"
          value={s.published ? inr(s.avgPrice) : "—"}
          note={s.published ? `${inr(s.minPrice)} – ${inr(s.maxPrice)}` : "No published products"}
          icon={<Tag className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Products by category" className="lg:col-span-2" action={<Link href="/admin/categories" className="text-xs text-muted-foreground hover:text-foreground">Manage</Link>}>
          <ul className="space-y-4">
            {s.categories.map((c) => (
              <li key={c.name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">{c.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {c.published} live{c.drafts ? ` · ${c.drafts} draft` : ""}
                  </span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${c.published} published, ${c.drafts} drafts`}>
                  <div className="bg-primary" style={{ width: `${s.total ? (c.published / s.total) * 100 : 0}%` }} />
                  <div className="bg-warning/70" style={{ width: `${s.total ? (c.drafts / s.total) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Added in the last 6 months">
          <div className="flex h-40 items-end gap-2">
            {s.months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{m.count || ""}</span>
                <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${Math.max(4, (m.count / maxMonth) * 100)}px`, opacity: m.count ? 1 : 0.2 }} />
                <span className="text-[11px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Needs attention">
          {s.issues.length === 0 && s.emptyCategories.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> Everything looks good.
            </p>
          ) : (
            <ul className="space-y-4">
              {s.issues.map((i) => (
                <li key={i.id}>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 text-warning" /> {i.label} <span className="text-muted-foreground">({i.products.length})</span>
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 pl-6 text-sm">
                    {i.products.slice(0, 4).map((p) => (
                      <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                        {p.name}
                      </Link>
                    ))}
                    {i.products.length > 4 && <span className="text-muted-foreground">+{i.products.length - 4} more</span>}
                  </p>
                </li>
              ))}
              {s.emptyCategories.length > 0 && (
                <li>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 text-warning" /> Categories with nothing published <span className="text-muted-foreground">({s.emptyCategories.length})</span>
                  </p>
                  <p className="mt-1 pl-6 text-sm text-muted-foreground">{s.emptyCategories.map((c) => c.name).join(", ")}</p>
                </li>
              )}
            </ul>
          )}
        </Panel>

        <Panel title="Recently added" action={<Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>}>
          {s.recent.length === 0 ? (
            <EmptyState title="No products yet" body="Add your first product to start building the catalogue." href="/admin/products/new" cta="Add product" />
          ) : (
            <ul className="divide-y divide-border">
              {s.recent.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}/edit`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
                      {p.image_url && <Image src={p.image_url} alt="" fill sizes="44px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{categorySlug(p.category) ? p.category : `${p.category} (unrecognised)`}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm">{inr(Number(p.price))}</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Quick tools" className="mt-6">
        <div className="flex flex-wrap gap-2">
          <a href="/admin/export?format=csv" className={btn.secondary}><Download className="h-4 w-4" /> Export CSV</a>
          <a href="/admin/export?format=json" className={btn.secondary}><Download className="h-4 w-4" /> Backup (JSON)</a>
          <Link href="/admin/settings" className={btn.secondary}>System status</Link>
        </div>
      </Panel>
    </div>
  );
}
