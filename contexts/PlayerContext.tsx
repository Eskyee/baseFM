'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CurrentStream {
  id: string;
  title: string;
  djName: string;
  djWalletAddress?: string;
  artwork?: string;
  genre?: string;
  isLive: boolean;
  isTokenGated?: boolean;
  muxPlaybackId?: string;
  hlsUrl?: string;
}

interface PlayerState {
  currentStream: CurrentStream | null;
  isPlaying: boolean;
  isMinimized: boolean;
  volume: number;
  isMuted: boolean;
}

interface PlayerContextType {
  state: PlayerState;
  playStream: (stream: CurrentStream) => void;
  stopStream: () => void;
  togglePlay: () => void;
  toggleMinimize: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setIsPlaying: (playing: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentStream: null,
    isPlaying: false,
    isMinimized: true,
    volume: 0.8,
    isMuted: false,
  });

  const playStream = useCallback((stream: CurrentStream) => {
    setState(prev => ({
      ...prev,
      currentStream: stream,
      isPlaying: true,
      isMinimized: false,
    }));
  }, []);

  const stopStream = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStream: null,
      isPlaying: false,
    }));
  }, []);

  const togglePlay = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const toggleMinimize = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized,
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({
      ...prev,
      volume,
      isMuted: volume === 0,
    }));
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    setState(prev => ({
      ...prev,
      isPlaying: playing,
    }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        state,
        playStream,
        stopStream,
        togglePlay,
        toggleMinimize,
        setVolume,
        toggleMute,
        setIsPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
