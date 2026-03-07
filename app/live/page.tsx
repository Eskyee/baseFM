'use client';

import { useState, useRef } from 'react';

export default function LivePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="max-w-2xl px-4 text-center">
        <h1 className="mb-4 text-6xl font-bold">🎧 baseFM Live</h1>
        <p className="mb-8 text-xl text-gray-400">
          Strictly Underground. 24/7 Autonomous Curation.
        </p>
        
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-8">
          <audio
            ref={audioRef}
            src="https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8"
            preload="none"
          />
          
          <button
            onClick={togglePlay}
            className="mb-4 rounded-full bg-white px-8 py-4 text-2xl font-bold text-black transition hover:bg-gray-200"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play Live'}
          </button>
          
          <p className="text-sm text-gray-500">
            AI-powered underground radio on Base
          </p>
        </div>
      </div>
    </div>
  );
}
