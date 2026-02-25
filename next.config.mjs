/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel: external packages for serverless functions
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
};

export default nextConfig;
