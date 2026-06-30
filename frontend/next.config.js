/** @type {import("next").NextConfig} */
const nextConfig = {
  // Ignore ESLint errors during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during production build
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

module.exports = nextConfig;
