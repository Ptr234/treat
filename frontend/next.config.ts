import type { NextConfig } from "next";

// Sent on every response. The API sets its own headers; these cover the site.
// The CSP only restricts framing, plugins, <base> and form targets: a full
// script/style policy needs the Google sign-in, Analytics and Sanity origins
// worked out and tested first.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // SAMEORIGIN rather than DENY: the Sanity Studio at /studio previews pages
  // of this same site in a frame.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The assistant's voice input needs the microphone on this origin only.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  // Cloudflare Workers via OpenNext (see wrangler.jsonc and DEPLOY_NOTES.md).
  trailingSlash: true,
  poweredByHeader: false,
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
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ['@/components', '@/hooks', '@/lib'],
  },
};

export default nextConfig;
