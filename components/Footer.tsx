import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container px-4 py-6 mx-auto">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Blog Platform. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-sm transition-colors text-muted-foreground hover:text-foreground hover:underline">
              Home
            </Link>
            <Link href="/admin" className="text-sm transition-colors text-muted-foreground hover:text-foreground hover:underline">
              Admin
            </Link>
            <Link href="/privacy" className="text-sm transition-colors text-muted-foreground hover:text-foreground hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}