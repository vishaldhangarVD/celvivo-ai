import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedDevOrigins: [
        '*.cloudworkstations.dev',
        '*.firebase-studio.com',
        '*.web.app',
        '*.firebaseapp.com',
        '6000-firebase-studio-1780936922869.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev'
      ],
    },
  },
  // Optimize development performance by excluding heavy native modules from the bundle
  serverExternalPackages: ['puppeteer', 'puppeteer-core'],
  
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
