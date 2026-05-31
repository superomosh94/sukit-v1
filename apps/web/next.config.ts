import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
  turbopack: {
    resolveAlias: {
      "monaco-editor": "monaco-editor",
    },
  },
  async rewrites() {
    const VITE_DEV = process.env.VITE_DEV === "true" ? "http://localhost:5173" : null;
    if (!VITE_DEV) return [];
    return [
      {
        source: "/studio/:path*",
        destination: `${VITE_DEV}/studio/:path*`,
      },
    ];
  },
};

export default nextConfig;
