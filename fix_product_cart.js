const fs = require('fs');

let page = fs.readFileSync('app/product/[tag]/page.tsx', 'utf8');

page = page.replace("import { MessageCircle } from 'lucide-react';", 
`import { MessageCircle } from 'lucide-react';
import AddToCartButton from '@/components/storefront/AddToCartButton';`);

const oldDesktopOrderBtn = `<a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between bg-foreground text-background px-8 py-5 hover:bg-transparent hover:text-foreground border border-transparent hover:border-foreground transition-all w-full"
            >
              <span className="font-semibold text-xs tracking-[0.2em] uppercase">Inquire & Order via WhatsApp</span>
              <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            </a>`;
const newDesktopOrderBtn = `<AddToCartButton product={{ id: product.id, name: product.name, price: product.price, tag: product.tag, image_url: product.image_url }} />`;

page = page.replace(oldDesktopOrderBtn, newDesktopOrderBtn);

const oldMobileOrderBtn = `<a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-foreground text-background px-6 py-4 w-full"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium text-xs tracking-[0.15em] uppercase">Inquire / Order via WhatsApp</span>
        </a>`;
const newMobileOrderBtn = `<AddToCartButton className="justify-center gap-3 py-4" product={{ id: product.id, name: product.name, price: product.price, tag: product.tag, image_url: product.image_url }} />`;

page = page.replace(oldMobileOrderBtn, newMobileOrderBtn);

// Clean up unused variables
page = page.replace(/const whatsappText = `Hello Comfort Cottons[\s\S]*?encodeURIComponent\(whatsappText\)\}`;/, '');

fs.writeFileSync('app/product/[tag]/page.tsx', page);
console.log('done');
