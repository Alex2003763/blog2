import { NextApiRequest, NextApiResponse } from 'next';
import { dynamoDBService } from '../../../lib/dynamodb';
import { AuthService } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const payload = await AuthService.requireAuth(req, res);
  if (!payload) {
    return;
  }

  try {
    const posts = await dynamoDBService.getAllPosts();
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.published).length;
    const draftPosts = totalPosts - publishedPosts;

    res.status(200).json({
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}