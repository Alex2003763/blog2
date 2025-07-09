import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService, AuthTokenPayload } from '../../../lib/auth';
import { createApiResponse } from '../../../lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json(createApiResponse(false, null, 'Method not allowed'));
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(createApiResponse(false, null, 'Username and password are required fields'));
    }

    const isValid = await AuthService.validateCredentials(username, password);
    
    if (!isValid) {
      return res.status(401).json(createApiResponse(false, null, 'Username or password incorrect'));
    }

    const payload: AuthTokenPayload = {
      username,
      isAdmin: true,
    };

    const token = AuthService.generateToken(payload);

    // 設置 HTTP-only cookie
    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);

    return res.status(200).json(createApiResponse(true, {
      token,
      user: {
        username,
        isAdmin: true,
      },
    }));
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json(createApiResponse(false, null, 'Server error'));
  }
}