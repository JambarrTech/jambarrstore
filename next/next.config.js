/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jambarrtech/shared'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  serverExternalPackages: ['@prisma/client'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
}
module.exports = nextConfig