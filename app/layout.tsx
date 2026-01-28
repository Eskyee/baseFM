import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { OnchainProvider } from '@/components/providers/OnchainProvider';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'baseFM - Onchain Radio on Base',
  description: 'Base-native, token-gated streaming radio platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-base-dark min-h-screen`}>
        <OnchainProvider>
          <Navbar />
          <main>{children}</main>
        </OnchainProvider>
      </body>
    </html>
  );
}
