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
  
  const metaTitle = siteSettings.seo.metaTitle || siteSettings.siteName;
  const metaDescription = siteSettings.siteDescription;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return (
    <Head>
      <title>{metaTitle}</title>
      <link rel="icon" href={siteSettings.favicon || '/favicon.ico'} />
      <meta name="description" content={metaDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={`${siteUrl}/og-image.png`} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
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