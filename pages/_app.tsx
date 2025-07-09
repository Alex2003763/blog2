import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <SettingsProvider>
        <AppHead />
        <main className={inter.className}>
          <Component {...pageProps} />
        </main>
      </SettingsProvider>
    </ThemeProvider>
  );
}