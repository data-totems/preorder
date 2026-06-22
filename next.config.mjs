/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fra.cloud.appwrite' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Any Render service (covers the current backend + future redeploys
      // that get fresh subdomains).
      { protocol: 'https', hostname: '**.onrender.com' },
      // DigitalOcean Spaces — for the day media moves back to it.
      { protocol: 'https', hostname: '**.digitaloceanspaces.com' },
    ],
  },
};

export default nextConfig;