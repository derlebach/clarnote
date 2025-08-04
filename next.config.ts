import type { NextConfig } from "next";

const isMobileBuild = process.env.BUILD_MODE === 'mobile';

const nextConfig: NextConfig = {
  /* config options here */
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
