/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repo = 'InVerif';
const assetPrefix = isProd ? `/${repo}/` : '';
const basePath = isProd ? `/${repo}` : '';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable image optimization API (not needed for static export)
  images: {
    unoptimized: true,
  },
  // Add base path for GitHub Pages
  basePath,
  assetPrefix,
  // Enable static export
  output: 'export',
  // Optional: Add trailing slash for better compatibility
  trailingSlash: true,
  // Ensure static export works with App Router
  experimental: {
    appDir: true,
  },
  // Handle static files
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
}

export default nextConfig
