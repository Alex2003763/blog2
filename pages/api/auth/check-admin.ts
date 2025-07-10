import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../lib/auth';
import { createApiResponse } from '../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json(createApiResponse(false, null, 'Method Not Allowed'));
  }

  try {
    const token = AuthService.extractTokenFromRequest(req);
    const payload = AuthService.verifyToken(token);

    if (payload && payload.isAdmin) {
      return res.status(200).json(createApiResponse(true, { isAdmin: true }));
    }
    
    return res.status(200).json(createApiResponse(true, { isAdmin: false }));
  } catch (error) {
    console.error('Check admin API error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Internal Server Error'));
  }
}