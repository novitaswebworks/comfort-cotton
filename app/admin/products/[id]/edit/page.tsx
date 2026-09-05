import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateProduct } from '../../actions';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!product) {
    notFound();
  }

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-zinc-500 text-sm">Update details for {product.name}.</p>
        </div>
      </div>

      <form action={updateProductWithId}>
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" defaultValue={product.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" name="type" defaultValue={product.type} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">WhatsApp Tag</Label>
                <Input id="tag" name="tag" defaultValue={product.tag} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material & Quality</Label>
              <Input id="material" name="material" defaultValue={product.material} required />
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium">Update Images (Optional)</h3>
              <p className="text-xs text-zinc-500 mb-4">Leave empty to keep current images.</p>
              <div className="space-y-2">
                <Label htmlFor="main_image">New Main Image</Label>
                <Input id="main_image" name="main_image" type="file" accept="image/*" />
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="zoom_image">New Zoom/Texture Image</Label>
                <Input id="zoom_image" name="zoom_image" type="file" accept="image/*" />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                type="submit"
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
