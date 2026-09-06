const fs = require('fs');

function updateFile(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    content = content.replace("import { getPresignedUploadUrl, createProductDb } from '../actions';", "import { getCloudinarySignature, createProductDb } from '../actions';");
    content = content.replace("import { getPresignedUploadUrl, updateProductDb } from '../actions';", "import { getCloudinarySignature, updateProductDb } from '../actions';");

    const newUploadFile = `
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

    // Replace the old uploadFile function
    content = content.replace(/async function uploadFile\(file: File, prefix: string\) \{[\s\S]*?return publicUrl;\n  \}/, newUploadFile.trim());

    // Replace the calls to uploadFile
    content = content.replace(/await uploadFile\(mainImageFile, 'main'\)/g, "await uploadFile(mainImageFile)");
    content = content.replace(/await uploadFile\(zoomImageFile, 'zoom'\)/g, "await uploadFile(zoomImageFile)");
    content = content.replace(/await uploadFile\(pillowImageFile, 'pillow'\)/g, "await uploadFile(pillowImageFile)");
    
    // Remove the message about Supabase storage bucket
    content = content.replace(/<p className="text-xs text-zinc-500 mb-4">You must create a public bucket named &quot;products&quot; in your Supabase Storage for this to work\.<\/p>/, "");

    fs.writeFileSync(filename, content);
}

updateFile('app/admin/products/new/page.tsx');
updateFile('app/admin/products/[id]/edit/EditProductForm.tsx');
console.log('files updated');
