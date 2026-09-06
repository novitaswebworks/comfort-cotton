const fs = require('fs');
let content = fs.readFileSync('app/admin/products/actions.ts', 'utf8');

content = content.replace('import { v2 as cloudinary } from "cloudinary";\n"use server";', '"use server";\nimport { v2 as cloudinary } from "cloudinary";');

fs.writeFileSync('app/admin/products/actions.ts', content);
console.log('done');
