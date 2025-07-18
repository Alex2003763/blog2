import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  CogIcon, 
  GlobeAltIcon, 
  EnvelopeIcon, 
  LinkIcon,
  PhotoIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface SiteSettings {
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

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings>({
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
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      }
      // If settings API doesn't exist, use default values
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('設定已成功更新！');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || '更新設定失敗');
      }
    } catch (err) {
      setError('網路錯誤');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof SiteSettings] as any),
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  if (loading) {
    return (
      <AdminLayout title="設定">
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-muted-foreground">正在載入設定...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>設定 - 管理後台</title>
        <meta name="description" content="配置網站設定" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title="網站設定">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Settings */}
            <div className="border rounded-lg shadow-sm bg-card border-border">
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center">
                  <CogIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground">一般設定</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-foreground">
                      網站名稱
                    </label>
                    <input
                      type="text"
                      id="siteName"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label htmlFor="siteUrl" className="block text-sm font-medium text-foreground">
                      網站網址
                    </label>
                    <input
                      type="url"
                      id="siteUrl"
                      name="siteUrl"
                      value={settings.siteUrl}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-foreground">
                    網站描述
                  </label>
                  <textarea
                    id="siteDescription"
                    name="siteDescription"
                    rows={3}
                    value={settings.siteDescription}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-foreground">
                    管理員電子郵件
                  </label>
                  <input
                    type="email"
                    id="adminEmail"
                    name="adminEmail"
                    value={settings.adminEmail}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="favicon" className="block text-sm font-medium text-foreground">
                    網站圖示 (Favicon)
                  </label>
                  <input
                    type="text"
                    id="favicon"
                    name="favicon"
                    placeholder="/favicon.ico"
                    value={settings.favicon}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    請輸入您的網站圖示路徑，例如：/favicon.ico 或 https://example.com/icon.png
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="border rounded-lg shadow-sm bg-card border-border">
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center">
                  <GlobeAltIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground">SEO 設定</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="seo.metaTitle" className="block text-sm font-medium text-foreground">
                    Meta 標題
                  </label>
                  <input
                    type="text"
                    id="seo.metaTitle"
                    name="seo.metaTitle"
                    value={settings.seo.metaTitle}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="seo.metaDescription" className="block text-sm font-medium text-foreground">
                    Meta 描述
                  </label>
                  <textarea
                    id="seo.metaDescription"
                    name="seo.metaDescription"
                    rows={3}
                    value={settings.seo.metaDescription}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="seo.keywords" className="block text-sm font-medium text-foreground">
                    關鍵字 (以逗號分隔)
                  </label>
                  <input
                    type="text"
                    id="seo.keywords"
                    name="seo.keywords"
                    value={settings.seo.keywords}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="border rounded-lg shadow-sm bg-card border-border">
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center">
                  <LinkIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground">社群連結</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-foreground">
                      Twitter
                    </label>
                    <input
                      type="url"
                      id="socialLinks.twitter"
                      name="socialLinks.twitter"
                      value={settings.socialLinks.twitter}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-foreground">
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="socialLinks.facebook"
                      name="socialLinks.facebook"
                      value={settings.socialLinks.facebook}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-foreground">
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="socialLinks.instagram"
                      name="socialLinks.instagram"
                      value={settings.socialLinks.instagram}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label htmlFor="socialLinks.github" className="block text-sm font-medium text-foreground">
                      GitHub
                    </label>
                    <input
                      type="url"
                      id="socialLinks.github"
                      name="socialLinks.github"
                      value={settings.socialLinks.github}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* Messages */}
            {error && (
              <div className="px-4 py-3 border rounded-md text-destructive-foreground bg-destructive/10 border-destructive/20">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="px-4 py-3 text-green-700 border rounded-md bg-green-500/10 border-green-500/20">
                {successMessage}
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end pt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 transition-opacity rounded-md text-primary-foreground bg-primary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '儲存中...' : '儲存設定'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}