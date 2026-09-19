import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: [
    '*.cloudworkstations.dev',
    '*.firebase-studio.com',
    '*.web.app',
    '*.firebaseapp.com',
    '6000-firebase-studio-1780936922869.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev'
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  serverExternalPackages: ['puppeteer', 'puppeteer-core'],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'ui-avatars.com', port: '', pathname: '/**' },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Disable persistent caching in development to resolve ENOENT: no such file or directory issues
    // with corrupted .next/cache/webpack packs in cloud workstation environments.
    if (dev) {
      config.cache = false;
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        encoding: false,
      };
    }
    return config;
  },
};

export default nextConfig;
