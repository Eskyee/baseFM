'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Hls from 'hls.js';

interface AudioPlayerProps {
  streamUrl: string;
  title?: string;
  djName?: string;
  coverImageUrl?: string;
  autoPlay?: boolean;
}

export function AudioPlayer({
  streamUrl,
  title,
  djName,
  coverImageUrl,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);

  const initializePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    setIsLoading(true);
    setError(null);

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Native HLS support (Safari)
    if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = streamUrl;
      audio.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) audio.play().catch(() => {});
      });
      audio.addEventListener('error', () => {
        setError('Failed to load stream');
        setIsLoading(false);
      });
    }
    // HLS.js (Chrome, Firefox)
    else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) audio.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('Stream error occurred');
              hls.destroy();
              break;
          }
        }
      });
    } else {
      setError('HLS playback not supported in this browser');
      setIsLoading(false);
    }
  }, [streamUrl, autoPlay]);

  useEffect(() => {
    initializePlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [initializePlayer]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 w-full max-w-md mx-auto">
      {/* Cover Image */}
      {coverImageUrl && (
        <div className="mb-4 relative h-48">
          <Image
            src={coverImageUrl}
            alt={title || 'Stream cover'}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      {/* Stream Info */}
      <div className="mb-4">
        {title && <h3 className="text-white font-semibold text-lg">{title}</h3>}
        {djName && <p className="text-gray-400 text-sm">by {djName}</p>}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Error State */}
      {error && (
        <div className="text-red-400 text-sm mb-4 p-2 bg-red-900/20 rounded">
          {error}
          <button
            onClick={initializePlayer}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading || !!error}
          className="w-12 h-12 rounded-full bg-base-blue flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

    </div>
  );
}
