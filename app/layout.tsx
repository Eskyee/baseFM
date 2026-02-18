import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { OnchainProvider } from '@/components/providers/OnchainProvider';
import { AppShell } from '@/components/AppShell';
import { SplashScreen } from '@/components/SplashScreen';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { GlobalPlayer } from '@/components/GlobalPlayer';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://basefm.space'),
  title: 'baseFM - Onchain Radio on Base',
  description: 'Underground radio, events, tickets, services and bookings — all onchain. Direct to your wallet, no third parties, fully decentralised.',
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
    description: 'Underground radio, events, tickets, services and bookings — all onchain. Direct to your wallet, no third parties, fully decentralised.',
    url: 'https://basefm.space',
    siteName: 'baseFM',
    images: [
      {
        url: 'https://basefm.space/og-image.png',
        width: 1200,
        height: 630,
        alt: 'baseFM - Onchain Radio on Base',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'baseFM - Onchain Radio on Base',
    description: 'Underground radio, events, tickets, services and bookings — all onchain. Direct to your wallet, no third parties, fully decentralised.',
    images: ['https://basefm.space/og-image.png'],
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
        <meta property="fc:frame:image" content="https://basefm.space/og-image.png" />
        <meta property="fc:frame:button:1" content="Listen Live 📻" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://basefm.space" />
      </head>
      <body className={`${inter.className} bg-[#0A0A0A] min-h-screen`}>
        <OnchainProvider>
          <PlayerProvider>
            <SplashScreen>
              <AppShell>{children}</AppShell>
              <GlobalPlayer />
            </SplashScreen>
          </PlayerProvider>
        </OnchainProvider>
        <SpeedInsights />
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
