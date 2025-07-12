import React from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { SunIcon, MoonIcon, HomeIcon, BookOpenIcon } from './icons';
import { useSettings } from '../contexts/SettingsContext';

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
  backText = 'Back to Home',
  onBackClick,
  showAdminLink = false
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { siteSettings, loading } = useSettings();

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
                <img src={siteSettings.favicon} alt="Favicon" className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate text-foreground">
                {loading ? 'Blog Platform' : siteSettings.siteName}
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
              <span className="hidden sm:inline">Admin</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative p-2 transition-colors rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label="Toggle theme"
          >
            <SunIcon className="w-5 h-5 transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute w-5 h-5 transition-all scale-0 rotate-90 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>
        </nav>
      </div>
    </header>
  );
}