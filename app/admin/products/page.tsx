import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Plus, Edit, MoreHorizontal, PackageOpen } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteProductButton from './DeleteProductButton';

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-zinc-500 mt-1">Manage your bedsheet collection and inventory across the storefront.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {error ? (
          <div className="p-8 text-center bg-red-50 dark:bg-red-950/20">
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Database Connection Error</p>
            <p className="text-red-500/80 text-sm">{error.message}</p>
          </div>
        ) : products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/50">
                <TableRow>
                  <TableHead className="w-[80px] pl-6 py-4">Image</TableHead>
                  <TableHead className="py-4 font-semibold">Product Name</TableHead>
                  <TableHead className="py-4 font-semibold">Status</TableHead>
                  <TableHead className="py-4 font-semibold hidden md:table-cell">Category</TableHead>
                  <TableHead className="py-4 font-semibold hidden lg:table-cell">Material</TableHead>
                  <TableHead className="py-4 font-semibold text-right">Price</TableHead>
                  <TableHead className="w-[100px] py-4 text-center pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="pl-6 py-3">
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-700">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                      {product.name}
                      <div className="text-xs text-zinc-400 font-normal mt-0.5 md:hidden">{product.category}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        product.status === 'Draft' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 border border-amber-200/50 dark:border-amber-800/50' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500 border border-emerald-200/50 dark:border-emerald-800/50'
                      }`}>
                        {product.status || 'Published'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {product.category || 'Uncategorized'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-zinc-500">
                      {product.material}
                    </TableCell>
                    <TableCell className="text-right font-medium text-zinc-900 dark:text-zinc-100">
                      ₹{product.price}
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton id={product.id} />
                      </div>
                      <div className="flex items-center justify-end group-hover:hidden pr-2">
                        <MoreHorizontal className="w-4 h-4 text-zinc-300" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-zinc-500 max-w-sm mb-6 text-sm">
              Your storefront is currently empty. Add your first premium bedsheet to start building your collection.
            </p>
            <Link 
              href="/admin/products/new" 
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-sm"
            >
              Add New Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
