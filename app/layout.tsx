import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/storefront/CustomCursor";
import Loader from "@/components/storefront/Loader";
import Navbar from "@/components/storefront/Navbar";
import DayNightToggle from "@/components/storefront/DayNightToggle";
import CartDrawer from "@/components/storefront/CartDrawer";
import FloatingWhatsApp from "@/components/storefront/FloatingWhatsApp";
import SmoothScroll from "@/components/storefront/SmoothScroll";
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Comfort Cottons | Premium Bedsheets",
  description: "Experience the art of sleep with our premium, breathable, 100% organic cotton bedsheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${playfair.variable} font-sans antialiased transition-colors duration-1000`}>
          <Loader />
          <CustomCursor />
          <Navbar />
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <DayNightToggle />
          <CartDrawer />
          <FloatingWhatsApp />
        </body>
      </html>
    </ClerkProvider>
  );
}
