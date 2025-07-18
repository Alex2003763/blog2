import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container px-4 py-6 mx-auto">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} 部落格平台. 保留所有權利.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-sm transition-colors text-muted-foreground hover:text-foreground hover:underline">
              首頁
            </Link>
            <Link href="/admin" className="text-sm transition-colors text-muted-foreground hover:text-foreground hover:underline">
              管理
            </Link>
            <Link href="/privacy" className="text-sm transition-colors text-muted-foreground hover:text-foreground hover:underline">
              隱私權政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}