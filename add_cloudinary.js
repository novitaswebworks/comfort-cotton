const fs = require('fs');
let actions = fs.readFileSync('app/admin/products/actions.ts', 'utf8');

// Add cloudinary signature generation to actions.ts
if (!actions.includes('v2 as cloudinary')) {
    actions = 'import { v2 as cloudinary } from "cloudinary";\n' + actions;
    
    const sigCode = `
export async function getCloudinarySignature() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'comfort-cottons' },
    process.env.CLOUDINARY_API_SECRET!
  );

  return { timestamp, signature };
}
`;
    actions = actions + sigCode;
    fs.writeFileSync('app/admin/products/actions.ts', actions);
}
console.log('actions updated');
