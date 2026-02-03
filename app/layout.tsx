import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { OnchainProvider } from '@/components/providers/OnchainProvider';
import { AppShell } from '@/components/AppShell';
import { SplashScreen } from '@/components/SplashScreen';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'baseFM - Onchain Radio on Base',
  description: 'Base-native, token-gated streaming radio platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'baseFM',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'base:app_id': '697ce5a2c0622780c63f66b9',
  },
  openGraph: {
    title: 'baseFM - Onchain Radio on Base',
    description: 'Base-native, token-gated streaming radio platform',
    url: 'https://base-fm.vercel.app',
    siteName: 'baseFM',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'baseFM - Onchain Radio on Base',
    description: 'Base-native, token-gated streaming radio platform',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        {/* Farcaster Frame Meta Tags */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://basefm.vercel.app/og-image.png" />
        <meta property="fc:frame:button:1" content="Listen Live 📻" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://basefm.vercel.app" />
      </head>
      <body className={`${inter.className} bg-[#0A0A0A] min-h-screen`}>
        <OnchainProvider>
          <SplashScreen>
            <AppShell>{children}</AppShell>
          </SplashScreen>
        </OnchainProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
