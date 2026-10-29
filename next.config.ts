import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only optimise images from hosts we actually use; a wildcard lets anyone
    // proxy arbitrary images through our optimiser.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
