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
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to update settings');
      }
    } catch (err) {
      setError('Network error');
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
      <AdminLayout title="Settings">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Settings - Admin</title>
        <meta name="description" content="Configure site settings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title="Site Settings">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Settings */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <CogIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Name
                    </label>
                    <input
                      type="text"
                      id="siteName"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site URL
                    </label>
                    <input
                      type="url"
                      id="siteUrl"
                      name="siteUrl"
                      value={settings.siteUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Site Description
                  </label>
                  <textarea
                    id="siteDescription"
                    name="siteDescription"
                    rows={3}
                    value={settings.siteDescription}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    id="adminEmail"
                    name="adminEmail"
                    value={settings.adminEmail}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="favicon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Website Icon (Favicon)
                  </label>
                  <input
                    type="text"
                    id="favicon"
                    name="favicon"
                    placeholder="/favicon.ico"
                    value={settings.favicon}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter the path to your favicon, e.g.: /favicon.ico or https://example.com/icon.png
                  </p>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <GlobeAltIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">SEO Settings</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="seo.metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="seo.metaTitle"
                    name="seo.metaTitle"
                    value={settings.seo.metaTitle}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="seo.metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Description
                  </label>
                  <textarea
                    id="seo.metaDescription"
                    name="seo.metaDescription"
                    rows={3}
                    value={settings.seo.metaDescription}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="seo.keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    id="seo.keywords"
                    name="seo.keywords"
                    value={settings.seo.keywords}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <LinkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Social Links</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Twitter
                    </label>
                    <input
                      type="url"
                      id="socialLinks.twitter"
                      name="socialLinks.twitter"
                      value={settings.socialLinks.twitter}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="socialLinks.facebook"
                      name="socialLinks.facebook"
                      value={settings.socialLinks.facebook}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="socialLinks.instagram"
                      name="socialLinks.instagram"
                      value={settings.socialLinks.instagram}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="socialLinks.github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      GitHub
                    </label>
                    <input
                      type="url"
                      id="socialLinks.github"
                      name="socialLinks.github"
                      value={settings.socialLinks.github}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* Messages */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">
                {successMessage}
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end pt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}