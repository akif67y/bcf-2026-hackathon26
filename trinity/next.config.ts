import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@xenova/transformers', 'pdf-parse'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hbkgefwqqgjslveoedwa.supabase.co',
      },
    ],
  },
};

export default nextConfig;
