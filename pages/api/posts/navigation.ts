import { NextApiRequest, NextApiResponse } from 'next';
import { dynamoDBService } from '../../../lib/dynamodb';
import { BlogPost } from '../../../lib/dynamodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { currentSlug } = req.query;

  if (!currentSlug || typeof currentSlug !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing currentSlug parameter' });
  }

  try {
    // Fetch all posts, sorted by creation date to determine next/previous
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      IndexName: 'GSI1', // Assuming GSI1 is used for fetching all posts, e.g., by type 'post'
      KeyConditionExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':type': 'post',
      },
      ScanIndexForward: false, // Sort by created_at descending by default for latest posts first
    };

    const posts: BlogPost[] = await dynamoDBService.getAllPosts();

    // Sort posts by created_at in ascending order to easily find previous/next
    posts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const currentIndex = posts.findIndex(post => post.slug === currentSlug);

    let prevPost = null;
    let nextPost = null;

    if (currentIndex !== -1) {
      if (currentIndex > 0) {
        prevPost = {
          slug: posts[currentIndex - 1].slug,
          title: posts[currentIndex - 1].title,
        };
      }
      if (currentIndex < posts.length - 1) {
        nextPost = {
          slug: posts[currentIndex + 1].slug,
          title: posts[currentIndex + 1].title,
        };
      }
    }

    res.status(200).json({ success: true, data: { prevPost, nextPost } });
  } catch (error) {
    console.error('Error fetching post navigation:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}