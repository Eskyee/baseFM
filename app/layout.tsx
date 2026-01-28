import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { OnchainProvider } from '@/components/providers/OnchainProvider';
import { AppShell } from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'baseFM - Onchain Radio on Base',
  description: 'Base-native, token-gated streaming radio platform',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
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
      <body className={`${inter.className} bg-[#0A0A0A] min-h-screen`}>
        <OnchainProvider>
          <AppShell>{children}</AppShell>
        </OnchainProvider>
      </body>
    </html>
  );
}
