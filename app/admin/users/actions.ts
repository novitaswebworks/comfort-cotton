"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";

type ActionResult = { success: true } | { success: false; error: string };

const USER_ID = /^user_[A-Za-z0-9]{10,64}$/;

// Server actions are public POST endpoints; the /admin proxy does not cover them.
async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (!userId || role !== "admin") throw new Error("Unauthorized");
  return userId;
}

async function countAdmins() {
  const client = await clerkClient();
  let admins = 0;
  for (let offset = 0; offset < 2000; offset += 100) {
    const { data } = await client.users.getUserList({ limit: 100, offset });
    admins += data.filter((u) => u.publicMetadata?.role === "admin" && !u.banned).length;
    if (data.length < 100) break;
  }
  return admins;
}

/** Shared guard: valid id, not yourself, and never removes the last active admin. */
async function guard(targetId: string, opts: { removesAdmin: boolean }) {
  const me = await requireAdmin();
  if (typeof targetId !== "string" || !USER_ID.test(targetId)) throw new Error("Invalid user");
  if (targetId === me) throw new Error("You can't do that to your own account");
  const client = await clerkClient();
  const target = await client.users.getUser(targetId);
  if (opts.removesAdmin && target.publicMetadata?.role === "admin" && !target.banned && (await countAdmins()) <= 1) {
    throw new Error("That would remove the last admin");
  }
  return { client, target };
}

const email = (u: { primaryEmailAddress: { emailAddress: string } | null; id: string }) => u.primaryEmailAddress?.emailAddress ?? u.id;

async function run(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}

/** Takes effect once the user's session token refreshes (about a minute). */
export async function setAdminRole(userId: string, makeAdmin: boolean): Promise<ActionResult> {
  return run(async () => {
    const { client, target } = await guard(userId, { removesAdmin: !makeAdmin });
    await client.users.updateUserMetadata(userId, { publicMetadata: { role: makeAdmin ? "admin" : null } });
    await logAudit({ action: makeAdmin ? "grant-admin" : "revoke-admin", entity: "user", entityId: userId, summary: `${makeAdmin ? "Made" : "Removed"} ${email(target)} ${makeAdmin ? "an admin" : "as admin"}` });
  });
}

export async function setBanned(userId: string, banned: boolean): Promise<ActionResult> {
  return run(async () => {
    const { client, target } = await guard(userId, { removesAdmin: banned });
    if (banned) await client.users.banUser(userId);
    else await client.users.unbanUser(userId);
    await logAudit({ action: banned ? "ban" : "unban", entity: "user", entityId: userId, summary: `${banned ? "Banned" : "Unbanned"} ${email(target)}` });
  });
}

export async function removeUser(userId: string): Promise<ActionResult> {
  return run(async () => {
    const { client, target } = await guard(userId, { removesAdmin: true });
    await client.users.deleteUser(userId);
    await logAudit({ action: "delete", entity: "user", entityId: userId, summary: `Deleted user ${email(target)}` });
  });
}
