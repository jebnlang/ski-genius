/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  }
}

module.exports = nextConfig 