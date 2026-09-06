const fs = require('fs');
let layout = fs.readFileSync('app/admin/layout.tsx', 'utf8');
layout = layout.replace('<UserButton afterSignOutUrl="/" />', '<UserButton />');
fs.writeFileSync('app/admin/layout.tsx', layout);
console.log('done');
