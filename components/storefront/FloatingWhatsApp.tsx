"use client";

import { MessageCircle } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { useEffect, useState } from "react";

export default function FloatingWhatsApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleChat = () => {
    window.open(generateWhatsAppLink("Hello! I have a question about your products."), "_blank");
  };

  return (
    <button
      onClick={handleChat}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-green-600 transition-all duration-300 group flex items-center gap-0 overflow-hidden"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="w-0 overflow-hidden whitespace-nowrap text-xs font-semibold tracking-wide uppercase transition-all duration-300 group-hover:w-32 group-hover:ml-3">
        Chat with us
      </span>
    </button>
  );
}
