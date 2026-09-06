const fs = require('fs');
let content = fs.readFileSync('app/product/[tag]/ProductGallery.tsx', 'utf8');

// Add Image import if not present
if (!content.includes('import Image from "next/image"')) {
    content = content.replace('import { useState } from "react";', 'import { useState } from "react";\nimport Image from "next/image";');
}

// Replace <img ... /> with <Image fill ... />
content = content.replace(/<img\s+src=\{image\.url\}\s+alt=\{image\.alt\}\s+className="w-full h-full object-cover transition-transform duration-\[2s\] group-hover:scale-105"\s*\/>/g, '<Image fill src={image.url} alt={image.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" sizes="100vw" priority={idx === 0} />');

content = content.replace(/<img\s+src=\{fullscreenImage\}\s+alt="Fullscreen Detail"\s+className="w-full h-full object-contain max-w-7xl max-h-\[90vh\]"\s*\/>/g, '<Image fill src={fullscreenImage} alt="Fullscreen Detail" className="object-contain" sizes="100vw" />');

fs.writeFileSync('app/product/[tag]/ProductGallery.tsx', content);
console.log('done');
