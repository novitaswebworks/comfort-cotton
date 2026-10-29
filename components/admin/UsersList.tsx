"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban, ShieldCheck, ShieldOff, Trash2, Undo2 } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Panel, btn } from "@/components/admin/ui";
import { removeUser, setAdminRole, setBanned } from "@/app/admin/users/actions";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isAdmin: boolean;
  banned: boolean;
  createdAt: number;
  lastSignInAt: number | null;
}

type Pending = { kind: "admin" | "ban" | "delete"; user: UserRow } | null;

const date = (ms: number | null) => (ms ? new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Never");

export default function UsersList({ rows, currentUserId }: { rows: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending>(null);
  const [busy, startTransition] = useTransition();

  const confirm = () => {
    if (!pending) return;
    const { kind, user } = pending;
    startTransition(async () => {
      const res =
        kind === "admin" ? await setAdminRole(user.id, !user.isAdmin)
        : kind === "ban" ? await setBanned(user.id, !user.banned)
        : await removeUser(user.id);
      if (res.success) {
        toast.success(kind === "delete" ? "User deleted" : "User updated");
        router.refresh();
      } else {
        toast.error(res.error);
      }
      setPending(null);
    });
  };

  const copy = pending
    ? {
        admin: pending.user.isAdmin
          ? { title: "Remove admin access?", body: `${pending.user.email} will no longer be able to open the admin. This applies within about a minute.`, label: "Remove admin" }
          : { title: "Make this user an admin?", body: `${pending.user.email} will be able to edit products, users and all store data.`, label: "Make admin" },
        ban: pending.user.banned
          ? { title: "Unban this user?", body: `${pending.user.email} will be able to sign in again.`, label: "Unban" }
          : { title: "Ban this user?", body: `${pending.user.email} will be signed out and blocked from signing in.`, label: "Ban" },
        delete: { title: "Delete this user?", body: `${pending.user.email} will be permanently removed. This can't be undone.`, label: "Delete user" },
      }[pending.kind]
    : null;

  return (
    <>
      <Panel className="overflow-hidden !p-0">
        <ul className="divide-y divide-border">
          {rows.map((u) => {
            const me = u.id === currentUserId;
            return (
              <li key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-full bg-muted ring-1 ring-border" />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      <span className="truncate">{u.name}</span>
                      {me && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">You</span>}
                      {u.isAdmin && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold">Admin</span>}
                      {u.banned && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-semibold text-destructive">Banned</span>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">Joined {date(u.createdAt)} · Last sign-in {date(u.lastSignInAt)}</p>
                  </div>
                </div>
                {!me && (
                  <div className="flex flex-wrap gap-2">
                    <button className={btn.secondary} onClick={() => setPending({ kind: "admin", user: u })}>
                      {u.isAdmin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      {u.isAdmin ? "Remove admin" : "Make admin"}
                    </button>
                    <button className={btn.secondary} onClick={() => setPending({ kind: "ban", user: u })}>
                      {u.banned ? <Undo2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      {u.banned ? "Unban" : "Ban"}
                    </button>
                    <button className={btn.danger} onClick={() => setPending({ kind: "delete", user: u })} aria-label={`Delete ${u.email}`}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
      <ConfirmDialog
        open={!!pending}
        title={copy?.title ?? ""}
        body={copy?.body ?? ""}
        confirmLabel={copy?.label ?? ""}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => !busy && setPending(null)}
      />
    </>
  );
}
