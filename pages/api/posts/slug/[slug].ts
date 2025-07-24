import { NextApiRequest, NextApiResponse } from 'next';
import { dynamoDBService } from '../../../../lib/dynamodb';
import { AuthService } from '../../../../lib/auth';
import { createApiResponse } from '../../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(createApiResponse(false, null, 'Method Not Allowed'));
  }

  try {
    const { slug } = req.query;
    
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json(createApiResponse(false, null, 'Invalid post slug'));
    }

    const post = await dynamoDBService.getPostBySlug(slug);
    
    if (!post) {
      return res.status(404).json(createApiResponse(false, null, 'Post not found'));
    }

    // If the post is not published, only admins can view it
    if (!post.published) {
      const authPayload = await AuthService.requireAuth(req, res);
      if (!authPayload) return; // Auth failed, requireAuth handled the response
    } else {
      // Increment view count for published posts
      await dynamoDBService.incrementPostViews(post.id, post.created_at);
      // Cache published posts
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }

    return res.status(200).json(createApiResponse(true, post));
  } catch (error) {
    console.error('Get post by slug error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Failed to fetch post'));
  }
}