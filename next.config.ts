import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'render.worldofwarcraft.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ads-partners.coupang.com',
        pathname: '/**',
      },
    ],
    domains: ['lh3.googleusercontent.com'],
  },
  reactStrictMode: true,
}

export default nextConfig
