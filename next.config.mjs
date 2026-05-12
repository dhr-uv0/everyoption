/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  // Silence Supabase realtime warning in build
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
