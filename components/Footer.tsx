import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Logo and Description */}
          <div className="text-center sm:text-left">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Blog Platform
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by Next.js & DynamoDB
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/admin"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Admin
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline text-gray-400 dark:text-gray-600">|</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                &copy; 2024 Blog Platform
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}