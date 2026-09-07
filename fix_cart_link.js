const fs = require('fs');

let file = fs.readFileSync('components/storefront/CartDrawer.tsx', 'utf8');

const oldCheckout = `const handleCheckout = () => {
    let message = "Hello Comfort Cottons! I would like to place an order:\\n\\n";
    items.forEach((item) => {
      message += \`- \${item.quantity}x \${item.name} (Tag: #\${item.tag}) - ₹\${item.price * item.quantity}\\n\`;
    });
    message += \`\\n*Total: ₹\${total}*\\n\\nPlease let me know the payment and shipping details.\`;

    window.open(generateWhatsAppLink(message), "_blank");
  };`;

const newCheckout = `const handleCheckout = () => {
    let message = "Hello Comfort Cottons! I would like to place an order:\\n\\n";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://comfort-cotton.vercel.app";
    items.forEach((item) => {
      message += \`- \${item.quantity}x \${item.name}\\n  Tag: #\${item.tag}\\n  Price: ₹\${item.price * item.quantity}\\n  Link: \${baseUrl}/product/\${item.tag}\\n\\n\`;
    });
    message += \`*Total Estimated Value: ₹\${total}*\\n\\nPlease let me know the payment and shipping details.\`;

    window.open(generateWhatsAppLink(message), "_blank");
  };`;

file = file.replace(oldCheckout, newCheckout);

fs.writeFileSync('components/storefront/CartDrawer.tsx', file);
console.log('done');
