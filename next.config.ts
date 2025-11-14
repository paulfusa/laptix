import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint:{
    ignoreDuringBuilds: true,
  }
};

// Allow loading remote images from Plaid merchant logos
nextConfig.images = {
  domains: [
    'plaid-merchant-logos.plaid.com'
  ],
};

export default nextConfig;
