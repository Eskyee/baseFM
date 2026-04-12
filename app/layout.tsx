import type { Metadata } from 'next';
import './globals.css';
import { OnchainProvider } from '@/components/providers/OnchainProvider';
import { AppShell } from '@/components/AppShell';
import { SplashScreen } from '@/components/SplashScreen';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { GlobalPlayer } from '@/components/GlobalPlayer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://basefm.space'),
  title: {
    default: 'baseFM by Agentbot - The Onchain Radio Protocol on Base',
    template: '%s | baseFM',
  },
  description: 'baseFM by Agentbot. Underground radio, events, and culture on Base with live streams, wallets, and autonomous DJ tooling.',
  keywords: ['Onchain Radio', 'Base Network', 'Autonomous DJ', 'Underground Music', 'Jungle', 'Dub', 'NFT Tickets', 'Smart Wallet'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
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
    'talentapp:project_verification': 'c2bedbde2c894be1a7d670de82f091081cb229241b464b0e23d1898bc264611bfe56ed0325995c811affaaaea88ec699697e09e23a0b4b4ed0f75f1fd993b42f',
  },
  openGraph: {
    title: 'baseFM by Agentbot - Onchain Radio on Base',
    description: 'Underground radio, events, tickets, services and bookings on Base. Powered by Agentbot for live streams and autonomous DJ workflows.',
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
    title: 'baseFM by Agentbot - Onchain Radio on Base',
    description: 'Underground radio, events, tickets, services and bookings on Base. Powered by Agentbot for live streams and autonomous DJ workflows.',
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
        {/* Farcaster Miniapp Meta Tags */}
        <meta property="fc:miniapp" content="vNext" />
        <meta property="fc:miniapp:name" content="baseFM" />
        <meta property="fc:miniapp:icon" content="https://basefm.space/logo.png" />
        <meta property="fc:miniapp:description" content="Onchain Radio on Base" />
        <meta property="fc:miniapp:url" content="https://basefm.space" />
      </head>
      <body className="bg-black min-h-screen font-mono text-white">
        <ErrorBoundary>
          <OnchainProvider>
            <PlayerProvider>
              <SplashScreen>
                <AppShell>{children}</AppShell>
                <GlobalPlayer />
              </SplashScreen>
            </PlayerProvider>
          </OnchainProvider>
        </ErrorBoundary>
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
