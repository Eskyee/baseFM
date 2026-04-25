'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MuxPlayer from '@mux/mux-player-react';
import type MuxPlayerElement from '@mux/mux-player';
import { usePlayer } from '@/contexts/PlayerContext';
import { TipButton } from './TipButton';

export function GlobalPlayer() {
  const { state, togglePlay, toggleMinimize, stopStream, setVolume, toggleMute, setIsPlaying } = usePlayer();
  const playerRef = useRef<MuxPlayerElement>(null);

  const { currentStream, isPlaying, isMinimized, volume, isMuted } = state;

  // Sync play state with player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.play().catch(() => {
        // Autoplay blocked, user needs to interact
      });
    } else {
      player.pause();
    }
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.volume = isMuted ? 0 : volume;
    player.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!currentStream?.id || !currentStream.isLive) {
      return;
    }

    let cancelled = false;

    const syncStreamStatus = async () => {
      try {
        const response = await fetch(`/api/streams/${currentStream.id}`);
        if (!response.ok) return;

        const data = await response.json();
        const status = data?.stream?.status;

        if (cancelled) return;

        if (status && !['LIVE', 'PREPARING'].includes(status)) {
          stopStream();
        }
      } catch (error) {
        console.error('Failed to sync player stream status:', error);
      }
    };

    void syncStreamStatus();
    const intervalId = window.setInterval(syncStreamStatus, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [currentStream?.id, currentStream?.isLive, stopStream]);

  if (!currentStream) return null;

  const playbackSource = currentStream.muxPlaybackId || currentStream.hlsUrl;

  return (
    <>
      {/* Expanded Player Overlay */}
      {!isMinimized && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl safe-area-all">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={toggleMinimize}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <span className="text-white/60 text-sm uppercase tracking-wider">Now Playing</span>
              <button
                onClick={stopStream}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Player Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
              {/* Artwork / Video */}
              <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-[#1A1A1A] shadow-2xl mb-8">
                {playbackSource ? (
                  <MuxPlayer
                    ref={playerRef}
                    playbackId={currentStream.muxPlaybackId}
                    src={!currentStream.muxPlaybackId ? currentStream.hlsUrl : undefined}
                    streamType="live"
                    autoPlay
                    muted={isMuted}
                    accentColor="#8B5CF6"
                    primaryColor="#FFFFFF"
                    secondaryColor="#1A1A1A"
                    metadata={{
                      video_title: currentStream.title,
                      viewer_user_id: 'anonymous',
                    }}
                    onEnded={stopStream}
                    onError={stopStream}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: '1/1',
                    }}
                  />
                ) : currentStream.artwork ? (
                  <Image
                    src={currentStream.artwork}
                    alt={currentStream.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                    <svg className="w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Stream Info */}
              <div className="text-center mb-8 w-full max-w-md">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {currentStream.isLive && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                  {currentStream.genre && (
                    <span className="text-white/40 text-xs uppercase tracking-wider">{currentStream.genre}</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1 line-clamp-2">{currentStream.title}</h2>
                <p className="text-purple-400 font-medium">{currentStream.djName}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <button
                  onClick={toggleMute}
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  {isMuted ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <Link
                  href={`/stream/${currentStream.id}`}
                  onClick={toggleMinimize}
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </Link>
              </div>

              {/* Tip Button */}
              {currentStream.isLive && currentStream.djWalletAddress && (
                <TipButton
                  djWalletAddress={currentStream.djWalletAddress}
                  djName={currentStream.djName}
                  streamId={currentStream.id}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mini Player Bar */}
      {isMinimized && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A] border-t border-[#1A1A1A] safe-area-bottom">
          <div className="flex items-center h-[72px] px-4">
            {/* Artwork & Info */}
            <button
              onClick={toggleMinimize}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1A1A1A] flex-shrink-0">
                {currentStream.artwork ? (
                  <Image
                    src={currentStream.artwork}
                    alt={currentStream.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                    <svg className="w-6 h-6 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                )}
                {currentStream.isLive && (
                  <div className="absolute top-1 left-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full block animate-pulse" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm truncate">{currentStream.title}</span>
                  {currentStream.isLive && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded flex-shrink-0">
                      Live
                    </span>
                  )}
                </div>
                <p className="text-[#888] text-xs truncate">{currentStream.djName}</p>
              </div>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform ml-4"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Close */}
            <button
              onClick={stopStream}
              className="w-8 h-8 flex items-center justify-center text-[#666] hover:text-white transition-colors ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
