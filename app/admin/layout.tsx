import Link from "next/link";
import { Toaster } from "sonner";
import { UserButton } from "@clerk/nextjs";
import { Package, Home, Settings, ShoppingCart, Search, Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/admin" className="font-semibold text-lg tracking-tight">Comfort Admin</Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-md font-medium text-sm transition-colors">
            <Package className="w-4 h-4" />
            Products
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-md font-medium text-sm transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Orders <span className="ml-auto text-[10px] uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Soon</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-md font-medium text-sm transition-colors">
            <Settings className="w-4 h-4" />
            Settings <span className="ml-auto text-[10px] uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Soon</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium">
            <Home className="w-4 h-4" />
            Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-zinc-500">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-9 pr-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 border-transparent rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 w-64 transition-all focus:w-80"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
