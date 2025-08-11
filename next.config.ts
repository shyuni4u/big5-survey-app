import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-lostark.game.onstove.com',
        pathname: '/2018/obt/assets/images/**',
      },
      {
        protocol: 'https',
        hostname: 'render.worldofwarcraft.com',
        pathname: '/character/**',
      },
      {
        protocol: 'https',
        hostname: 'ads-partners.coupang.com',
        pathname: '/banners/**',
      },
    ],
  },
  reactStrictMode: true,
}

export default nextConfig
