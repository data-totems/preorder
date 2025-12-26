import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   typescript: {
        ignoreBuildErrors: true
    },
      eslint: {
    ignoreDuringBuilds: true
  }, 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite'
      },
       {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
    ]
  }
};

export default nextConfig;
