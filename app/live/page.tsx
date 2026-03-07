'use client';

import { useLiveStreams } from '@/hooks/useStreams';
import { LiveShowCard } from '@/components/LiveShowCard';
import Link from 'next/link';

export default function LivePage() {
  const { streams: liveStreams, isLoading } = useLiveStreams();

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#1A1A1A] rounded w-32" />
            <div className="aspect-video bg-[#1A1A1A] rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-[#1A1A1A] rounded-xl" />
              <div className="aspect-square bg-[#1A1A1A] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const featuredStream = liveStreams[0];
  const otherStreams = liveStreams.slice(1);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] flex items-center gap-3">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Live Now
          </h1>
          <p className="text-[#888] text-sm mt-1">
            {liveStreams.length} {liveStreams.length === 1 ? 'stream' : 'streams'} broadcasting
          </p>
        </div>

        {liveStreams.length === 0 ? (
          <div className="rounded-2xl bg-[#1A1A1A] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <h2 className="text-[#F5F5F5] font-semibold text-lg mb-2">No one is live right now</h2>
            <p className="text-[#888] text-sm mb-6">Check the schedule to see upcoming shows</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/schedule"
                className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-[#E5E5E5] transition-all active:scale-[0.97]"
              >
                View Schedule
              </Link>
              <Link
                href="/djs"
                className="px-5 py-2.5 bg-[#2C2C2E] text-white rounded-full text-sm font-medium hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
              >
                Browse DJs
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Stream */}
            {featuredStream && (
              <section>
                <LiveShowCard
                  id={featuredStream.id}
                  title={featuredStream.title}
                  djName={featuredStream.djName}
                  djWalletAddress={featuredStream.djWalletAddress}
                  artwork={featuredStream.coverImageUrl}
                  genre={featuredStream.genre}
                  isLive={featuredStream.status === 'LIVE'}
                  isTokenGated={featuredStream.isGated}
                  muxPlaybackId={featuredStream.muxPlaybackId}
                  hlsUrl={featuredStream.hlsPlaybackUrl}
                  useGlobalPlayer
                  variant="featured"
                />
              </section>
            )}

            {/* Other Live Streams */}
            {otherStreams.length > 0 && (
              <section>
                <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-4">
                  Also Live
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {otherStreams.map((stream) => (
                    <LiveShowCard
                      key={stream.id}
                      id={stream.id}
                      title={stream.title}
                      djName={stream.djName}
                      djWalletAddress={stream.djWalletAddress}
                      artwork={stream.coverImageUrl}
                      genre={stream.genre}
                      isLive
                      isTokenGated={stream.isGated}
                      muxPlaybackId={stream.muxPlaybackId}
                      hlsUrl={stream.hlsPlaybackUrl}
                      useGlobalPlayer
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Quick Links */}
        <section className="pt-4 border-t border-[#1A1A1A]">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/schedule"
              className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors"
            >
              <svg className="w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[#F5F5F5] text-sm font-medium">Schedule</span>
            </Link>
            <Link
              href="/archive"
              className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors"
            >
              <svg className="w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-[#F5F5F5] text-sm font-medium">Archive</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
