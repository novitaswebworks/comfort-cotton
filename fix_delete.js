const fs = require('fs');

// 1. Update actions.ts
let actions = fs.readFileSync('app/admin/products/actions.ts', 'utf8');

const newDelete = `
export async function deleteProduct(id: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete product:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Exception deleting product:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
`;

actions = actions.replace(/export async function deleteProduct[\s\S]*?revalidatePath\("\/"\);\n}/, newDelete.trim());
fs.writeFileSync('app/admin/products/actions.ts', actions);

// 2. Update DeleteProductButton.tsx
let btn = fs.readFileSync('app/admin/products/DeleteProductButton.tsx', 'utf8');

const newHandle = `
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      startTransition(async () => {
        const result = await deleteProduct(id);
        if (result && !result.success) {
          alert("Error: " + result.error);
        }
      });
    }
  };
`;

btn = btn.replace(/const handleDelete = \(\) => \{[\s\S]*?\};\n  \};/, newHandle.trim());
fs.writeFileSync('app/admin/products/DeleteProductButton.tsx', btn);

console.log('done');
