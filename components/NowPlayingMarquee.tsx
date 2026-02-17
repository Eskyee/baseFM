'use client';

import { useLiveStreams } from '@/hooks/useStreams';

export function NowPlayingMarquee() {
  const { streams } = useLiveStreams();

  if (streams.length === 0) {
    return null;
  }

  const currentStream = streams[0];
  const text = `NOW PLAYING: ${currentStream.title} by ${currentStream.djName}`;

  // Duplicate text for seamless loop
  const marqueeContent = Array(4).fill(text).join(' • ');

  return (
    <div className="bg-[#0A0A0A] border-b border-[#1A1A1A] overflow-hidden">
      <div className="relative flex items-center h-8">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10" />

        <div className="animate-marquee whitespace-nowrap font-mono text-xs text-[#888] tracking-wider">
          {marqueeContent}
        </div>
      </div>
    </div>
  );
}
