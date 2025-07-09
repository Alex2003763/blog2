import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppearanceSettings, SiteSettings, defaultAppearanceSettings, defaultSiteSettings } from '../lib/settings';

interface SettingsContextType {
  siteSettings: SiteSettings;
  appearanceSettings: AppearanceSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(defaultAppearanceSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        setSiteSettings(data.data.site);
        setAppearanceSettings(data.data.appearance);
      } else {
        setError('Failed to load settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 應用外觀設定到 CSS 變數
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      const root = document.documentElement;
      
      // 設定主色調
      root.style.setProperty('--primary-color', appearanceSettings.primaryColor);
      root.style.setProperty('--accent-color', appearanceSettings.accentColor);
      
      // 設定字體
      root.style.setProperty('--font-family', appearanceSettings.fontFamily);
      
      // 設定字體大小
      const fontSizeMap = {
        small: '0.875rem',
        medium: '1rem',
        large: '1.125rem'
      };
      root.style.setProperty('--base-font-size', fontSizeMap[appearanceSettings.fontSize]);
      
      // 應用自定義 CSS
      if (appearanceSettings.customCSS) {
        let customStyleElement = document.getElementById('custom-styles');
        if (!customStyleElement) {
          customStyleElement = document.createElement('style');
          customStyleElement.id = 'custom-styles';
          document.head.appendChild(customStyleElement);
        }
        customStyleElement.textContent = appearanceSettings.customCSS;
      }
    }
  }, [appearanceSettings, loading]);

  // 更新頁面標題、favicon 和 meta 標籤
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      // 更新頁面標題
      document.title = siteSettings.seo.metaTitle || siteSettings.siteName;
      
      // 更新 favicon
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = siteSettings.favicon || '/favicon.ico';
      
      // 更新 meta 描述
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', siteSettings.seo.metaDescription || siteSettings.siteDescription);
      
      // 更新 keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', siteSettings.seo.keywords);
    }
  }, [siteSettings, loading]);

  const value: SettingsContextType = {
    siteSettings,
    appearanceSettings,
    loading,
    error,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};