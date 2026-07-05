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
  // Bundle analysis (run: ANALYZE=true npm run build)
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        })
      );
    }
    return config;
  },
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ['@/components', '@/hooks', '@/lib'],
  },
};

export default nextConfig;
