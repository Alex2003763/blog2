import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic'; // Import dynamic
import { SunIcon, MoonIcon, HomeIcon, BookOpenIcon, GlobeIcon } from './icons';
import { useSettings } from '../contexts/SettingsContext';

const GoogleTranslateWidget = dynamic(
  () => import('./GoogleTranslateWidget').then(mod => mod.GoogleTranslateWidget),
  { ssr: false }
);

interface HeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
  onBackClick?: () => void;
  showAdminLink?: boolean;
}

export default function Header({
  showBackButton = false,
  backHref = '/',
  backText = '返回首頁',
  onBackClick,
  showAdminLink = false
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { siteSettings, loading } = useSettings();
  const [showTranslate, setShowTranslate] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Logo Section */}
        <div className="flex items-center min-w-0">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
              {loading ? (
                <BookOpenIcon className="w-5 h-5" />
              ) : (
                <Image src={siteSettings.favicon} alt="Favicon" className="w-5 h-5" width={20} height={20} />
              )}
            </div>
            <div className="hidden min-w-0 sm:block">
              <h1 className="text-lg font-semibold truncate text-foreground">
                {loading ? '部落格平台' : siteSettings.siteName}
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex items-center space-x-2">
          {showBackButton && (
            <>
              {onBackClick ? (
                <button
                  onClick={onBackClick}
                  className="flex items-center px-3 py-2 space-x-2 text-sm font-medium transition-colors rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <HomeIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{backText}</span>
                </button>
              ) : (
                <Link
                  href={backHref}
                  className="flex items-center px-3 py-2 space-x-2 text-sm font-medium transition-colors rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <HomeIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{backText}</span>
                </Link>
              )}
            </>
          )}

          {showAdminLink && (
            <Link
              href="/admin"
              className="flex items-center px-3 py-2 space-x-2 text-sm font-medium transition-colors rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <span className="hidden sm:inline">管理</span>
              <span className="sm:hidden">管理</span>
            </Link>
          )}

          <div className="items-center hidden mr-2 sm:flex">
            <GoogleTranslateWidget />
          </div>

          <div className="flex items-center space-x-1">
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowTranslate(!showTranslate)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <GlobeIcon className="w-5 h-5" />
              </button>
              {showTranslate && (
                <div className="absolute right-0 w-48 mt-2 border rounded-md shadow-lg bg-background">
                  <GoogleTranslateWidget />
                </div>
              )}
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative p-2 transition-colors rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
              aria-label="Toggle theme"
            >
              <SunIcon className="w-5 h-5 transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute w-5 h-5 transition-all scale-0 rotate-90 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 dark:rotate-0 dark:scale-100" />
              <span className="sr-only">切換主題</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}