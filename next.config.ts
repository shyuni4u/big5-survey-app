import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-lostark.game.onstove.com',
        pathname: '/**',
      },
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
  },
  reactStrictMode: true,
}

export default nextConfig
