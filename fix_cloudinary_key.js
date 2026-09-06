const fs = require('fs');
let content = fs.readFileSync('app/admin/products/actions.ts', 'utf8');

content = content.replace(
    'api_key: process.env.CLOUDINARY_API_KEY,',
    'api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,'
);

fs.writeFileSync('app/admin/products/actions.ts', content);
console.log('done');
