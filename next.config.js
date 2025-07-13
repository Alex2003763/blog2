/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@uiw/react-md-editor', '@uiw/react-markdown-preview', 'react-hot-toast'],
  reactStrictMode: true,
  swcMinify: true,
  env: {
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  // 支援 Cloudflare Pages 和 Netlify 部署
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ];
  },
}

module.exports = nextConfig