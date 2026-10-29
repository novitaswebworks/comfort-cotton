"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { field } from "@/components/admin/ui";

const SORTS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["price-desc", "Price: high to low"],
  ["price-asc", "Price: low to high"],
  ["name", "Name A–Z"],
] as const;

export default function ProductsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page"); // any filter change starts from page 1
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // Debounced search
  useEffect(() => {
    if (q === (params.get("q") ?? "")) return;
    timer.current = setTimeout(() => update({ q: q.trim() }), 350);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = ["q", "status", "category", "sort"].some((k) => params.get(k));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
      <div className="relative sm:col-span-2 lg:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="Search name, tag or material"
          aria-label="Search products"
          className={`${field} pl-9`}
        />
      </div>
      <select aria-label="Status" value={params.get("status") ?? ""} onChange={(e) => update({ status: e.target.value })} className={`${field} lg:w-40`}>
        <option value="">All statuses</option>
        <option value="Published">Published</option>
        <option value="Draft">Draft</option>
      </select>
      <select aria-label="Category" value={params.get("category") ?? ""} onChange={(e) => update({ category: e.target.value })} className={`${field} lg:w-56`}>
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select aria-label="Sort" value={params.get("sort") ?? "newest"} onChange={(e) => update({ sort: e.target.value === "newest" ? "" : e.target.value })} className={`${field} lg:w-44`}>
        {SORTS.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      {active && (
        <button
          onClick={() => {
            setQ("");
            router.replace(pathname, { scroll: false });
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" /> Clear
        </button>
      )}
    </div>
  );
}
