/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@uiw/react-md-editor', '@uiw/react-markdown-preview'],
  reactStrictMode: true,
  swcMinify: true,
  env: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },
  // 支援 Cloudflare Pages 和 Netlify 部署
  trailingSlash: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig