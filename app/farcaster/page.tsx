'use client';

import { useState } from 'react';
import { useLiveStreams } from '@/hooks/useStreams';

const CHANNELS = [
  { name: 'raveculture', followers: '1.8k', url: 'https://warpcast.com/~/channel/raveculture', color: 'purple' },
  { name: 'base', followers: '45k', url: 'https://warpcast.com/~/channel/base', color: 'blue' },
  { name: 'music', followers: '12k', url: 'https://warpcast.com/~/channel/music', color: 'green' },
  { name: 'degen', followers: '38k', url: 'https://warpcast.com/~/channel/degen', color: 'purple' },
];

const WARPCAST_COMPOSE_URL = 'https://warpcast.com/~/compose';
const MINI_APP_URL = 'https://basefm.space';

export default function FarcasterPage() {
  const { streams } = useLiveStreams();
  const currentStream = streams[0];
  const [castText, setCastText] = useState('');

  const generateCastText = () => {
    if (currentStream) {
      return `Listening to ${currentStream.title} by ${currentStream.djName} on @basefm\n\nTune in: basefm.space`;
    }
    return 'Check out @basefm - onchain radio on Base\n\nbasefm.space';
  };

  const openComposer = (text?: string) => {
    const content = encodeURIComponent(text || castText || generateCastText());
    window.open(`${WARPCAST_COMPOSE_URL}?text=${content}`, '_blank');
  };

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.24 4.32H5.76a1.44 1.44 0 0 0-1.44 1.44v12.48a1.44 1.44 0 0 0 1.44 1.44h12.48a1.44 1.44 0 0 0 1.44-1.44V5.76a1.44 1.44 0 0 0-1.44-1.44zm-6.12 13.2a5.52 5.52 0 1 1 0-11.04 5.52 5.52 0 0 1 0 11.04z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] font-mono">
                Farcaster
              </h1>
              <p className="text-[#888] text-sm font-mono">
                baseFM on Warpcast
              </p>
            </div>
          </div>
        </div>

        {/* Mini App Card */}
        <div className="border border-purple-500/30 rounded-xl p-6 bg-purple-500/5 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F5] font-mono flex items-center gap-2">
                Mini App
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-mono rounded">
                  LIVE
                </span>
              </h2>
              <p className="text-[#888] text-sm font-mono mt-1">
                baseFM runs natively inside Warpcast
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]">
              <div className="text-[#888] text-xs font-mono mb-1">Stream</div>
              <div className="text-[#F5F5F5] text-sm font-mono">Live in Warpcast</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]">
              <div className="text-[#888] text-xs font-mono mb-1">Chat</div>
              <div className="text-[#F5F5F5] text-sm font-mono">Integrated chat</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#2A2A2A]">
              <div className="text-[#888] text-xs font-mono mb-1">Tips</div>
              <div className="text-[#F5F5F5] text-sm font-mono">Tip DJs onchain</div>
            </div>
          </div>

          <a
            href={`https://warpcast.com/~/add-app?url=${encodeURIComponent(MINI_APP_URL)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-lg text-sm font-mono font-semibold hover:bg-purple-500/80 transition-colors active:scale-[0.97]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.24 4.32H5.76a1.44 1.44 0 0 0-1.44 1.44v12.48a1.44 1.44 0 0 0 1.44 1.44h12.48a1.44 1.44 0 0 0 1.44-1.44V5.76a1.44 1.44 0 0 0-1.44-1.44zm-6.12 13.2a5.52 5.52 0 1 1 0-11.04 5.52 5.52 0 0 1 0 11.04z" />
            </svg>
            Add to Warpcast
          </a>
        </div>

        {/* Connected Channels */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#F5F5F5] font-mono mb-4">
            Channels
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CHANNELS.map((channel) => (
              <a
                key={channel.name}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${colorClasses[channel.color].bg} border ${colorClasses[channel.color].border} rounded-xl p-4 hover:scale-[1.02] transition-transform active:scale-[0.98]`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg font-mono font-bold ${colorClasses[channel.color].text}`}>
                    /
                  </span>
                  <span className="text-[#F5F5F5] font-mono font-semibold text-sm">
                    {channel.name}
                  </span>
                </div>
                <div className="text-[#888] text-xs font-mono">
                  {channel.followers} members
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Cast Composer */}
        <div className="border border-[#2A2A2A] rounded-xl p-6 bg-[#0A0A0A]">
          <h2 className="text-lg font-semibold text-[#F5F5F5] font-mono mb-4">
            Share on Farcaster
          </h2>

          {/* Now Playing */}
          {currentStream && (
            <div className="bg-[#1A1A1A] rounded-lg p-3 mb-4 border border-[#2A2A2A]">
              <div className="flex items-center gap-2 text-xs text-[#888] font-mono mb-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                NOW PLAYING
              </div>
              <div className="text-[#F5F5F5] font-mono text-sm">
                {currentStream.title} by {currentStream.djName}
              </div>
            </div>
          )}

          <textarea
            value={castText}
            onChange={(e) => setCastText(e.target.value)}
            placeholder={generateCastText()}
            rows={4}
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm font-mono text-[#F5F5F5] placeholder:text-[#666] focus:outline-none focus:border-purple-500/50 resize-none mb-4"
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openComposer()}
              className="px-5 py-2.5 bg-purple-500 text-white rounded-lg text-sm font-mono font-semibold hover:bg-purple-500/80 transition-colors active:scale-[0.97]"
            >
              Cast Now
            </button>
            {currentStream && (
              <button
                onClick={() => openComposer(generateCastText())}
                className="px-5 py-2.5 bg-[#1A1A1A] text-[#888] rounded-lg text-sm font-mono font-medium hover:text-white border border-[#2A2A2A] transition-colors active:scale-[0.97]"
              >
                Share Now Playing
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F5F5F5] font-mono">96k+</div>
            <div className="text-[#888] text-xs font-mono">Total Reach</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F5F5F5] font-mono">4</div>
            <div className="text-[#888] text-xs font-mono">Channels</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F5F5F5] font-mono">24/7</div>
            <div className="text-[#888] text-xs font-mono">Broadcast</div>
          </div>
        </div>
      </div>
    </div>
  );
}
