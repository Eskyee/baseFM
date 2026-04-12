'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { NowPlayingMarquee } from './NowPlayingMarquee';
import { PageTransition } from './PageTransition';
import { UpdateBanner } from './UpdateBanner';
import { ToastProvider } from './ui/Toast';
import { OfflineBanner } from './OfflineBanner';
import { usePlayer } from '@/contexts/PlayerContext';
export { usePlayer } from '@/contexts/PlayerContext';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { state } = usePlayer();
  const currentStream = state.currentStream;

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <OfflineBanner />
        <Navbar />
        <div className="navbar-spacer" aria-hidden="true" />
        <NowPlayingMarquee />
        <main className={`flex-1 ${currentStream ? 'pb-[72px]' : ''}`}>
          <PageTransition>{children}</PageTransition>
        </main>
        {!currentStream && <Footer />}
        <UpdateBanner />
      </div>
    </ToastProvider>
  );
}
