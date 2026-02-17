'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PersistentPlayer } from './PersistentPlayer';
import { NowPlayingMarquee } from './NowPlayingMarquee';

interface CurrentShow {
  title: string;
  djName: string;
  artwork?: string;
  isLive: boolean;
  isTokenGated?: boolean;
  hlsUrl?: string;
  streamId?: string;
}

interface PlayerContextType {
  currentShow: CurrentShow | null;
  setCurrentShow: (show: CurrentShow | null) => void;
  isPlayerVisible: boolean;
}

const PlayerContext = createContext<PlayerContextType>({
  currentShow: null,
  setCurrentShow: () => {},
  isPlayerVisible: false,
});

export function usePlayer() {
  return useContext(PlayerContext);
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [currentShow, setCurrentShow] = useState<CurrentShow | null>(null);

  return (
    <PlayerContext.Provider
      value={{
        currentShow,
        setCurrentShow,
        isPlayerVisible: !!currentShow,
      }}
    >
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="navbar-spacer" aria-hidden="true" />
        <NowPlayingMarquee />
        <main className={`flex-1 ${currentShow ? 'pb-[72px]' : ''}`}>
          {children}
        </main>
        {!currentShow && <Footer />}
        <PersistentPlayer currentShow={currentShow} />
      </div>
    </PlayerContext.Provider>
  );
}
