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

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="aspect-[16/9] bg-[#1A1A1A] rounded-xl mb-8" />
            <div className="h-6 bg-[#1A1A1A] rounded w-48 mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0">
                  <div className="w-40 h-40 bg-[#1A1A1A] rounded-lg" />
                  <div className="h-4 bg-[#1A1A1A] rounded w-32 mt-3" />
                  <div className="h-3 bg-[#1A1A1A] rounded w-24 mt-2" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <section className="text-center mb-8">
          <h1 className="text-[#F5F5F5] text-2xl sm:text-3xl font-bold mb-2">
            Welcome to baseFM
          </h1>
          <p className="text-[#888] text-sm sm:text-base max-w-md mx-auto">
            Underground radio, events, tickets, services and bookings — all onchain.
            Direct to your wallet, no third parties, fully decentralised.
            Part of the Base ecosystem, open source — we all own it. 🥷
          </p>
        </section>

        {/* Featured Live Show */}
        {featuredStream ? (
          <section className="mb-12">
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
        ) : (
          <section className="mb-12">
            <div className="aspect-[16/9] rounded-xl bg-[#1A1A1A] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <h2 className="text-[#F5F5F5] text-xl font-bold mb-2">
                  No Live Shows
                </h2>
                <p className="text-[#888] text-sm">
                  Check back soon or view the schedule
                </p>
              </div>
            </div>
          </section>
        )}

        {/* More Live Now */}
        {otherLiveStreams.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[#F5F5F5] text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Now
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

        {/* Upcoming Shows */}
        {upcomingStreams.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[#F5F5F5] text-lg font-bold mb-4">
              Coming Up
            </h2>
            <div className="flex gap-4 overflow-x-auto carousel-scroll hide-scrollbar pb-2">
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

        {/* Preview Stream */}
        <section className="mt-8">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-4 sm:p-6 border border-purple-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-[#F5F5F5] text-lg font-bold">
                  raveculture®
                </h2>
                <p className="text-[#888] text-sm">
                  Underground culture. Onchain access.
                </p>
              </div>

              {/* Website only */}
              <div className="flex">
                <a
                  href="https://raveculture.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2C2C2E] text-white rounded-full text-sm font-semibold hover:bg-[#3C3C3E] transition-all active:scale-[0.97] touch-target"
                >
                  <span>Website</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden bg-black">
              <iframe
                src="https://player.mux.com/X9OgXqO8Gvo3iHgtTWJqgstGJFVIloBQnT5dhpxeIBM"
                className="w-full border-none aspect-video"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* Share App */}
        <section className="mt-8">
          <ShareApp variant="full" />
        </section>

        {/* Brand Logos */}
        <section className="mt-8 flex flex-col items-center gap-6 pb-8">
          <img src="/logo.png" alt="baseFM" width={80} height={80} className="rounded-xl" />
          <img src="/IMG_6851.png" alt="RaveCulture" width={200} height={200} className="rounded-lg" />
        </section>

      </div>
    </div>
  );
}