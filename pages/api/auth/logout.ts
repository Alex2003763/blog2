import { NextApiRequest, NextApiResponse } from 'next';
import { createApiResponse } from '../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json(createApiResponse(false, null, '方法不允許'));
  }

  try {
    // 清除 cookie
    res.setHeader('Set-Cookie', `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`);

    return res.status(200).json(createApiResponse(true, { message: '登出成功' }));
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json(createApiResponse(false, null, '伺服器錯誤'));
  }
}