import Link from "next/link";
import { Package, PlusCircle, LayoutDashboard, Compass, Box } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-black/50 backdrop-blur-xl flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center">
              <Box className="w-4 h-4 text-white dark:text-zinc-900" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight">Comfort Cottons</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <p className="px-3 text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Dashboard</p>
            <nav className="space-y-1">
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors">
                <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                Overview
              </Link>
            </nav>
          </div>

          <div>
            <p className="px-3 text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Inventory</p>
            <nav className="space-y-1">
              <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors">
                <Package className="w-4 h-4 text-zinc-400" />
                All Products
              </Link>
              <Link href="/admin/products/new" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors">
                <PlusCircle className="w-4 h-4 text-zinc-400" />
                New Bedsheet
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="p-4 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-black/50">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors">
            <Compass className="w-4 h-4" />
            View Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px] overflow-y-auto">
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-8 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-500">Workspace</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-sm font-medium">Production</span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-md" } }} />
          </div>
        </header>
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
