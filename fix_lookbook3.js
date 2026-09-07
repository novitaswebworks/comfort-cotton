const fs = require('fs');

let file = fs.readFileSync('components/storefront/ProductLookbook.tsx', 'utf8');

file = file.replace('import { useRef, useState, useEffect } from "react";', '');

fs.writeFileSync('components/storefront/ProductLookbook.tsx', file);
console.log('done');
