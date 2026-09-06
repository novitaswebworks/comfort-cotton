const fs = require('fs');

// 1. DeleteProductButton
let del = fs.readFileSync('app/admin/products/DeleteProductButton.tsx', 'utf8');
del = del.replace('import { deleteProduct } from "./actions";', 'import { deleteProduct } from "./actions";\nimport { toast } from "sonner";');
del = del.replace('alert("Error: " + result.error);', 'toast.error("Error: " + result.error);');
del = del.replace('if (result && !result.success) {', 'if (result && !result.success) {');
del = del.replace('const result = await deleteProduct(id);', 'const result = await deleteProduct(id);\n        if (result && result.success) toast.success("Product deleted successfully!");');
fs.writeFileSync('app/admin/products/DeleteProductButton.tsx', del);

// 2. new/page.tsx
let newPage = fs.readFileSync('app/admin/products/new/page.tsx', 'utf8');
newPage = newPage.replace('import { ArrowLeft, Loader2 } from \'lucide-react\';', 'import { ArrowLeft, Loader2 } from \'lucide-react\';\nimport { toast } from "sonner";');
newPage = newPage.replace('alert("Failed to create product. Check console for details.");', 'toast.error("Failed to create product. Check console for details.");');
newPage = newPage.replace(/if \(res && !res\.success\) throw new Error\(res\.error\);\s*router\.push\('\/admin\/products'\);/, `if (res && !res.success) throw new Error(res.error);
      toast.success("Product created successfully!");
      router.push('/admin/products');`);
fs.writeFileSync('app/admin/products/new/page.tsx', newPage);

// 3. EditProductForm.tsx
let editPage = fs.readFileSync('app/admin/products/[id]/edit/EditProductForm.tsx', 'utf8');
editPage = editPage.replace('import { ArrowLeft, Loader2 } from \'lucide-react\';', 'import { ArrowLeft, Loader2 } from \'lucide-react\';\nimport { toast } from "sonner";');
editPage = editPage.replace('alert("Failed to update product. Check console for details.");', 'toast.error("Failed to update product. Check console for details.");');
editPage = editPage.replace(/if \(res && !res\.success\) throw new Error\(res\.error\);\s*router\.push\('\/admin\/products'\);/, `if (res && !res.success) throw new Error(res.error);
      toast.success("Product updated successfully!");
      router.push('/admin/products');`);
fs.writeFileSync('app/admin/products/[id]/edit/EditProductForm.tsx', editPage);

console.log('done');
