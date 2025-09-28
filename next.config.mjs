/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pb-reliant-proto.fly.dev'],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
};

export default nextConfig;
