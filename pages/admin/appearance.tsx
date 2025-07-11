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

  if (loading) {
    return (
      <AdminLayout title="Appearance">
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full border-primary animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading appearance settings...</p>
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
            <div className="border rounded-lg shadow-sm bg-card border-border">
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center">
                  <SunIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground">Theme Settings</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-foreground">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        settings.theme === 'light'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <SunIcon className="w-6 h-6 text-yellow-500" />
                      <span className="text-sm font-medium text-foreground">Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        settings.theme === 'dark'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <MoonIcon className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium text-foreground">Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, theme: 'system' }))}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        settings.theme === 'system'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <ComputerDesktopIcon className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">System</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="border rounded-lg shadow-sm bg-card border-border">
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center">
                  <PaintBrushIcon className="w-5 h-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground">Typography</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="fontFamily" className="block text-sm font-medium text-foreground">
                      Font Family
                    </label>
                    <select
                      id="fontFamily"
                      name="fontFamily"
                      value={settings.fontFamily}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 rounded-md shadow-sm bg-background border-border text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      {fontOptions.map((font) => (
                        <option key={font.name} value={font.value}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fontSize" className="block text-sm font-medium text-foreground">
                      Font Size
                    </label>
                    <select
                      id="fontSize"
                      name="fontSize"
                      value={settings.fontSize}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 rounded-md shadow-sm bg-background border-border text-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom CSS */}
            <div className="border rounded-lg shadow-sm bg-card border-border">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-medium text-foreground">Custom CSS</h3>
              </div>
              <div className="p-6">
                <textarea
                  name="customCSS"
                  rows={10}
                  value={settings.customCSS}
                  onChange={handleInputChange}
                  placeholder="Add your custom CSS here..."
                  className="block w-full px-3 py-2 font-mono rounded-md shadow-sm bg-background border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
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
                {saving ? 'Saving...' : 'Save Appearance'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}