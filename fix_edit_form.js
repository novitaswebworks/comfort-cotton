const fs = require('fs');
let content = fs.readFileSync('app/admin/products/[id]/edit/EditProductForm.tsx', 'utf8');

// Add status to form submission
content = content.replace(
    "category: formData.get('category') as string,",
    "category: formData.get('category') as string,\n        status: formData.get('status') as string,"
);

// Add the status select in UI
const statusHtml = `
              <div className="space-y-2">
                <Label htmlFor="status">Publish Status</Label>
                <select 
                  id="status" 
                  name="status" 
                  required
                  defaultValue={product.status || 'Published'}
                  className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="Draft">Draft (Hidden)</option>
                  <option value="Published">Published (Live)</option>
                </select>
              </div>
`;

content = content.replace(
    `                </select>
              </div>
            </div>`,
    `                </select>
              </div>
${statusHtml}
            </div>`
);

fs.writeFileSync('app/admin/products/[id]/edit/EditProductForm.tsx', content);
console.log('done');
