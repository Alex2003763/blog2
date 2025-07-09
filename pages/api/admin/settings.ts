import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../../lib/auth';
import { SettingsService } from '../../../lib/settings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 檢查認證
    const authPayload = await AuthService.requireAuth(req, res);
    if (!authPayload) {
      return; // AuthService 已處理錯誤響應
    }

    if (req.method === 'GET') {
      // 獲取網站設定
      try {
        const settings = await SettingsService.getSiteSettings();
        res.status(200).json({
          success: true,
          data: settings
        });
      } catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch site settings'
        });
      }
    } else if (req.method === 'PUT') {
      // 更新網站設定
      try {
        const settings = req.body;
        
        // 驗證設定數據
        if (!settings || typeof settings !== 'object') {
          return res.status(400).json({
            success: false,
            error: 'Invalid settings data'
          });
        }

        // 基本驗證
        if (!settings.siteName || !settings.siteDescription || !settings.adminEmail) {
          return res.status(400).json({
            success: false,
            error: 'Required fields are missing'
          });
        }

        // 驗證 email 格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(settings.adminEmail)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid email format'
          });
        }

        const success = await SettingsService.updateSiteSettings(settings);
        
        if (success) {
          res.status(200).json({
            success: true,
            message: 'Site settings updated successfully'
          });
        } else {
          res.status(500).json({
            success: false,
            error: 'Failed to update site settings'
          });
        }
      } catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update site settings'
        });
      }
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({
        success: false,
        error: `Method ${req.method} Not Allowed`
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}