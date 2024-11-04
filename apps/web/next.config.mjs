/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cloudflare-ipfs.com'],
    remotePatterns: [
      { hostname: 'github.com' },
      { hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default nextConfig
