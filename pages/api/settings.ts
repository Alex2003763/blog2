import { NextApiRequest, NextApiResponse } from 'next';
import { SettingsService } from '../../lib/settings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const [siteSettings, appearanceSettings] = await Promise.all([
        SettingsService.getSiteSettings(),
        SettingsService.getAppearanceSettings()
      ]);

      res.status(200).json({
        success: true,
        data: {
          site: siteSettings,
          appearance: appearanceSettings
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch settings'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }
}