import Link from "next/link";
import { AlertTriangle, ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import { Suspense } from "react";
import { EmptyState, PageHeader, btn } from "@/components/admin/ui";
import ProductsToolbar from "@/components/admin/ProductsToolbar";
import ProductsList from "@/components/admin/ProductsList";
import { PAGE_SIZE, listProducts } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const filters = { q: one(sp.q), status: one(sp.status), category: one(sp.category), sort: one(sp.sort), page: parseInt(one(sp.page) || "1", 10) || 1 };
  const { products, total, page, error } = await listProducts(filters);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = !!(filters.q || filters.status || filters.category);

  const pageHref = (p: number) => {
    const n = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: filters.q, status: filters.status, category: filters.category, sort: filters.sort })) if (v) n.set(k, v);
    if (p > 1) n.set("page", String(p));
    const qs = n.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${total} ${total === 1 ? "product" : "products"}${filtered ? " match your filters" : " in the catalogue"}`}
        actions={
          <>
            <a href="/admin/export?format=csv" className={btn.secondary}><Download className="h-4 w-4" /> Export</a>
            <Link href="/admin/products/new" className={btn.primary}><Plus className="h-4 w-4" /> Add product</Link>
          </>
        }
      />

      <div className="mb-4">
        <Suspense fallback={null}>
          <ProductsToolbar />
        </Suspense>
      </div>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Couldn&apos;t load products</p>
            <p className="mt-0.5 text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState
            title={filtered ? "No products match those filters" : "No products yet"}
            body={filtered ? "Try a different search or clear the filters." : "Add your first product to start building the catalogue."}
            href={filtered ? "/admin/products" : "/admin/products/new"}
            cta={filtered ? "Clear filters" : "Add product"}
          />
        </div>
      ) : (
        <>
          <ProductsList products={products} />
          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Page {page} of {pages}</span>
              <div className="flex gap-2">
                {page > 1 ? <Link href={pageHref(page - 1)} className={btn.secondary}><ChevronLeft className="h-4 w-4" /> Previous</Link> : <span />}
                {page < pages && <Link href={pageHref(page + 1)} className={btn.secondary}>Next <ChevronRight className="h-4 w-4" /></Link>}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
