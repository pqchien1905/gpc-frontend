import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in dev (allows private IPs)
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
      // Allow LAN addresses (192.168.x.x)
      {
        protocol: 'http',
        hostname: '192.168.*.*',
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

