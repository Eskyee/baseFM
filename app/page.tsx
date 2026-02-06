'use client';

import { useLiveStreams, useStreams } from '@/hooks/useStreams';
import { LiveShowCard } from '@/components/LiveShowCard';
import { ShareApp } from '@/components/ShareApp';
import Link from 'next/link';

export default function HomePage() {
  const { streams: liveStreams, isLoading: liveLoading } = useLiveStreams();
  const { streams: upcomingStreams, isLoading: upcomingLoading } = useStreams({
    status: ['CREATED', 'PREPARING'],
    limit: 10,
  });

  const featuredStream = liveStreams[0];
  const otherLiveStreams = liveStreams.slice(1);
  const isLoading = liveLoading && upcomingLoading;
  const hasLive = liveStreams.length > 0;
  const hasUpcoming = upcomingStreams.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-5 bg-[#1A1A1A] rounded w-40" />
            <div className="aspect-[16/9] bg-[#1A1A1A] rounded-2xl" />
            <div className="h-5 bg-[#1A1A1A] rounded w-32" />
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-36 flex-shrink-0">
                  <div className="aspect-square bg-[#1A1A1A] rounded-lg" />
                  <div className="h-3 bg-[#1A1A1A] rounded w-28 mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-10">

        {/* Header — one line, not a wall of text */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[#F5F5F5] text-xl font-bold">baseFM</h1>
            <p className="text-[#888] text-sm">Onchain radio on Base</p>
          </div>
          <Link
            href="/schedule"
            className="px-4 py-2 bg-[#1A1A1A] text-[#F5F5F5] rounded-full text-sm font-medium hover:bg-[#222] transition-colors active:scale-[0.97]"
          >
            Schedule
          </Link>
        </header>

        {/* === LIVE SECTION === */}
        {hasLive && (
          <>
            {/* Featured live stream */}
            <section>
              <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live Now
              </h2>
              <LiveShowCard
                id={featuredStream.id}
                title={featuredStream.title}
                djName={featuredStream.djName}
                artwork={featuredStream.coverImageUrl}
                genre={featuredStream.genre}
                isLive={featuredStream.status === 'LIVE'}
                isTokenGated={featuredStream.isGated}
                variant="featured"
              />
            </section>

            {/* Additional live streams */}
            {otherLiveStreams.length > 0 && (
              <section>
                <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3">
                  Also Live
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {otherLiveStreams.map((stream) => (
                    <LiveShowCard
                      key={stream.id}
                      id={stream.id}
                      title={stream.title}
                      djName={stream.djName}
                      artwork={stream.coverImageUrl}
                      genre={stream.genre}
                      isLive
                      isTokenGated={stream.isGated}
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* === NOTHING LIVE — guide users instead of empty state === */}
        {!hasLive && (
          <section>
            <div className="rounded-2xl bg-[#1A1A1A] p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <p className="text-[#F5F5F5] font-semibold mb-1">No one is live right now</p>
              <p className="text-[#888] text-sm mb-5">Check the schedule or explore DJs</p>
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
          </section>
        )}

        {/* === COMING UP === */}
        {hasUpcoming && (
          <section>
            <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3">
              Coming Up
            </h2>
            <div className="flex gap-3 overflow-x-auto carousel-scroll hide-scrollbar pb-2">
              {upcomingStreams.map((stream) => (
                <LiveShowCard
                  key={stream.id}
                  id={stream.id}
                  title={stream.title}
                  djName={stream.djName}
                  artwork={stream.coverImageUrl}
                  genre={stream.genre}
                  isLive={false}
                  isTokenGated={stream.isGated}
                  startTime={
                    stream.scheduledStartTime
                      ? new Date(stream.scheduledStartTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : undefined
                  }
                  variant="carousel"
                />
              ))}
            </div>
          </section>
        )}

        {/* === EVENT === */}
        <section>
          <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3">
            Events
          </h2>
          <Link
            href="/events/strobe-soundsystem"
            className="block bg-gradient-to-r from-purple-900/40 to-black rounded-2xl overflow-hidden border border-purple-500/20 group active:scale-[0.98] transition-transform"
          >
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-white text-black text-[10px] font-bold uppercase rounded-full">
                  Launch Event
                </span>
                <span className="px-2 py-0.5 bg-[#2C2C2E] text-[#8E8E93] text-[10px] font-medium rounded-full">
                  16 Stacks
                </span>
              </div>
              <h3 className="text-white font-bold text-lg leading-tight mb-1">
                STROBE SOUNDSYSTEM
              </h3>
              <p className="text-[#8E8E93] text-sm mb-3">
                Dub to Live Techno &amp; Drum &amp; Bass
              </p>
              <div className="flex items-center gap-4 text-xs text-[#8E8E93]">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  360 Warehouse
                </span>
                <span>SAYTEK LIVE &bull; JAH SCOOP &bull; +20 artists</span>
              </div>
            </div>
          </Link>
        </section>

        {/* === QUICK LINKS — always visible === */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/community"
              className="flex flex-col items-center gap-2 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors active:scale-[0.97]"
            >
              <svg className="w-6 h-6 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <span className="text-[#F5F5F5] text-xs font-medium">Community</span>
            </Link>
            <Link
              href="/djs"
              className="flex flex-col items-center gap-2 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors active:scale-[0.97]"
            >
              <svg className="w-6 h-6 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="text-[#F5F5F5] text-xs font-medium">DJs</span>
            </Link>
            <Link
              href="/archive"
              className="flex flex-col items-center gap-2 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors active:scale-[0.97]"
            >
              <svg className="w-6 h-6 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z" />
              </svg>
              <span className="text-[#F5F5F5] text-xs font-medium">Archive</span>
            </Link>
          </div>
        </section>

        {/* === RAVECULTURE PREVIEW — tighter === */}
        <section>
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl overflow-hidden border border-purple-500/20">
            <div className="p-4 pb-3">
              <h2 className="text-[#F5F5F5] text-base font-bold">raveculture&reg;</h2>
              <p className="text-[#888] text-xs">Underground culture. Onchain access.</p>
            </div>
            <div className="bg-black">
              <iframe
                src="https://player.mux.com/X9OgXqO8Gvo3iHgtTWJqgstGJFVIloBQnT5dhpxeIBM"
                className="w-full border-none aspect-video"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* === SHARE — compact row, not a full section === */}
        <section className="pb-4">
          <ShareApp variant="compact" className="justify-center" />
        </section>

      </div>
    </div>
  );
}
