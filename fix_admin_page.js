const fs = require('fs');
let content = fs.readFileSync('app/admin/products/page.tsx', 'utf8');

content = content.replace(
    "<TableHead>Category</TableHead>",
    "<TableHead>Category</TableHead>\n                  <TableHead>Status</TableHead>"
);

const statusHtml = `
                    <TableCell>
                      <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${product.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}\`}>
                        {product.status || 'Published'}
                      </span>
                    </TableCell>
`;

content = content.replace(
    `                      </span>
                    </TableCell>
                    <TableCell>{product.type}</TableCell>`,
    `                      </span>
                    </TableCell>${statusHtml}                    <TableCell>{product.type}</TableCell>`
);

fs.writeFileSync('app/admin/products/page.tsx', content);
console.log('done');
