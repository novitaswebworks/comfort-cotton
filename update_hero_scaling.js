const fs = require('fs');
let content = fs.readFileSync('components/storefront/HeroResponsive.tsx', 'utf8');

// 1. Constrain the section to a max-width and max-height so it doesn't distort on ultrawide monitors
content = content.replace(
    'className="relative w-full h-[100svh] flex flex-col justify-between px-4 py-6 md:px-12 md:py-12 overflow-hidden bg-background"',
    'className="relative w-full h-[100svh] max-h-[1080px] max-w-[1920px] mx-auto flex flex-col justify-between px-4 py-6 md:px-12 md:py-12 overflow-hidden bg-background"'
);

// 2. Clamp the typography so it stops scaling infinitely
content = content.replace(
    /text-\[14vw\] md:text-\[9vw\]/g,
    'text-[14vw] md:text-[clamp(4rem,9vw,150px)]'
);
content = content.replace(
    /text-\[12vw\] md:text-\[9vw\]/g,
    'text-[12vw] md:text-[clamp(4rem,9vw,150px)]'
);

// 3. Image wrapper: Add max-width constraint to match the laptop feel
content = content.replace(
    'className="relative w-full h-[85vh] md:w-[80%] md:h-[90%] overflow-hidden rounded-2xl md:rounded-none mt-10 md:mt-0 shadow-2xl"',
    'className="relative w-full h-[85vh] md:w-[80%] md:max-w-[1400px] md:h-[90%] md:max-h-[800px] xl:max-h-[900px] overflow-hidden rounded-2xl md:rounded-none mt-10 md:mt-0 shadow-2xl"'
);

fs.writeFileSync('components/storefront/HeroResponsive.tsx', content);
console.log('done');
