const fs = require('fs');
let content = fs.readFileSync('app/product/[tag]/ProductGallery.tsx', 'utf8');

content = content.replace(
    "<div className=\"w-full h-full\">",
    "<div className=\"w-full h-full\">\n        <AnimatePresence>"
);

// We need to wrap the image block in a motion.div
content = content.replace(
    /<div \n\s*key=\{idx\} \n\s*className="relative w-full h-\[70vh\] md:h-screen group cursor-pointer border-b border-border last:border-b-0 overflow-hidden"/g,
    `<motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            key={idx} 
            className="relative w-full h-[70vh] md:h-screen group cursor-pointer border-b border-border last:border-b-0 overflow-hidden"`
);

content = content.replace(
    `            </div>
          </div>
        ))}
      </div>`,
    `            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>`
);

fs.writeFileSync('app/product/[tag]/ProductGallery.tsx', content);
console.log('done');
