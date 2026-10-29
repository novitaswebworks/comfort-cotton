import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { AlertTriangle } from "lucide-react";
import { EmptyState, PageHeader, Panel, btn, field } from "@/components/admin/ui";
import UsersList, { type UserRow } from "@/components/admin/UsersList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users" };

const PAGE_SIZE = 20;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const { userId } = await auth();

  let rows: UserRow[] = [];
  let total = 0;
  let error: string | null = null;
  try {
    const client = await clerkClient();
    const res = await client.users.getUserList({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, query: q || undefined, orderBy: "-created_at" });
    total = res.totalCount;
    rows = res.data.map((u) => ({
      id: u.id,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "—",
      email: u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? "—",
      imageUrl: u.imageUrl,
      isAdmin: u.publicMetadata?.role === "admin",
      banned: u.banned,
      createdAt: u.createdAt,
      lastSignInAt: u.lastSignInAt,
    }));
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not reach Clerk";
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <div>
      <PageHeader title="Users" description="Manage who can sign in and who can administer the store." />

      <form className="mb-4 flex gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Search name or email" aria-label="Search users" className={`${field} max-w-sm`} />
        <button className={btn.secondary}>Search</button>
        {q && <Link href="/admin/users" className={btn.secondary}>Clear</Link>}
      </form>

      {error ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p>Couldn&apos;t load users: {error}</p>
        </div>
      ) : rows.length === 0 ? (
        <Panel><EmptyState title="No users found" body={q ? "Try a different search." : "Nobody has signed up yet."} /></Panel>
      ) : (
        <>
          <UsersList rows={rows} currentUserId={userId ?? ""} />
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{total} user{total === 1 ? "" : "s"} · page {page} of {pages}</span>
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
