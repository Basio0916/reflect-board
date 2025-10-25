import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@github/spark'],
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
}

export default nextConfig
