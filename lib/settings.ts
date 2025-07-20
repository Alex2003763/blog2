import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.NETLIFY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || "",
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
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
  siteName: '我的部落格',
  siteDescription: '一個用 Next.js 打造的現代部落格平台',
  siteUrl: 'https://myblog.com',
  adminEmail: 'admin@myblog.com',
  favicon: '/logo.svg',
  twitterHandle: '',
  socialLinks: {
    twitter: '',
    facebook: '',
    instagram: '',
    github: ''
  },
  seo: {
    metaTitle: '我的部落格 - 最新文章與動態',
    metaDescription: '從我們的部落格獲取最新文章與見解',
    keywords: '部落格, 科技, 程式設計, 網站開發'
  },
  content: {
    postsPerPage: 10,
    showExcerpts: true,
    showAuthor: true,
    showDate: true,
    showReadTime: true
  },
  footer: {
    copyrightText: '© 2024 我的部落格. 保留所有權利.',
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

      const result = await dynamodb.send(new GetCommand(params));
      
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

      const result = await dynamodb.send(new GetCommand(params));
      
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

      await dynamodb.send(new PutCommand(params));
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

      await dynamodb.send(new PutCommand(params));
      return true;
    } catch (error) {
      console.error('Error updating site settings:', error);
      return false;
    }
  }
}