const fs = require('fs');

let content = fs.readFileSync('app/product/[tag]/page.tsx', 'utf8');

// Change flex-col to flex-col-reverse for mobile
content = content.replace('<div className="flex flex-col md:flex-row min-h-screen">', '<div className="flex flex-col-reverse md:flex-row min-h-screen">');

// Adjust the top padding for the left panel on mobile
content = content.replace('p-8 pt-32 md:p-16 md:pt-32', 'p-8 pt-8 md:p-16 md:pt-32');

fs.writeFileSync('app/product/[tag]/page.tsx', content);
console.log('done');
