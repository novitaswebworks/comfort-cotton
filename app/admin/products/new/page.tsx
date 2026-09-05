import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES } from '@/lib/constants';

export default async function NewProductPage() {
  async function createProduct(formData: FormData) {
    "use server";
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) throw new Error("Missing Service Role Key");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const price = parseFloat(formData.get('price') as string);
    const material = formData.get('material') as string;
    const tag = formData.get('tag') as string;
    const category = formData.get('category') as string;
    
    const mainImageFile = formData.get('main_image') as File;
    const zoomImageFile = formData.get('zoom_image') as File;
    const pillowImageFile = formData.get('pillow_image') as File;

    let image_url = "";
    let zoom_image_url = "";
    let pillow_image_url = "";

    // Upload Main Image
    if (mainImageFile && mainImageFile.size > 0) {
      const fileName = `main_${Date.now()}_${mainImageFile.name.replace(/\\s/g, '_')}`;
      const { data, error } = await supabaseAdmin.storage
        .from('products')
        .upload(fileName, mainImageFile);
      
      if (error) throw error;
      
      const { data: pubData } = supabaseAdmin.storage.from('products').getPublicUrl(data.path);
      image_url = pubData.publicUrl;
    }

    // Upload Zoom Image
    if (zoomImageFile && zoomImageFile.size > 0) {
      const fileName = `zoom_${Date.now()}_${zoomImageFile.name.replace(/\\s/g, '_')}`;
      const { data, error } = await supabaseAdmin.storage
        .from('products')
        .upload(fileName, zoomImageFile);
      
      if (error) throw error;
      
      const { data: pubData } = supabaseAdmin.storage.from('products').getPublicUrl(data.path);
      zoom_image_url = pubData.publicUrl;
    }

    // Upload Pillow Cover Image
    if (pillowImageFile && pillowImageFile.size > 0) {
      const fileName = `pillow_${Date.now()}_${pillowImageFile.name.replace(/\\s/g, '_')}`;
      const { data, error } = await supabaseAdmin.storage
        .from('products')
        .upload(fileName, pillowImageFile);
      
      if (error) throw error;
      
      const { data: pubData } = supabaseAdmin.storage.from('products').getPublicUrl(data.path);
      pillow_image_url = pubData.publicUrl;
    }

    const { error } = await supabaseAdmin.from('products').insert([
      { name, type, price, material, tag, image_url, zoom_image_url, category, pillow_image_url }
    ]);

    if (!error) {
      revalidatePath('/');
      revalidatePath('/admin/products');
      redirect('/admin/products');
    } else {
      console.error(error);
      throw new Error("Failed to insert product into database");
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Product</h2>
          <p className="text-zinc-500 text-sm">Create a new bedsheet listing for the storefront.</p>
        </div>
      </div>

      <form action={createProduct}>
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" placeholder="e.g. Midnight Blue" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category" 
                  name="category" 
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type / Size</Label>
                <Input id="type" name="type" placeholder="e.g. 90x100 inches" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="8900.00" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="material">Material & Quality</Label>
                <Input id="material" name="material" placeholder="e.g. 100% Egyptian Cotton • 400 TC" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">WhatsApp Tag</Label>
                <Input id="tag" name="tag" placeholder="e.g. DBL-MIDNIGHT" required />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium">Image Uploads</h3>
              <p className="text-xs text-zinc-500 mb-4">You must create a public bucket named &quot;products&quot; in your Supabase Storage for this to work.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="main_image">Main Image</Label>
                  <Input id="main_image" name="main_image" type="file" accept="image/*" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zoom_image">Zoom / Texture Image</Label>
                  <Input id="zoom_image" name="zoom_image" type="file" accept="image/*" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pillow_image">Pillow Cover Image</Label>
                  <Input id="pillow_image" name="pillow_image" type="file" accept="image/*" />
                  <p className="text-[10px] text-zinc-400">Optional — matching pillow covers</p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                type="submit"
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Upload & Save Product
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
