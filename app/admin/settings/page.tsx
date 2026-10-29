import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CheckCircle2, Download, XCircle } from "lucide-react";
import { PageHeader, Panel, btn } from "@/components/admin/ui";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SITE_URL } from "@/lib/site";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

async function checkDatabase() {
  const started = Date.now();
  try {
    const { error, count } = await getSupabaseAdmin().from("products").select("*", { count: "exact", head: true });
    if (error) return { ok: false, detail: error.message };
    return { ok: true, detail: `${count ?? 0} products · ${Date.now() - started} ms` };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : "Unreachable" };
  }
}

function Row({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <li className="flex items-start gap-3 py-3">
      {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {detail && <p className="break-words text-xs text-muted-foreground">{detail}</p>}
      </div>
    </li>
  );
}

export default async function SettingsPage() {
  const [db, user, { sessionClaims }] = await Promise.all([checkDatabase(), currentUser(), auth()]);
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  const cloudinary = !!(process.env.CLOUDINARY_API_SECRET && (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME) && (process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY));
  const dbHost = (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host; } catch { return "not set"; } })();

  return (
    <div>
      <PageHeader title="Settings" description="System health, store configuration and data tools." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="System status">
          <ul className="divide-y divide-border">
            <Row label="Database" ok={db.ok} detail={`${dbHost} — ${db.detail}`} />
            <Row label="Image uploads (Cloudinary)" ok={cloudinary} detail={cloudinary ? "Configured" : "Missing CLOUDINARY_* environment variables"} />
            <Row label="Admin access" ok={role === "admin"} detail={user?.primaryEmailAddress?.emailAddress ?? "Signed in"} />
          </ul>
        </Panel>

        <Panel title="Store configuration">
          <dl className="divide-y divide-border text-sm">
            {[
              ["Site URL", SITE_URL],
              ["WhatsApp orders", `+${WHATSAPP_NUMBER}`],
              ["Environment", process.env.NODE_ENV],
            ].map(([k, val]) => (
              <div key={k} className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="break-all text-right font-medium">{val}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            These come from environment variables and code constants. Change <code>NEXT_PUBLIC_SITE_URL</code> in your hosting settings, and the WhatsApp number in <code>lib/whatsapp.ts</code>.
          </p>
        </Panel>

        <Panel title="Data tools" className="lg:col-span-2">
          <p className="mb-4 text-sm text-muted-foreground">Download your catalogue for spreadsheets or as a backup you can keep.</p>
          <div className="flex flex-wrap gap-2">
            <a href="/admin/export?format=csv" className={btn.secondary}><Download className="h-4 w-4" /> Export CSV</a>
            <a href="/admin/export?format=json" className={btn.secondary}><Download className="h-4 w-4" /> Backup (JSON)</a>
            <Link href="/sitemap.xml" target="_blank" className={btn.secondary}>View sitemap</Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
