import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  PaintBrushIcon, 
  SwatchIcon, 
  SunIcon, 
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

interface AppearanceSettings {
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

const colorPresets = [
  { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Purple', value: '#8B5CF6', class: 'bg-purple-500' },
  { name: 'Green', value: '#10B981', class: 'bg-green-500' },
  { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Orange', value: '#F97316', class: 'bg-orange-500' },
  { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
  { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
  { name: 'Teal', value: '#14B8A6', class: 'bg-teal-500' },
];

const fontOptions = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
];

export default function AppearancePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppearanceSettings>({
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
    
    fetchAppearanceSettings();
  }, [router]);

  const fetchAppearanceSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/admin/appearance', {
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
      // If appearance API doesn't exist, use default values
    } catch (err) {
      console.error('Error fetching appearance settings:', err);
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
      
      const response = await fetch('/api/admin/appearance', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Appearance settings updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Apply theme change immediately
        if (settings.theme !== 'system') {
          setTheme(settings.theme);
        }
      } else {
        setError(data.error || 'Failed to update appearance settings');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof AppearanceSettings] as any),
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

  const handleColorSelect = (colorType: 'primaryColor' | 'accentColor', color: string) => {
    setSettings(prev => ({
      ...prev,
      [colorType]: color
    }));
  };

  if (loading) {
    return (
      <AdminLayout title="Appearance">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading appearance settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Appearance - Admin</title>
        <meta name="description" content="Customize site appearance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <AdminLayout title="Appearance">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Theme Settings */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <SunIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme Settings</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 ${
                        settings.theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <SunIcon className="h-6 w-6 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 ${
                        settings.theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <MoonIcon className="h-6 w-6 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, theme: 'system' }))}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 ${
                        settings.theme === 'system'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <ComputerDesktopIcon className="h-6 w-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Settings */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <SwatchIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Color Settings</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Primary Color
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {colorPresets.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => handleColorSelect('primaryColor', color.value)}
                        className={`w-12 h-12 rounded-lg ${color.class} border-2 ${
                          settings.primaryColor === color.value
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-gray-300 dark:border-gray-600'
                        } transition-all`}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleColorSelect('primaryColor', e.target.value)}
                      className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Accent Color
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {colorPresets.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => handleColorSelect('accentColor', color.value)}
                        className={`w-12 h-12 rounded-lg ${color.class} border-2 ${
                          settings.accentColor === color.value
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-gray-300 dark:border-gray-600'
                        } transition-all`}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleColorSelect('accentColor', e.target.value)}
                      className="w-16 h-8 rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <PaintBrushIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Typography</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Font Family
                    </label>
                    <select
                      id="fontFamily"
                      name="fontFamily"
                      value={settings.fontFamily}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {fontOptions.map((font) => (
                        <option key={font.name} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Font Size
                    </label>
                    <select
                      id="fontSize"
                      name="fontSize"
                      value={settings.fontSize}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Settings */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <ComputerDesktopIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Layout Settings</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="layout.headerStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Header Style
                    </label>
                    <select
                      id="layout.headerStyle"
                      name="layout.headerStyle"
                      value={settings.layout.headerStyle}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="simple">Simple</option>
                      <option value="centered">Centered</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="layout.footerStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Footer Style
                    </label>
                    <select
                      id="layout.footerStyle"
                      name="layout.footerStyle"
                      value={settings.layout.footerStyle}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="simple">Simple</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom CSS */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Custom CSS</h3>
              </div>
              <div className="p-6">
                <textarea
                  name="customCSS"
                  rows={10}
                  value={settings.customCSS}
                  onChange={handleInputChange}
                  placeholder="Add your custom CSS here..."
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                />
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
                {saving ? 'Saving...' : 'Save Appearance'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}