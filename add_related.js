const fs = require('fs');
let content = fs.readFileSync('app/product/[tag]/page.tsx', 'utf8');

// Add Image import
if (!content.includes('import Image from "next/image"')) {
    content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';");
}

// Add the DB fetch for related products
content = content.replace(
    "const whatsappText = `Hello Comfort Cottons",
    `const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .eq('status', 'Published')
    .neq('id', product.id)
    .limit(3);

  const whatsappText = \`Hello Comfort Cottons`
);

const relatedHtml = `
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="w-full bg-muted/30 py-24 px-6 md:px-16 border-t border-border">
          <h2 className="text-sm font-medium tracking-widest uppercase mb-12 text-center">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {relatedProducts.map((rel) => (
              <Link key={rel.id} href={\`/product/\${rel.tag}\`} className="group block">
                <div className="aspect-[4/5] relative overflow-hidden mb-4 bg-muted">
                  <Image 
                    fill 
                    src={rel.image_url} 
                    alt={rel.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h3 className="font-light text-lg">{rel.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">₹{rel.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
`;

content = content.replace(
    `      </div>

      {/* Mobile Fixed Order Button */}`,
    `${relatedHtml}
      </div>

      {/* Mobile Fixed Order Button */}`
);

fs.writeFileSync('app/product/[tag]/page.tsx', content);
console.log('done');
