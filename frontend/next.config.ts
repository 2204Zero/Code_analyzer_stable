import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['127.0.0.1', 'http://127.0.0.1:3000'],
};

export default nextConfig;
