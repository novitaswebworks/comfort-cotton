const fs = require('fs');

let file = fs.readFileSync('components/storefront/ProductLookbook.tsx', 'utf8');

const brokenFunctionBody = `
    e.stopPropagation();
    const text = \`Hello Comfort Cottons! I want to order the \${product.name} bedsheet (Tag: #\${product.tag}) priced at ₹\${product.price}.\`;
    window.open(\`https://wa.me/1234567890?text=\${encodeURIComponent(text)}\`, '_blank');
  };`;

file = file.replace(brokenFunctionBody, '');

// Also import React's useRef, useState, useEffect
file = file.replace('import Link from "next/link";', 
`import Link from "next/link";
import { useRef, useState, useEffect } from "react";`);

fs.writeFileSync('components/storefront/ProductLookbook.tsx', file);
console.log('done');
