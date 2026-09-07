const fs = require('fs');

// 1. Fix DayNightToggle
let toggle = fs.readFileSync('components/storefront/DayNightToggle.tsx', 'utf8');
toggle = toggle.replace('fixed bottom-6 left-6 md:bottom-8 md:left-8', 'fixed bottom-24 left-6 md:bottom-8 md:left-8');
fs.writeFileSync('components/storefront/DayNightToggle.tsx', toggle);

// 2. Fix FloatingWhatsApp
let whatsapp = fs.readFileSync('components/storefront/FloatingWhatsApp.tsx', 'utf8');
whatsapp = whatsapp.replace('fixed bottom-6 right-6 md:bottom-8 md:right-8', 'fixed bottom-24 right-6 md:bottom-8 md:right-8');
fs.writeFileSync('components/storefront/FloatingWhatsApp.tsx', whatsapp);

console.log('done');
