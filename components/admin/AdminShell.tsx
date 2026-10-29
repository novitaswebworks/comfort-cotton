"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { Contact, ExternalLink, History, Layers, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingBag, Users, X } from "lucide-react";
import DayNightToggle from "@/components/storefront/DayNightToggle";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Contact },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/audit", label: "Activity", icon: History },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountBlock() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" className="h-9 w-9 rounded-full ring-1 ring-border" />
        ) : (
          <div className="h-9 w-9 rounded-full bg-muted" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.fullName || user?.firstName || "Admin"}</p>
          {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
        </div>
      </div>
      <button
        onClick={() => signOut({ redirectUrl: "/" })}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex flex-col leading-none">
      <span className="text-base tracking-[0.1em] uppercase whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif" }}>
        Comfort Cottons
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Admin</span>
    </Link>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-dvh bg-background text-foreground lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:sticky lg:top-0 lg:h-dvh border-r border-border bg-card p-5">
        <div className="mb-8 px-1"><Brand /></div>
        <NavLinks />
        <div className="mt-4 px-1">
          <Link href="/" target="_blank" className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ExternalLink className="h-4 w-4" /> View storefront
          </Link>
        </div>
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
            <span>Theme</span>
            <DayNightToggle className="rounded-lg p-2 hover:bg-muted transition-colors" />
          </div>
          <AccountBlock />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="-ml-2 rounded-lg p-2 hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <Brand />
          <DayNightToggle className="-mr-2 rounded-lg p-2 hover:bg-muted transition-colors" />
        </header>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-card p-5 shadow-2xl">
              <div className="mb-8 flex items-start justify-between px-1">
                <Brand />
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="-mr-2 -mt-1 rounded-lg p-2 hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
              <Link href="/" target="_blank" className="mt-4 flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4" /> View storefront
              </Link>
              <div className="mt-auto pb-[env(safe-area-inset-bottom)]"><AccountBlock /></div>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
