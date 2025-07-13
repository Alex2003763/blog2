import { NextApiRequest, NextApiResponse } from 'next';
import { dynamoDBService } from '../../lib/dynamodb';

const YOUR_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const posts = await dynamoDBService.getAllPostsForSitemap();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${YOUR_DOMAIN}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
        <url>
          <loc>${YOUR_DOMAIN}/search</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
        ${posts
          .map(({ slug, updated_at }) => {
            return `
              <url>
                <loc>${`${YOUR_DOMAIN}/posts/${slug}`}</loc>
                <lastmod>${new Date(updated_at).toISOString()}</lastmod>
                <changefreq>monthly</changefreq>
                <priority>0.7</priority>
              </url>
            `;
          })
          .join('')}
      </urlset>
    `;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}