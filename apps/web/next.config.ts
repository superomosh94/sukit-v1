import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-switch',
      '@radix-ui/react-separator',
      '@radix-ui/react-toast',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
    ],
  },
  typedRoutes: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: 'utfs.io' },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    const VITE_DEV =
      process.env.VITE_DEV === 'true' ? 'http://localhost:5173' : null;
    if (!VITE_DEV) return [];
    return [
      {
        source: '/studio/:path*',
        destination: `${VITE_DEV}/studio/:path*`,
      },
    ];
  },
};

export default nextConfig;
