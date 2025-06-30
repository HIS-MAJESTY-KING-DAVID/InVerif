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
  // Output standalone for GitHub Pages
  output: 'export',
  // Optional: Change the output directory to 'docs' for GitHub Pages
  distDir: 'out',
}

export default nextConfig
