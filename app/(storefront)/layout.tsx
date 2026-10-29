import CustomCursor from "@/components/storefront/CustomCursor";
import Loader from "@/components/storefront/Loader";
import Navbar from "@/components/storefront/Navbar";
import CartDrawer from "@/components/storefront/CartDrawer";
import FloatingWhatsApp from "@/components/storefront/FloatingWhatsApp";
import SmoothScroll from "@/components/storefront/SmoothScroll";
import { getSettings } from "@/lib/settings";

// Storefront-only chrome. Admin and auth pages live outside this group and render clean.
export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { whatsapp_number } = await getSettings();
  return (
    <>
      <Loader />
      <CustomCursor />
      <Navbar />
      <SmoothScroll>{children}</SmoothScroll>
      <CartDrawer whatsappNumber={whatsapp_number} />
      <FloatingWhatsApp whatsappNumber={whatsapp_number} />
    </>
  );
}
