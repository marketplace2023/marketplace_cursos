import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['cloudinary'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
