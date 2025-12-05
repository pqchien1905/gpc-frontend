import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '*.your-domain.com',
        pathname: '/storage/**',
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const storageUrl = apiUrl.replace('/api', '');
    return [
      {
        source: '/storage/:path*',
        destination: `${storageUrl}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
