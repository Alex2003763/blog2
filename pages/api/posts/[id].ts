import { NextApiRequest, NextApiResponse } from 'next';
import { dynamoDBService } from '../../../lib/dynamodb';
import { AuthService } from '../../../lib/auth';
import { createApiResponse, slugify, generateExcerpt } from '../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createApiResponse(false, null, 'Invalid post ID'));
    }

    // Sanitize the ID to remove trailing slashes
    if (id.endsWith('/')) {
      id = id.slice(0, -1);
    }

    switch (req.method) {
      case 'GET':
        return await handleGetPost(req, res, id);
      case 'PUT':
        return await handleUpdatePost(req, res, id);
      case 'DELETE':
        return await handleDeletePost(req, res, id);
      case 'POST':
        return await handleIncrementView(req, res, id);
      default:
        return res.status(405).json(createApiResponse(false, null, 'Method not allowed'));
    }
  } catch (error) {
    console.error('Post API error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Internal server error'));
  }
}

async function handleGetPost(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const post = await dynamoDBService.getPostById(id);
    
    if (!post) {
      return res.status(404).json(createApiResponse(false, null, 'Post not found'));
    }

    // 如果文章未發佈，只有管理員可以查看
    if (!post.published) {
      const authPayload = await AuthService.requireAuth(req, res);
      if (!authPayload) return; // 認證失敗，requireAuth 已經處理回應
    }

    return res.status(200).json(createApiResponse(true, post));
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Failed to fetch post'));
  }
}

async function handleUpdatePost(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // 只有管理員可以更新文章
    const authPayload = await AuthService.requireAuth(req, res);
    if (!authPayload) return; // 認證失敗，requireAuth 已經處理回應

    const postToUpdate = await dynamoDBService.getPostById(id);
    if (!postToUpdate) {
      return res.status(404).json(createApiResponse(false, null, 'Post not found'));
    }

    const { title, content, published } = req.body;

    if (!title && !content && published === undefined) {
      return res.status(400).json(createApiResponse(false, null, 'At least one field to update must be provided'));
    }

    const updates: any = {};
    
    if (title) {
      updates.title = title;
      updates.slug = slugify(title);
    }
    
    if (content) {
      updates.content = content;
      updates.excerpt = generateExcerpt(content);
    }
    
    if (published !== undefined) {
      updates.published = published;
    }

    const updatedPost = await dynamoDBService.updatePost(id, postToUpdate.created_at, updates);
    
    if (!updatedPost) {
      return res.status(404).json(createApiResponse(false, null, 'Post not found or update failed'));
    }

    return res.status(200).json(createApiResponse(true, updatedPost));
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Failed to update post'));
  }
}

async function handleDeletePost(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // 只有管理員可以刪除文章
    const authPayload = await AuthService.requireAuth(req, res);
    if (!authPayload) return; // 認證失敗，requireAuth 已經處理回應

    const postToDelete = await dynamoDBService.getPostById(id);
    if (!postToDelete) {
      return res.status(404).json(createApiResponse(false, null, 'Post not found'));
    }

    const success = await dynamoDBService.deletePost(id, postToDelete.created_at);
    
    if (!success) {
      return res.status(404).json(createApiResponse(false, null, 'Post not found or delete failed'));
    }

    return res.status(200).json(createApiResponse(true, { message: 'Post deleted successfully' }));
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Failed to delete post'));
  }
}

async function handleIncrementView(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const post = await dynamoDBService.getPostById(id);
    if (!post) {
      return res.status(404).json(createApiResponse(false, null, 'Post not found'));
    }

    await dynamoDBService.incrementPostViews(id, post.created_at);
    return res.status(200).json(createApiResponse(true, { message: 'View count incremented' }));
  } catch (error) {
    console.error('Increment view count error:', error);
    // Non-critical error, so we can return a success response to the client
    return res.status(200).json(createApiResponse(true, { message: 'View count increment failed silently' }));
  }
}