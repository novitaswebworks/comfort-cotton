const fs = require('fs');
let content = fs.readFileSync('app/collections/[category]/page.tsx', 'utf8');

// Add Image import if not present
if (!content.includes('import Image from "next/image"')) {
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport Image from "next/image";');
}

// Replace <img ... /> with <Image fill ... />
content = content.replace(/<img\s+src=\{product\.image_url\}\s+alt=\{product\.name\}\s+className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"\s*\/>/g, '<Image fill src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />');

content = content.replace(/<img\s+src=\{product\.pillow_image_url\}\s+alt=\{\`\$\{product\.name\} Pillow Cover\`\}\s+className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"\s*\/>/g, '<Image fill src={product.pillow_image_url} alt={`${product.name} Pillow Cover`} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />');

fs.writeFileSync('app/collections/[category]/page.tsx', content);
console.log('done');
