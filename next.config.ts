import type { NextConfig } from "next";

const isMobileBuild = process.env.BUILD_MODE === 'mobile';

const nextConfig: NextConfig = {
  /* config options here */
  serverActions: {
    bodySizeLimit: '50mb', // Allow up to 50MB file uploads
  },
  eslint: {
    // Ignore ESLint errors during builds to prevent deployment failures
    ignoreDuringBuilds: true,
  },
  ...(isMobileBuild && {
    output: 'export',
    outDir: 'out',
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    // Disable server-side features that don't work in static export
    experimental: {
      esmExternals: 'loose'
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
