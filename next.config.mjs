import bundleAnalyzer from '@next/bundle-analyzer';
import fs from 'node:fs';
import path from 'node:path';

// The Group Guide download appears on /groups only when the PDF is in the repo.
const GROUP_GUIDE = '/docs/kosa-group-guide-2026-27.pdf';
const hasGroupGuide = fs.existsSync(path.join(process.cwd(), 'public', GROUP_GUIDE));

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_GROUP_GUIDE: hasGroupGuide ? GROUP_GUIDE : '' },
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for a year so repeat visits skip re-optimization
    // and re-download (covers every Supabase-hosted photo via next/image).
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
      {
        // Long-lived, immutable cache for static media in public/media
        // (the Welcome Home video + poster, etc.). These are stable named
        // assets; replace via a new filename to bust the cache.
        source: '/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
