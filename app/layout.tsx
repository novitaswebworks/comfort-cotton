import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Comfort Cottons | Premium Bedsheets", template: `%s | ${SITE_NAME}` },
  description: "Experience the art of sleep with our premium, breathable, 100% organic cotton bedsheets.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Comfort Cottons | Premium Bedsheets",
    description: "Premium, breathable cotton bedsheets, dohads and deewan sets.",
    url: "/",
    images: [{ url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80" }],
  },
};

// Runs before paint so the saved/system theme is applied without a flash.
const themeScript = `try{var t=localStorage.getItem('cc_theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
