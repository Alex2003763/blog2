import React from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { SunIcon, MoonIcon, HomeIcon, BookOpenIcon } from './icons';
import { useSettings } from '../contexts/SettingsContext';

interface HeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
  showAdminLink?: boolean;
}

export default function Header({
  showBackButton = false,
  backHref = '/',
  backText = 'Back to Home',
  showAdminLink = false
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { siteSettings, loading } = useSettings();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center min-w-0">
            <Link href="/" className="group flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-shadow" style={{ background: `linear-gradient(135deg, var(--primary-color), var(--accent-color))` }}>
                {loading ? (
                  <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <img src={siteSettings.favicon} alt="Favicon" className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent truncate">
                  {loading ? 'Blog Platform' : siteSettings.siteName}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {loading ? 'Share your stories' : siteSettings.siteDescription}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Section */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {showBackButton && (
              <Link
                href={backHref}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{backText}</span>
              </Link>
            )}

            {showAdminLink && (
              <Link
                href="/admin"
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="hidden sm:inline">Admin Dashboard</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}