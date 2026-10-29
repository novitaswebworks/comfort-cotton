import Link from "next/link";
import { AlertTriangle, ExternalLink, Plus } from "lucide-react";
import { PageHeader, Panel, btn } from "@/components/admin/ui";
import { getAllProducts } from "@/lib/admin/queries";
import { computeStats } from "@/lib/admin/stats";
import { CATEGORY_DESCRIPTIONS, categorySlug } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { products, error } = await getAllProducts();
  const s = computeStats(products);
  const unknown = products.filter((p) => !s.categories.some((c) => c.name === p.category));

  return (
    <div>
      <PageHeader title="Categories" description="How the catalogue is organised. Each category has its own page on the store." />

      {error && (
        <p role="alert" className="mb-6 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> Couldn&apos;t load products: {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {s.categories.map((c) => {
          const slug = categorySlug(c.name)!;
          return (
            <Panel key={c.name} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium leading-snug">{c.name}</h2>
                {c.published === 0 && <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">Empty</span>}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{CATEGORY_DESCRIPTIONS[c.name]}</p>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[["Total", c.total], ["Live", c.published], ["Draft", c.drafts]].map(([k, val]) => (
                  <div key={k as string} className="rounded-lg bg-muted/60 py-2">
                    <dd className="text-lg font-semibold">{val}</dd>
                    <dt className="text-[11px] text-muted-foreground">{k}</dt>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex flex-wrap gap-2 pt-1">
                <Link href={`/admin/products?category=${encodeURIComponent(c.name)}`} className={btn.secondary}>Manage</Link>
                <Link href={`/admin/products/new?category=${encodeURIComponent(c.name)}`} className={btn.secondary}><Plus className="h-4 w-4" /> Add</Link>
                <Link href={`/collections/${slug}`} target="_blank" aria-label={`View ${c.name} on the store`} className={btn.secondary}><ExternalLink className="h-4 w-4" /></Link>
              </div>
            </Panel>
          );
        })}
      </div>

      {unknown.length > 0 && (
        <Panel title="Products in an unrecognised category" className="mt-6">
          <p className="mb-3 text-sm text-muted-foreground">These don&apos;t appear on any collection page. Open each one and pick a category.</p>
          <ul className="space-y-1 text-sm">
            {unknown.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}/edit`} className="underline-offset-2 hover:underline">{p.name}</Link>
                <span className="text-muted-foreground"> — “{p.category}”</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
