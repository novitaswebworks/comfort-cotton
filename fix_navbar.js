const fs = require('fs');

let nav = fs.readFileSync('components/storefront/Navbar.tsx', 'utf8');

nav = nav.replace('import Link from "next/link";', 
`import Link from "next/link";
import CartButton from "./CartButton";`);

nav = nav.replace('</nav>', 
`      <div className="flex items-center gap-4">
        <CartButton />
      </div>
    </nav>`);

fs.writeFileSync('components/storefront/Navbar.tsx', nav);
console.log('done');
