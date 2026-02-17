'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Hls from 'hls.js';

interface PlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

interface CurrentShow {
  title: string;
  djName: string;
  artwork?: string;
  isLive: boolean;
  isTokenGated?: boolean;
  hlsUrl?: string;
}

interface PersistentPlayerProps {
  currentShow: CurrentShow | null;
  onShowClick?: () => void;
}

export function PersistentPlayer({ currentShow, onShowClick }: PersistentPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    isLoading: false,
    error: null,
  });
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Initialize HLS
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentShow?.hlsUrl) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Native HLS support (Safari)
    if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = currentShow.hlsUrl;
      setState(prev => ({ ...prev, isLoading: false }));
    }
    // HLS.js for other browsers
    else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(currentShow.hlsUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setState(prev => ({ ...prev, isLoading: false }));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setState(prev => ({ ...prev, error: 'Stream unavailable', isLoading: false }));
        }
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentShow?.hlsUrl]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (state.isPlaying) {
        audio.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        await audio.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch {
      setState(prev => ({ ...prev, error: 'Playback failed' }));
    }
  }, [state.isPlaying]);

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setState(prev => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
  }, []);

  // Don't render if no current show
  if (!currentShow) return null;

  return (
    <>
      <audio ref={audioRef} preload="none" />

      {/* Fixed bottom player */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A] border-t border-[#1A1A1A] safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 safe-area-left safe-area-right">
          <div className="flex items-center justify-between h-[72px]">

            {/* Left: Show Info */}
            <button
              onClick={onShowClick}
              className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
            >
              {/* Artwork */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1A1A1A] flex-shrink-0">
                {currentShow.artwork ? (
                  <Image
                    src={currentShow.artwork}
                    alt={currentShow.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                )}

                {/* Live indicator overlay */}
                {currentShow.isLive && (
                  <div className="absolute top-1 left-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full block animate-pulse" />
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#F5F5F5] font-medium text-sm truncate">
                    {currentShow.title}
                  </span>
                  {currentShow.isLive && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded animate-glow flex-shrink-0">
                      Live
                    </span>
                  )}
                  {currentShow.isTokenGated && (
                    <span className="px-1.5 py-0.5 bg-[#F59E0B] text-black text-[10px] font-bold uppercase rounded flex-shrink-0">
                      Token
                    </span>
                  )}
                </div>
                <p className="text-[#888] text-xs truncate">{currentShow.djName}</p>
              </div>
            </button>

            {/* Center: Play Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                disabled={state.isLoading || !!state.error}
                className="w-10 h-10 rounded-full bg-[#F5F5F5] text-[#0A0A0A] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : state.isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Right: Volume */}
            <div
              className="flex items-center gap-3 flex-1 justify-end"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <div className="flex items-center gap-2">
                {showVolumeSlider && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={state.isMuted ? 0 : state.volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1"
                  />
                )}
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#F5F5F5] transition-colors"
                >
                  {state.isMuted || state.volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : state.volume < 0.5 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {state.error && (
          <div className="absolute top-0 left-0 right-0 -translate-y-full bg-red-500/90 text-white text-xs text-center py-1">
            {state.error}
          </div>
        )}
      </div>
    </>
  );
}
