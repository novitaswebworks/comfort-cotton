const fs = require('fs');

let file = fs.readFileSync('components/storefront/DayNightToggle.tsx', 'utf8');

file = file.replace('fixed bottom-6 right-6', 'fixed bottom-6 left-6 md:bottom-8 md:left-8');

fs.writeFileSync('components/storefront/DayNightToggle.tsx', file);
console.log('done');
