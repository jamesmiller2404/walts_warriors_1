import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  images: {
    // Defaults are 640–3840 with a 2048 gap before 3840. The check-in header
    // artwork masters are 2880px wide (2x of the 1440px design canvas), so add
    // 2880 as a candidate — otherwise a 1440-CSS-px @2x screen tops out at the
    // 2048 variant and the browser upscales it.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2880, 3840],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/images/**',
      },
      {
        pathname: '/icons/**',
      },
    ],
    remotePatterns: [
      // Media is served through Payload's same-origin /media/... static handler
      // (bytes proxied from R2), so no remote host is needed. If you later move
      // to direct R2 serving via a custom domain, add it here:
      // { protocol: 'https', hostname: 'media.example.com' },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(dirname),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
