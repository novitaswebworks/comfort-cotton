"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from '@/lib/constants';
import { getCloudinarySignature, createProductDb } from '../actions';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function uploadFile(file: File) {
    if (!file || file.size === 0) return "";
    
    // 1. Get Signature from Server
    const { timestamp, signature } = await getCloudinarySignature();
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    // 2. Upload directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey || "");
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", "comfort-cottons");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await res.json();
    return data.secure_url;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      const mainImageFile = formData.get('main_image') as File;
      const zoomImageFile = formData.get('zoom_image') as File;
      const pillowImageFile = formData.get('pillow_image') as File;

      // Upload files directly from the browser to bypass Vercel limits
      const image_url = await uploadFile(mainImageFile);
      const zoom_image_url = await uploadFile(zoomImageFile);
      const pillow_image_url = await uploadFile(pillowImageFile);

      // Send the resulting URLs to the database
      const res = await createProductDb({
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        price: parseFloat(formData.get('price') as string),
        material: formData.get('material') as string,
        tag: formData.get('tag') as string,
        category: formData.get('category') as string,
        status: formData.get('status') as string,
        image_url,
        zoom_image_url,
        pillow_image_url
      });
      if (res && !res.success) throw new Error(res.error);

      router.push('/admin/products');
    } catch (error) {
      console.error(error);
      alert("Failed to upload product. Check console for details.");
    } finally {
      setIsSubmitting(false);
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

      <form onSubmit={handleSubmit}>
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
              <div className="space-y-2">
                <Label htmlFor="status">Publish Status</Label>
                <select 
                  id="status" 
                  name="status" 
                  required
                  defaultValue="Published"
                  className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="Draft">Draft (Hidden)</option>
                  <option value="Published">Published (Live)</option>
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
                disabled={isSubmitting}
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center justify-center min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading directly...
                  </>
                ) : (
                  "Upload & Save Product"
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
