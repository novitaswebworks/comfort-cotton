const fs = require('fs');

let file = fs.readFileSync('components/storefront/ProductLookbook.tsx', 'utf8');

// Replace standard handleOrder
file = file.replace(/const handleOrder = \([\s\S]*?\}?;/, '');

file = file.replace("import { MessageCircle, ArrowUpRight } from \"lucide-react\";", 
`import { MessageCircle, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";`);

// Add useCartStore to the component
file = file.replace("export default function ProductLookbook({ products, chapter = 1, title = \"The Collection\" }: { products: Product[]; chapter?: number; title?: string }) {", 
`export default function ProductLookbook({ products, chapter = 1, title = "The Collection" }: { products: Product[]; chapter?: number; title?: string }) {
  const { addItem } = useCartStore();`);

// Fix handleOrder onClick -> Add to cart
const oldButton = `<button 
                  onClick={(e) => handleOrder(product, e)}
                  className="group/btn flex items-center gap-3 bg-foreground text-background px-8 py-4 hover:bg-transparent hover:text-foreground border border-transparent hover:border-foreground transition-all pointer-events-auto"
                >
                  <MessageCircle className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                  <span className="font-medium text-xs tracking-[0.15em] uppercase">Inquire / Order</span>
                </button>`;

const newButton = `<button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({ id: product.id, name: product.name, price: product.price, tag: product.tag, image_url: product.image_url });
                  }}
                  className="group/btn flex items-center gap-3 bg-foreground text-background px-8 py-4 hover:bg-transparent hover:text-foreground border border-transparent hover:border-foreground transition-all pointer-events-auto"
                >
                  <ShoppingBag className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                  <span className="font-medium text-xs tracking-[0.15em] uppercase">Add to Bag</span>
                </button>`;

file = file.replace(oldButton, newButton);

fs.writeFileSync('components/storefront/ProductLookbook.tsx', file);
console.log('done');
