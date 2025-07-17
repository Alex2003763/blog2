import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import { PostProvider } from '../lib/PostContext';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

// This component now fetches settings and updates the document head.
function AppHead() {
  const { siteSettings, loading } = useSettings();
  
  if (loading) return null;
  
  return (
    <Head>
      <title>{siteSettings.seo.metaTitle || siteSettings.siteName}</title>
      <link rel="icon" href={siteSettings.favicon || '/favicon.ico'} />
      <meta name="description" content={siteSettings.siteDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}

import { useRouter } from 'next/router';

// A new wrapper component for all providers.
function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <ThemeProvider attribute="class">
      <SettingsProvider>
        {isAdminPage ? (
          children
        ) : (
          <PostProvider>
            {children}
          </PostProvider>
        )}
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <AppHead />
      <main className={inter.className}>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
        <Component {...pageProps} />
      </main>
    </Providers>
  );
}