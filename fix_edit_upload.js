const fs = require('fs');
let content = fs.readFileSync('app/admin/products/[id]/edit/EditProductForm.tsx', 'utf8');

// The new uploadFile function for EditProductForm (accepts File | null)
const newUploadFile = `
  async function uploadFile(file: File | null) {
    if (!file || file.size === 0) return null;
    
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

    const res = await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await res.json();
    return data.secure_url;
  }
`;

// Replace the old uploadFile function (starts at line 16, ends around line 35)
content = content.replace(/async function uploadFile\(file: File \| null, prefix: string\) \{[\s\S]*?return publicUrl;\n  \}/, newUploadFile.trim());

// We also need to fix the imports
content = content.replace("import { getPresignedUploadUrl, updateProductDb } from '../../actions';", "import { getCloudinarySignature, updateProductDb } from '../../actions';");

fs.writeFileSync('app/admin/products/[id]/edit/EditProductForm.tsx', content);
console.log('done');
