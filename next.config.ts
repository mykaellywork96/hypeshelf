import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      // Clerk also serves images from these domains
      {
        protocol: "https",
        hostname: "**.clerk.com",
      },
    ],
  },
};

export default nextConfig;
