"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SecretLogout({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  // Magic Keyboard Sequence
  useEffect(() => {
    let keySequence = "";
    const secretCode = "escape"; // Changed from logout to feel more mysterious

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      keySequence += e.key.toLowerCase();
      if (keySequence.length > secretCode.length) {
        keySequence = keySequence.slice(-secretCode.length);
      }
      if (keySequence === secretCode) {
        executeLogout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Magic 5-Tap for Mobile
  useEffect(() => {
    if (clickCount >= 5) {
      executeLogout();
      setClickCount(0);
    }
    
    // Reset if they stop tapping for 1.5 seconds
    const timer = setTimeout(() => setClickCount(0), 1500);
    return () => clearTimeout(timer);
  }, [clickCount]);

  const executeLogout = async () => {
    // Fun visual transition for the admin
    document.body.style.transition = "all 0.8s cubic-bezier(0.87, 0, 0.13, 1)";
    document.body.style.filter = "blur(10px) brightness(0.2)";
    
    setTimeout(() => {
      signOut(() => {
        // Reset styles and reload
        document.body.style.filter = "none";
        window.location.href = "/";
      });
    }, 800);
  };

  return (
    <div 
      onClick={() => setClickCount(c => c + 1)}
      className="cursor-default select-none inline-block"
      title=" " 
    >
      {children}
    </div>
  );
}
