import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactCompiler: true,
    cacheComponents: true,
    partialPrefetching: true,
    experimental: {
        useLightningcss: true
    }
}

export default nextConfig
