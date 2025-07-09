import { NextApiRequest, NextApiResponse } from 'next';
import { dynamoDBService } from '../../../lib/dynamodb';
import { AuthService } from '../../../lib/auth';
import { createApiResponse, slugify, generateExcerpt } from '../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json(createApiResponse(false, null, '無效的文章 ID'));
    }

    switch (req.method) {
      case 'GET':
        return await handleGetPost(req, res, id);
      case 'PUT':
        return await handleUpdatePost(req, res, id);
      case 'DELETE':
        return await handleDeletePost(req, res, id);
      default:
        return res.status(405).json(createApiResponse(false, null, '方法不允許'));
    }
  } catch (error) {
    console.error('Post API error:', error);
    return res.status(500).json(createApiResponse(false, null, '伺服器錯誤'));
  }
}

async function handleGetPost(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const post = await dynamoDBService.getPostById(id);
    
    if (!post) {
      return res.status(404).json(createApiResponse(false, null, '文章不存在'));
    }

    // 如果文章未發佈，只有管理員可以查看
    if (!post.published) {
      const authPayload = await AuthService.requireAuth(req, res);
      if (!authPayload) return; // 認證失敗，requireAuth 已經處理回應
    }

    return res.status(200).json(createApiResponse(true, post));
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json(createApiResponse(false, null, '獲取文章失敗'));
  }
}

async function handleUpdatePost(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // 只有管理員可以更新文章
    const authPayload = await AuthService.requireAuth(req, res);
    if (!authPayload) return; // 認證失敗，requireAuth 已經處理回應

    const postToUpdate = await dynamoDBService.getPostById(id);
    if (!postToUpdate) {
      return res.status(404).json(createApiResponse(false, null, '文章不存在'));
    }

    const { title, content, published } = req.body;

    if (!title && !content && published === undefined) {
      return res.status(400).json(createApiResponse(false, null, '至少需要提供一個更新字段'));
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
      return res.status(404).json(createApiResponse(false, null, '文章不存在或更新失敗'));
    }

    return res.status(200).json(createApiResponse(true, updatedPost));
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json(createApiResponse(false, null, '更新文章失敗'));
  }
}

async function handleDeletePost(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // 只有管理員可以刪除文章
    const authPayload = await AuthService.requireAuth(req, res);
    if (!authPayload) return; // 認證失敗，requireAuth 已經處理回應

    const postToDelete = await dynamoDBService.getPostById(id);
    if (!postToDelete) {
      return res.status(404).json(createApiResponse(false, null, '文章不存在'));
    }

    const success = await dynamoDBService.deletePost(id, postToDelete.created_at);
    
    if (!success) {
      return res.status(404).json(createApiResponse(false, null, '文章不存在或刪除失敗'));
    }

    return res.status(200).json(createApiResponse(true, { message: '文章已刪除' }));
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json(createApiResponse(false, null, '刪除文章失敗'));
  }
}