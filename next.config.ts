import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Speed optimizations
  experimental: {
    optimizePackageImports: ['recharts', '@tambo-ai/react'],
  },
  // Reduce build time
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
