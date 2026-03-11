import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment — SSR enabled (removed static export for Sanity Studio + API routes)
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
