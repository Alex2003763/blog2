import AWS from 'aws-sdk';

// 配置 AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const SETTINGS_TABLE = process.env.SETTINGS_TABLE_NAME || 'blog_settings';

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  layout: {
    headerStyle: 'simple' | 'centered' | 'sidebar';
    showSidebar: boolean;
    sidebarPosition: 'left' | 'right';
    footerStyle: 'simple' | 'detailed';
  };
  customCSS: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  favicon: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    github: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  content: {
    postsPerPage: number;
    showExcerpts: boolean;
    showAuthor: boolean;
    showDate: boolean;
    showReadTime: boolean;
  };
  footer: {
    copyrightText: string;
    showSocialLinks: boolean;
  };
}

export const defaultAppearanceSettings: AppearanceSettings = {
  theme: 'system',
  primaryColor: '#3B82F6',
  accentColor: '#8B5CF6',
  fontFamily: 'Inter, sans-serif',
  fontSize: 'medium',
  layout: {
    headerStyle: 'simple',
    showSidebar: false,
    sidebarPosition: 'right',
    footerStyle: 'simple'
  },
  customCSS: ''
};

export const defaultSiteSettings: SiteSettings = {
  siteName: 'My Blog',
  siteDescription: 'A modern blog platform built with Next.js',
  siteUrl: 'https://myblog.com',
  adminEmail: 'admin@myblog.com',
  favicon: '/logo.svg',
  socialLinks: {
    twitter: '',
    facebook: '',
    instagram: '',
    github: ''
  },
  seo: {
    metaTitle: 'My Blog - Latest Posts and Updates',
    metaDescription: 'Stay updated with the latest posts and insights from our blog',
    keywords: 'blog, technology, programming, web development'
  },
  content: {
    postsPerPage: 10,
    showExcerpts: true,
    showAuthor: true,
    showDate: true,
    showReadTime: true
  },
  footer: {
    copyrightText: '© 2024 My Blog. All rights reserved.',
    showSocialLinks: true
  }
};

export class SettingsService {
  static async getAppearanceSettings(): Promise<AppearanceSettings> {
    try {
      const params = {
        TableName: SETTINGS_TABLE,
        Key: {
          id: 'appearance',
          type: 'appearance'
        }
      };

      const result = await dynamodb.get(params).promise();
      
      if (result.Item) {
        return result.Item.settings as AppearanceSettings;
      }
      
      return defaultAppearanceSettings;
    } catch (error) {
      console.error('Error fetching appearance settings:', error);
      return defaultAppearanceSettings;
    }
  }

  static async getSiteSettings(): Promise<SiteSettings> {
    try {
      const params = {
        TableName: SETTINGS_TABLE,
        Key: {
          id: 'site_settings',
          type: 'settings'
        }
      };

      const result = await dynamodb.get(params).promise();
      
      if (result.Item) {
        return result.Item.settings as SiteSettings;
      }
      
      return defaultSiteSettings;
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return defaultSiteSettings;
    }
  }

  static async updateAppearanceSettings(settings: AppearanceSettings): Promise<boolean> {
    try {
      const params = {
        TableName: SETTINGS_TABLE,
        Item: {
          id: 'appearance',
          type: 'appearance',
          settings: settings,
          updated_at: new Date().toISOString()
        }
      };

      await dynamodb.put(params).promise();
      return true;
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      return false;
    }
  }

  static async updateSiteSettings(settings: SiteSettings): Promise<boolean> {
    try {
      const params = {
        TableName: SETTINGS_TABLE,
        Item: {
          id: 'site_settings',
          type: 'settings',
          settings: settings,
          updated_at: new Date().toISOString()
        }
      };

      await dynamodb.put(params).promise();
      return true;
    } catch (error) {
      console.error('Error updating site settings:', error);
      return false;
    }
  }
}