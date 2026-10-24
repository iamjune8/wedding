import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  // Local builds go to `.next.nosync` because this folder lives in iCloud Drive, which skips
  // `.nosync` names (syncing build output creates conflicting duplicate files). Vercel keeps
  // the standard `.next`. End-to-end tests set NEXT_DIST_DIR to their own folder.
  distDir: process.env.NEXT_DIST_DIR || (process.env.VERCEL ? '.next' : '.next.nosync'),
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
