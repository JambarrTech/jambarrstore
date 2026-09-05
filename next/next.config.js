/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jambarrtech/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
}
module.exports = nextConfig