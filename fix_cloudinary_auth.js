const fs = require('fs');

// 1. Update actions.ts to return keys at runtime
let actions = fs.readFileSync('app/admin/products/actions.ts', 'utf8');

const newSig = `
export async function getCloudinarySignature() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiSecret) throw new Error("Cloudinary API Secret is missing on server");

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'comfort-cottons' },
    apiSecret
  );

  return { timestamp, signature, cloudName, apiKey };
}
`;

actions = actions.replace(/export async function getCloudinarySignature\(\) \{[\s\S]*?return \{ timestamp, signature \};\n\}/, newSig.trim());
fs.writeFileSync('app/admin/products/actions.ts', actions);

// 2. Update client components to use the runtime keys
function fixClient(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    const newUpload = `
  async function uploadFile(file: File${filename.includes('Edit') ? ' | null' : ''}) {
    if (!file || file.size === 0) return ${filename.includes('Edit') ? 'null' : '""'};
    
    // 1. Get Signature & Keys dynamically from Server (bypasses build-time cache issues)
    const { timestamp, signature, cloudName, apiKey } = await getCloudinarySignature();

    if (!cloudName || !apiKey) {
      throw new Error("Cloudinary configuration missing. Please check Vercel environment variables.");
    }

    // 2. Upload directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", "comfort-cottons");

    const res = await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Cloudinary error:", errorText);
      throw new Error("Failed to upload image to Cloudinary: " + errorText);
    }

    const data = await res.json();
    return data.secure_url;
  }
`;

    content = content.replace(/async function uploadFile\(file: File(?: \| null)?\) \{[\s\S]*?return data\.secure_url;\n  \}/, newUpload.trim());
    fs.writeFileSync(filename, content);
}

fixClient('app/admin/products/new/page.tsx');
fixClient('app/admin/products/[id]/edit/EditProductForm.tsx');
console.log('done');
