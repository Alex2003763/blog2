import { NextApiRequest, NextApiResponse } from 'next';
import { dynamoDBService } from '../../../lib/dynamodb';
import { AuthService } from '../../../lib/auth';
import { createApiResponse } from '../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetPosts(req, res);
      case 'POST':
        return await handleCreatePost(req, res);
      default:
        return res.status(405).json(createApiResponse(false, null, 'Method Not Allowed'));
    }
  } catch (error) {
    console.error('Posts API error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Internal Server Error'));
  }
}

async function handleGetPosts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { admin, page = '1', limit = '6', q } = req.query;
    const currentPage = parseInt(page as string, 10);
    const postsPerPage = parseInt(limit as string, 10);

    let allPosts;
    if (q) {
      // If a search query is provided, use the searchPosts method
      allPosts = await dynamoDBService.searchPosts(q as string, admin !== 'true');
    } else if (admin === 'true') {
      const authPayload = await AuthService.requireAuth(req, res);
      if (!authPayload) return;
      allPosts = await dynamoDBService.getAllPosts();
    } else {
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      allPosts = await dynamoDBService.getPublishedPosts();
    }

    allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const postsForPage = allPosts.slice(startIndex, startIndex + postsPerPage);

    const responseData = {
      posts: postsForPage,
      pagination: {
        currentPage,
        totalPages,
        totalPosts,
      },
    };

    return res.status(200).json(createApiResponse(true, responseData));
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Failed to fetch posts'));
  }
}

async function handleCreatePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only admins can create posts
    const authPayload = await AuthService.requireAuth(req, res);
    if (!authPayload) return; // Auth failed, requireAuth handled the response

    const { title, content, published = false } = req.body;

    if (!title || !content) {
      return res.status(400).json(createApiResponse(false, null, 'Title and content are required'));
    }

    const { slugify, generateExcerpt } = await import('../../../lib/utils');
    const slug = slugify(title);
    const excerpt = generateExcerpt(content);

    const newPost = await dynamoDBService.createPost({
      title,
      slug,
      content,
      excerpt,
      author: authPayload.username,
      published,
    });

    return res.status(201).json(createApiResponse(true, newPost));
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Failed to create post'));
  }
}