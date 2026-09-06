"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ProductGalleryProps {
  images: { url: string; alt: string }[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <>
      <div className="w-full h-full">
        <AnimatePresence>
        {images.map((image, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            key={idx} 
            className="relative w-full h-[70vh] md:h-screen group cursor-pointer border-b border-border last:border-b-0 overflow-hidden"
            onClick={() => setFullscreenImage(image.url)}
          >
            <Image fill src={image.url} alt={image.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" sizes="100vw" priority={idx === 0} />
            
            {/* Context Label */}
            <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 mix-blend-difference text-white flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-1">
                {idx === 0 ? '01 / Full View' : '02 / Texture Detail'}
              </span>
              <span className="text-sm font-medium tracking-widest uppercase">
                {idx === 0 ? 'Overall Drape' : 'Fabric Quality'}
              </span>
            </div>

            {/* Expand Icon */}
            <div className="absolute top-6 right-6 md:top-12 md:right-12 mix-blend-difference text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>

      {/* Fullscreen Lightbox for Pinch-Zoom on Mobile */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black flex items-center justify-center cursor-zoom-out"
            onClick={() => setFullscreenImage(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>
            <Image fill src={fullscreenImage} alt="Fullscreen Detail" className="object-contain" sizes="100vw" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
