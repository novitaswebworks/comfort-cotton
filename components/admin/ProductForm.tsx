"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Loader2, Sparkles, Trash2, Upload, X } from "lucide-react";
import type { Product } from "@/lib/products";
import { CATEGORIES } from "@/lib/constants";
import { btn, field } from "@/components/admin/ui";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { createProductDb, deleteProduct, getCloudinarySignature, updateProductDb } from "@/app/admin/products/actions";

type ImageKey = "image_url" | "zoom_image_url" | "pillow_image_url";

const PREFIX: Record<string, string> = {
  "Double bed king size": "DBL",
  "Double bed queen size": "DBL",
  "Single Bed without pillow cover": "SGL",
  "Single Bed with Pillow cover": "SGL",
  "Deewan Sets": "DWN",
  "Dohads (Quilt)": "DHD",
};

function suggestTag(name: string, category: string) {
  const slug = name.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return [PREFIX[category] ?? "CC", slug].filter(Boolean).join("-").slice(0, 40);
}

async function uploadToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must be under 10 MB");
  const { timestamp, signature, cloudName, apiKey } = await getCloudinarySignature();
  if (!cloudName || !apiKey) throw new Error("Cloudinary is not configured (check environment variables)");

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  body.append("folder", "comfort-cottons");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
  if (!res.ok) throw new Error("Image upload failed. Please try again.");
  return (await res.json()).secure_url as string;
}

function useObjectUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}

function ImageField({ label, hint, required, existing, file, onFile, onRemove }: { label: string; hint: string; required?: boolean; existing: string; file: File | null; onFile: (f: File | null) => void; onRemove?: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const preview = useObjectUrl(file) || existing;

  const pick = (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (f.size > 10 * 1024 * 1024) return toast.error("Images must be under 10 MB");
    onFile(f);
  };

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}{required && <span className="text-destructive"> *</span>}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/40 transition-colors ${drag ? "border-primary bg-muted" : "border-input"}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`${label} preview`} className="h-full w-full object-cover" />
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <ImagePlus className="h-6 w-6" />
            <span>Tap to choose or drop an image</span>
          </button>
        )}
        {preview && (
          <div className="absolute inset-x-2 bottom-2 flex gap-2">
            <button type="button" onClick={() => input.current?.click()} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-black/65 py-2 text-xs font-medium text-white backdrop-blur hover:bg-black/80">
              <Upload className="h-3.5 w-3.5" /> Replace
            </button>
            {(onRemove || file) && (
              <button type="button" onClick={() => (file ? onFile(null) : onRemove?.())} aria-label={`Remove ${label}`} className="rounded-lg bg-black/65 px-3 text-white backdrop-blur hover:bg-black/80">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <input ref={input} type="file" accept="image/*" className="sr-only" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export default function ProductForm({ product, defaultCategory }: { product?: Product; defaultCategory?: string }) {
  const router = useRouter();
  const editing = !!product;
  const [v, setV] = useState({
    name: product?.name ?? "",
    category: product?.category ?? ((CATEGORIES as readonly string[]).includes(defaultCategory ?? "") ? (defaultCategory as string) : CATEGORIES[0]),
    status: product?.status ?? "Published",
    type: product?.type ?? "",
    price: product ? String(product.price) : "",
    material: product?.material ?? "",
    tag: product?.tag ?? "",
    description: product?.description ?? "",
  });
  const [files, setFiles] = useState<Record<ImageKey, File | null>>({ image_url: null, zoom_image_url: null, pillow_image_url: null });
  const [removed, setRemoved] = useState<Record<ImageKey, boolean>>({ image_url: false, zoom_image_url: false, pillow_image_url: false });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mainPreview = useObjectUrl(files.image_url) || (removed.image_url ? "" : product?.image_url ?? "");

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => { setV((s) => ({ ...s, [k]: val })); setDirty(true); };
  const setFile = (k: ImageKey, f: File | null) => { setFiles((s) => ({ ...s, [k]: f })); setRemoved((s) => ({ ...s, [k]: false })); setDirty(true); };
  const imageValue = (k: ImageKey) => (removed[k] ? "" : product?.[k] ?? "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing && !files.image_url) return toast.error("Please add a main image");
    setSaving(true);
    try {
      const keys: ImageKey[] = ["image_url", "zoom_image_url", "pillow_image_url"];
      const uploaded = await Promise.all(keys.map((k) => (files[k] ? uploadToCloudinary(files[k]!) : Promise.resolve(null))));
      const images: Partial<Record<ImageKey, string>> = {};
      keys.forEach((k, i) => {
        if (uploaded[i]) images[k] = uploaded[i]!;
        else if (editing && removed[k] && k !== "image_url") images[k] = "";
      });

      const payload = { ...v, price: parseFloat(v.price), ...(editing ? images : { image_url: "", zoom_image_url: "", pillow_image_url: "", ...images }) };
      const res = editing ? await updateProductDb(product.id, payload) : await createProductDb(payload);
      if (!res.success) throw new Error(res.error);
      setDirty(false);
      toast.success(editing ? "Changes saved" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the product");
    } finally {
      setSaving(false);
    }
  }

  const label = "mb-1.5 block text-sm font-medium";

  return (
    <form onSubmit={onSubmit} className="pb-24 lg:pb-0">
      <div className="mb-6 flex items-start gap-3">
        <Link href="/admin/products" aria-label="Back to products" className="mt-0.5 rounded-lg p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{editing ? "Edit product" : "New product"}</h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">{editing ? product.name : "Fill in the details and add photos. Nothing goes live until it's published."}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="text-sm font-semibold">Details</h2>
            <div>
              <label htmlFor="name" className={label}>Product name <span className="text-destructive">*</span></label>
              <input id="name" required maxLength={200} value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Midnight Blue" className={field} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className={label}>Category</label>
                <select id="category" value={v.category} onChange={(e) => set("category", e.target.value)} className={field}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <span className={label}>Visibility</span>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-muted/50 p-1" role="radiogroup" aria-label="Visibility">
                  {(["Published", "Draft"] as const).map((s) => (
                    <button key={s} type="button" role="radio" aria-checked={v.status === s} onClick={() => set("status", s)}
                      className={`rounded-md py-2 text-sm font-medium transition-colors ${v.status === s ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                      {s === "Published" ? "Published" : "Draft"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="type" className={label}>Size / type <span className="text-destructive">*</span></label>
                <input id="type" required value={v.type} onChange={(e) => set("type", e.target.value)} placeholder="e.g. Double • 90×100 inches" className={field} />
              </div>
              <div>
                <label htmlFor="price" className={label}>Price (₹) <span className="text-destructive">*</span></label>
                <input id="price" required type="number" inputMode="decimal" min="0" step="0.01" value={v.price} onChange={(e) => set("price", e.target.value)} placeholder="2499" className={field} />
              </div>
            </div>
            <div>
              <label htmlFor="material" className={label}>Material &amp; quality <span className="text-destructive">*</span></label>
              <input id="material" required value={v.material} onChange={(e) => set("material", e.target.value)} placeholder="e.g. 100% Egyptian Cotton • 400 TC" className={field} />
            </div>
            <div>
              <label htmlFor="tag" className={label}>Product tag <span className="text-destructive">*</span></label>
              <div className="flex gap-2">
                <input id="tag" required value={v.tag} onChange={(e) => set("tag", e.target.value.toUpperCase())} placeholder="DBL-MIDNIGHT" className={field} />
                <button type="button" onClick={() => set("tag", suggestTag(v.name, v.category))} disabled={!v.name} className={`${btn.secondary} shrink-0`}>
                  <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline">Suggest</span>
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Unique reference used in the product link and WhatsApp orders. Letters, numbers, - and _.</p>
            </div>
            <div>
              <label htmlFor="description" className={label}>Description</label>
              <textarea id="description" rows={4} maxLength={2000} value={v.description} onChange={(e) => set("description", e.target.value)} placeholder="A few sentences about the weave, feel and care." className={field} />
              <p className="mt-1 text-right text-xs text-muted-foreground">{v.description.length}/2000</p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold">Photos</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <ImageField label="Main image" required hint="Shown on cards and the product page." existing={imageValue("image_url")} file={files.image_url} onFile={(f) => setFile("image_url", f)} />
              <ImageField label="Texture close-up" hint="Fabric detail, shown on hover." existing={imageValue("zoom_image_url")} file={files.zoom_image_url} onFile={(f) => setFile("zoom_image_url", f)} onRemove={editing && product?.zoom_image_url ? () => { setRemoved((s) => ({ ...s, zoom_image_url: true })); setDirty(true); } : undefined} />
              <ImageField label="Pillow cover" hint="Optional matching pillow cover." existing={imageValue("pillow_image_url")} file={files.pillow_image_url} onFile={(f) => setFile("pillow_image_url", f)} onRemove={editing && product?.pillow_image_url ? () => { setRemoved((s) => ({ ...s, pillow_image_url: true })); setDirty(true); } : undefined} />
            </div>
          </section>

          {editing && (
            <section className="rounded-xl border border-destructive/30 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
              <p className="mt-1 text-sm text-muted-foreground">Deleting removes this product from the store for good. To hide it temporarily, set it to Draft instead.</p>
              <button type="button" onClick={() => setConfirmDelete(true)} className={`${btn.danger} mt-4`}><Trash2 className="h-4 w-4" /> Delete product</button>
            </section>
          )}
        </div>

        {/* Live preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Store preview</p>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[4/5] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {mainPreview ? <img src={mainPreview} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Main image</div>}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-light" style={{ fontFamily: "'Playfair Display', serif" }}>{v.name || "Product name"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.price ? `₹${v.price}` : "₹0"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{v.material || "Material & quality"}</p>
              </div>
            </div>
            {v.status === "Draft" && <p className="mt-3 rounded-lg bg-warning/15 px-3 py-2 text-xs text-warning">Draft: hidden from customers until published.</p>}
          </div>
        </aside>
      </div>

      {/* Action bar: sticky on mobile, inline on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:mt-6 lg:justify-end lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <Link href="/admin/products" className={`${btn.secondary} flex-1 lg:flex-none`}>Cancel</Link>
        <button type="submit" disabled={saving} className={`${btn.primary} flex-[2] lg:min-w-44 lg:flex-none`}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : editing ? "Save changes" : "Create product"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this product?"
        body={`${product?.name ?? "This product"} will be removed from the store and can't be recovered.`}
        confirmLabel="Delete"
        busy={saving}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setSaving(true);
          const res = await deleteProduct(product!.id);
          setSaving(false);
          setConfirmDelete(false);
          if (res.success) { setDirty(false); toast.success("Product deleted"); router.push("/admin/products"); router.refresh(); }
          else toast.error(res.error);
        }}
      />
    </form>
  );
}
