import CustomCursor from "@/components/storefront/CustomCursor";
import Loader from "@/components/storefront/Loader";
import Navbar from "@/components/storefront/Navbar";
import CartDrawer from "@/components/storefront/CartDrawer";
import FloatingWhatsApp from "@/components/storefront/FloatingWhatsApp";
import SmoothScroll from "@/components/storefront/SmoothScroll";

// Storefront-only chrome. Admin and auth pages live outside this group and render clean.
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Loader />
      <CustomCursor />
      <Navbar />
      <SmoothScroll>{children}</SmoothScroll>
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
