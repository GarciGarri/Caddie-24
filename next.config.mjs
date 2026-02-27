/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel: external packages for serverless functions
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // Transpile ESM-only packages for older browser support
  transpilePackages: [
    "lucide-react",
    "sonner",
    "recharts",
    "cmdk",
  ],
};

export default nextConfig;
