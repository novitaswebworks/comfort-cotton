"use client";

import { MessageCircle } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { usePathname } from "next/navigation";
import { useMounted } from "@/lib/use-mounted";

export default function FloatingWhatsApp({ whatsappNumber }: { whatsappNumber?: string }) {
  const mounted = useMounted();
  const pathname = usePathname();
  // Product pages have a fixed add-to-bag bar on mobile; sit above it there.
  const bottom = pathname.startsWith("/product/") ? "bottom-24" : "bottom-5";

  if (!mounted) return null;

  const handleChat = () => {
    window.open(generateWhatsAppLink("Hello! I have a question about your products.", whatsappNumber), "_blank");
  };

  return (
    <button
      onClick={handleChat}
      className={`fixed ${bottom} right-4 md:bottom-8 md:right-8 z-50 bg-green-500 text-white p-3.5 md:p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-green-600 transition-all duration-300 group flex items-center gap-0 overflow-hidden`}
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="w-0 overflow-hidden whitespace-nowrap text-xs font-semibold tracking-wide uppercase transition-all duration-300 group-hover:w-32 group-hover:ml-3">
        Chat with us
      </span>
    </button>
  );
}
