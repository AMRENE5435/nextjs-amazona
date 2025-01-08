import type { NextConfig } from 'next'
import withNextIntl from 'next-intl/plugin'

const nextConfig: NextConfig = withNextIntl()({
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/icons/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
})

export default nextConfig
