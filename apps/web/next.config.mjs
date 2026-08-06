/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@acpia/shared', '@acpia/ui', '@acpia/agent-sdk'],
}

export default nextConfig
