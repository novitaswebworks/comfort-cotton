const fs = require('fs');

let layout = fs.readFileSync('app/admin/layout.tsx', 'utf8');

if (!layout.includes('sonner')) {
    layout = layout.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { Toaster } from "sonner";');
    layout = layout.replace('{children}', '{children}\n        <Toaster position="top-right" richColors />');
    fs.writeFileSync('app/admin/layout.tsx', layout);
}
console.log('done');
