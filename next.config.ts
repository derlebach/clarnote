import type { NextConfig } from "next";

const isMobileBuild = process.env.BUILD_MODE === 'mobile';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Allow up to 100MB file uploads
    },
    ...(isMobileBuild && {
      esmExternals: 'loose'
    })
  },
  eslint: {
    // Ignore ESLint errors during builds to prevent deployment failures
    ignoreDuringBuilds: true,
  },
  images: {
    // Enable unoptimized images for better compatibility
    unoptimized: true,
    // Add domains if loading external images
    domains: [],
    // Support for various image formats including SVG
    formats: ['image/webp', 'image/avif'],
  },
  ...(isMobileBuild && {
    output: 'export',
    distDir: 'out',
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    // Disable type checking during build for mobile
    typescript: {
      ignoreBuildErrors: true
    },
    eslint: {
      ignoreDuringBuilds: true
    }
  })
};

export default nextConfig;
