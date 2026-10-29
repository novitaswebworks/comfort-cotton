import { auth } from "@clerk/nextjs/server";
import { getAllProducts } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

const COLUMNS = ["tag", "name", "category", "status", "type", "price", "material", "description", "image_url", "zoom_image_url", "pillow_image_url", "created_at"] as const;

// Guard against spreadsheet formula injection, then quote per RFC 4180.
const cell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") return new Response("Unauthorized", { status: 401 });

  const { products, error } = await getAllProducts();
  if (error) return new Response(`Export failed: ${error}`, { status: 503 });

  const stamp = new Date().toISOString().slice(0, 10);
  const format = new URL(req.url).searchParams.get("format") === "json" ? "json" : "csv";

  if (format === "json") {
    return new Response(JSON.stringify(products, null, 2), {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="comfort-cottons-${stamp}.json"`, "Cache-Control": "no-store" },
    });
  }
  const csv = [COLUMNS.join(","), ...products.map((p) => COLUMNS.map((c) => cell(p[c])).join(","))].join("\r\n");
  return new Response("﻿" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="comfort-cottons-${stamp}.csv"`, "Cache-Control": "no-store" },
  });
}
