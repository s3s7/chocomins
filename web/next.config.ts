// import type { NextConfig } from 'next'

// const nextConfig: NextConfig = {
//   /* config options here */
// }

// export default nextConfig
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ローカル Supabase（例: http://127.0.0.1:54321）
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },

    ],
  },
}

export default nextConfig
