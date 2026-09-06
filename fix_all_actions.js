const fs = require('fs');
let actions = fs.readFileSync('app/admin/products/actions.ts', 'utf8');

// Update createProductDb
actions = actions.replace(/export async function createProductDb[\s\S]*?revalidatePath\('\/admin\/products'\);\n}/, `export async function createProductDb(productData: any) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('products').insert([productData]);
    if (error) return { success: false, error: error.message };
    revalidatePath('/');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed" };
  }
}`);

// Update updateProductDb
actions = actions.replace(/export async function updateProductDb[\s\S]*?revalidatePath\('\/admin\/products'\);\n}/, `export async function updateProductDb(id: string, updates: Record<string, string | number>) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('products').update(updates).eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed" };
  }
}`);

fs.writeFileSync('app/admin/products/actions.ts', actions);

// Fix new/page.tsx
let newPage = fs.readFileSync('app/admin/products/new/page.tsx', 'utf8');
newPage = newPage.replace(/await createProductDb\(\{[\s\S]*?\}\);/, `const res = await createProductDb({
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
      if (res && !res.success) throw new Error(res.error);`);
fs.writeFileSync('app/admin/products/new/page.tsx', newPage);

// Fix EditProductForm.tsx
let editPage = fs.readFileSync('app/admin/products/[id]/edit/EditProductForm.tsx', 'utf8');
editPage = editPage.replace(/await updateProductDb\(product\.id, updates\);/, `const res = await updateProductDb(product.id, updates);
      if (res && !res.success) throw new Error(res.error);`);
fs.writeFileSync('app/admin/products/[id]/edit/EditProductForm.tsx', editPage);

console.log('done');
