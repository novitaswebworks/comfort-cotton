"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Eye, EyeOff, MoreVertical, Pencil, Trash2, CopyPlus } from "lucide-react";
import type { Product } from "@/lib/products";
import { StatusBadge, btn } from "@/components/admin/ui";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { bulkDelete, bulkSetStatus, duplicateProduct } from "@/app/admin/products/actions";

const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function RowMenu({ product, onToggle, onDuplicate, onDelete }: { product: Product; onToggle: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const item = "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-muted";
  const published = product.status === "Published";
  const copyLink = async () => {
    const url = `${window.location.origin}/product/${product.tag}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label={`More actions for ${product.name}`} aria-expanded={open} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-border bg-card p-1 shadow-xl" onClick={() => setOpen(false)}>
          <button role="menuitem" className={item} onClick={onToggle}>
            {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {published ? "Unpublish (make draft)" : "Publish"}
          </button>
          {published && (
            <Link role="menuitem" href={`/product/${product.tag}`} target="_blank" className={item}>
              <ExternalLink className="h-4 w-4" /> View on store
            </Link>
          )}
          <button role="menuitem" className={item} onClick={copyLink}>
            <Copy className="h-4 w-4" /> Copy product link
          </button>
          <button role="menuitem" className={item} onClick={onDuplicate}>
            <CopyPlus className="h-4 w-4" /> Duplicate as draft
          </button>
          <button role="menuitem" className={`${item} text-destructive`} onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Delete…
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{ ids: string[]; label: string } | null>(null);

  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const run = (fn: () => Promise<{ success: boolean; error?: string; id?: string }>, ok: string, after?: (r: { id?: string }) => void) =>
    startTransition(async () => {
      const r = await fn();
      if (r.success) {
        toast.success(ok);
        setSelected(new Set());
        after?.(r);
        router.refresh();
      } else toast.error(r.error ?? "Something went wrong");
    });

  const setStatus = (ids: string[], status: "Published" | "Draft") =>
    run(() => bulkSetStatus(ids, status), status === "Published" ? "Published" : "Moved to drafts");
  const duplicate = (id: string) => run(() => duplicateProduct(id), "Duplicated as a draft", (r) => r.id && router.push(`/admin/products/${r.id}/edit`));

  const menu = (p: Product) => (
    <RowMenu
      product={p}
      onToggle={() => setStatus([p.id], p.status === "Published" ? "Draft" : "Published")}
      onDuplicate={() => duplicate(p.id)}
      onDelete={() => setConfirm({ ids: [p.id], label: p.name })}
    />
  );

  return (
    <>
      {selected.size > 0 && (
        <div className="sticky top-14 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-lg lg:top-4" role="region" aria-label="Bulk actions">
          <span className="mr-auto text-sm font-medium">{selected.size} selected</span>
          <button className={btn.secondary} disabled={pending} onClick={() => setStatus([...selected], "Published")}>Publish</button>
          <button className={btn.secondary} disabled={pending} onClick={() => setStatus([...selected], "Draft")}>Unpublish</button>
          <button className={btn.danger} disabled={pending} onClick={() => setConfirm({ ids: [...selected], label: `${selected.size} products` })}>Delete</button>
          <button className="px-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-10 py-3 pl-4"><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)))} className="h-4 w-4 accent-[var(--primary)]" /></th>
              <th className="py-3 pl-3 font-medium">Product</th>
              <th className="py-3 font-medium">Status</th>
              <th className="hidden py-3 font-medium lg:table-cell">Category</th>
              <th className="py-3 text-right font-medium">Price</th>
              <th className="w-24 py-3 pr-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className={selected.has(p.id) ? "bg-muted/60" : "hover:bg-muted/40"}>
                <td className="py-3 pl-4"><input type="checkbox" aria-label={`Select ${p.name}`} checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-[var(--primary)]" /></td>
                <td className="py-3 pl-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {p.image_url && <Image src={p.image_url} alt="" fill sizes="48px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.tag}</p>
                    </div>
                  </Link>
                </td>
                <td className="py-3"><StatusBadge status={p.status} /></td>
                <td className="hidden py-3 text-muted-foreground lg:table-cell">{p.category}</td>
                <td className="py-3 text-right font-medium">{inr(Number(p.price))}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.name}`} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></Link>
                    {menu(p)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {products.map((p) => (
          <li key={p.id} className={`rounded-xl border bg-card p-3 ${selected.has(p.id) ? "border-primary" : "border-border"}`}>
            <div className="flex gap-3">
              <input type="checkbox" aria-label={`Select ${p.name}`} checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]" />
              <Link href={`/admin/products/${p.id}/edit`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {p.image_url && <Image src={p.image_url} alt="" fill sizes="64px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${p.id}/edit`} className="block truncate font-medium">{p.name}</Link>
                <p className="truncate text-xs text-muted-foreground">{p.tag} · {p.category}</p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={p.status} />
                  <span className="text-sm font-medium">{inr(Number(p.price))}</span>
                </div>
              </div>
              {menu(p)}
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!confirm}
        title="Delete permanently?"
        body={confirm ? `${confirm.label} will be removed from the store and can't be recovered.` : ""}
        confirmLabel="Delete"
        busy={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const ids = confirm!.ids;
          setConfirm(null);
          run(() => bulkDelete(ids), ids.length > 1 ? "Products deleted" : "Product deleted");
        }}
      />
    </>
  );
}
