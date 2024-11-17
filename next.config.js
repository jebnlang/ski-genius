/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.weski.com',
      },
      {
        protocol: 'https',
        hostname: '**.crystalski.co.uk',
      },
      {
        protocol: 'https',
        hostname: '**.igluski.com',
      },
      {
        protocol: 'https',
        hostname: '**.skideal.co.il',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  }
}

module.exports = nextConfig 