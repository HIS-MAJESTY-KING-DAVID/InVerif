/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add base path for GitHub Pages
  basePath: isProd ? '/InVerif' : '',
  assetPrefix: isProd ? '/InVerif/' : '',
  // Enable static export
  output: 'export',
  // Disable image optimization API (not needed for static export)
  images: {
    unoptimized: true,
  },
  // Optional: Add trailing slash for better compatibility
  trailingSlash: true,
}

export default nextConfig
