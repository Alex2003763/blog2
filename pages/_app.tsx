import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import '../styles/globals.css';
import { useEffect, useState } from 'react';
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

// A new wrapper component for all providers.
// This ensures that providers using React context are only rendered on the client-side.
function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Return null on the server to avoid the error
    return null;
  }

  return (
    <ThemeProvider attribute="class">
      <SettingsProvider>
        {children}
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