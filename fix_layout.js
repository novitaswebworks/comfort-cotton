const fs = require('fs');

let layout = fs.readFileSync('app/layout.tsx', 'utf8');

layout = layout.replace('import DayNightToggle from "@/components/storefront/DayNightToggle";', 
`import DayNightToggle from "@/components/storefront/DayNightToggle";
import CartDrawer from "@/components/storefront/CartDrawer";
import FloatingWhatsApp from "@/components/storefront/FloatingWhatsApp";`);

layout = layout.replace('<DayNightToggle />', 
`<DayNightToggle />
          <CartDrawer />
          <FloatingWhatsApp />`);

fs.writeFileSync('app/layout.tsx', layout);
console.log('done');
