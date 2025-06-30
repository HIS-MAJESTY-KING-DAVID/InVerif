/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repo = 'InVerif';
const assetPrefix = isProd ? `/${repo}/` : '';
const basePath = isProd ? `/${repo}` : '';

const nextConfig = {
  // Disable React StrictMode for better compatibility with some libraries
  reactStrictMode: false,
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable image optimization API for static export
  images: {
    unoptimized: true,
  },
  
  // Add base path for GitHub Pages
  basePath,
  assetPrefix,
  
  // Enable static export
  output: 'export',
  
  // Add trailing slash for better compatibility
  trailingSlash: true,
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        tls: false,
        net: false,
        dns: false,
        child_process: false,
        dgram: false,
      };
    }
    return config;
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Disable ETag generation
  generateEtags: false,
  
  // Disable x-powered-by header
  poweredByHeader: false,
}

export default nextConfig
