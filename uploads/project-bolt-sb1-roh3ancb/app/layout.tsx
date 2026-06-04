import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClientProviders } from '@/components/ClientProviders';

// Inline script: reads localStorage before React hydrates so I18nProvider
// can initialize with the correct locale, eliminating the English flash.
// Runs synchronously in <head> — safe because it never touches the DOM body.
const LOCALE_INIT_SCRIPT = `(function(){try{var k='earthos.locale';var v=localStorage.getItem(k);var valid=['en','fr','de','es','it','pt','id'];if(v&&valid.indexOf(v)!==-1){document.documentElement.dataset.locale=v;}}catch(e){}})();`;

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: {
    default: 'EarthOS QLPA Matrix — Canonical Source Base v1',
    template: '%s — EarthOS QLPA Matrix',
  },
  description: 'EarthOS QLPA Matrix Source Code Base — Canonical v1. Reusable foundation for EarthOS-aligned applications. Not a product app.',
  applicationName: 'EarthOS QLPA Matrix Source Base',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Pre-hydration locale: sets data-locale on <html> before React paint */}
        <script dangerouslySetInnerHTML={{ __html: LOCALE_INIT_SCRIPT }} />
        {/* Viewport — mobile-first, allow browser zoom (WCAG 2.1 AA) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Preload critical landing background — portrait (mobile-first) */}
        <link rel="preload" as="image" href="/earthos/bg/earth-space-mobile-941.webp" type="image/webp" />
        {/* Preload desktop background for landscape viewports */}
        <link rel="preload" as="image" href="/earthos/bg/earth-space-desktop-1672.webp" type="image/webp" media="(orientation: landscape)" />
        {/* Theme color */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#2d6a58" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)"  content="#1a3d30" />
        {/* PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EarthOS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2d6a58" />
        {/* Icons */}
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" sizes="180x180" />
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" type="image/png" />
      </head>
      <body className={`${inter.className} overscroll-none nature-skin`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
