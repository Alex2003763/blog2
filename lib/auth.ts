import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

export interface AuthTokenPayload {
  username: string;
  isAdmin: boolean;
}

export class AuthService {
  static async validateCredentials(username: string, password: string): Promise<boolean> {
    try {
      // 簡易認證：檢查環境變數中的管理員憑證
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return false;
    }
  }

  static generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  static verifyToken(token: string): AuthTokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  static extractTokenFromRequest(req: NextApiRequest): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    
    // 也可以從 cookie 中取得 token
    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('auth_token='));
      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
    }
    
    return null;
  }

  static async requireAuth(req: NextApiRequest, res: NextApiResponse): Promise<AuthTokenPayload | null> {
    const token = this.extractTokenFromRequest(req);
    
    if (!token) {
      res.status(401).json({ error: '需要認證' });
      return null;
    }

    const payload = this.verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: '無效的認證令牌' });
      return null;
    }

    if (!payload.isAdmin) {
      res.status(403).json({ error: '需要管理員權限' });
      return null;
    }

    return payload;
  }
}

export const authService = new AuthService();