'use client';

import { useLiveStreams, useStreams } from '@/hooks/useStreams';
import { LiveShowCard } from '@/components/LiveShowCard';
import { ShareApp } from '@/components/ShareApp';
import Image from 'next/image';
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
          {/* Featured skeleton */}
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
          <h1 className="text-[#F5F5F5] text-2xl sm:text-3xl font-bold mb-2">Welcome to baseFM</h1>
          <p className="text-[#888] text-sm sm:text-base max-w-md mx-auto">
            Underground radio, onchain. DJs, plug in your wallet to broadcast live. Crew members get paid instantly.
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
                <h2 className="text-[#F5F5F5] text-xl font-bold mb-2">No Live Shows</h2>
                <p className="text-[#888] text-sm">Check back soon or view the schedule</p>
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
                  isLive={true}
                  isTokenGated={stream.isGated}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Shows Carousel */}
        {upcomingStreams.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[#F5F5F5] text-lg font-bold mb-4">Coming Up</h2>
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

        {/* Featured Event Card */}
        <section className="mb-12">
          <h2 className="text-[#F5F5F5] text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            Featured Event
          </h2>
          <Link
            href="/events/strobe-soundsystem"
            className="block group"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/60 via-black to-black border border-purple-500/20 hover:border-purple-500/40 transition-all active:scale-[0.99]">
              {/* Grid Pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                  backgroundSize: '30px 30px',
                }}
              />

              <div className="relative p-5 sm:p-6">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-white text-black text-[10px] font-bold uppercase rounded-full">
                    Launch Event
                  </span>
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase rounded-full">
                    16 Stacks
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white text-xl sm:text-2xl font-black mb-1 group-hover:text-purple-200 transition-colors">
                  STROBE SOUNDSYSTEM
                </h3>
                <p className="text-[#8E8E93] text-sm mb-4">
                  2 Areas: Dub to Live Techno & Drum & Bass
                </p>

                {/* Headliners */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1.5 bg-[#1C1C1E] text-white text-xs font-medium rounded-lg">
                    SAYTEK LIVE
                  </span>
                  <span className="px-3 py-1.5 bg-[#1C1C1E] text-white text-xs font-medium rounded-lg">
                    JAH SCOOP
                  </span>
                  <span className="px-3 py-1.5 bg-[#1C1C1E] text-white text-xs font-medium rounded-lg">
                    ORIGINAL DUBMAN
                  </span>
                  <span className="px-3 py-1.5 bg-[#1C1C1E] text-[#8E8E93] text-xs font-medium rounded-lg">
                    +15 more
                  </span>
                </div>

                {/* Gold Necklace Bonus */}
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-4">
                  <span className="text-lg">🏆</span>
                  <p className="text-yellow-200/80 text-xs">
                    Early bird tickets include commemorative gold necklace
                  </p>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-[#8E8E93] text-xs">
                    360 Warehouse
                  </span>
                  <span className="flex items-center gap-2 text-white text-sm font-semibold group-hover:gap-3 transition-all">
                    View Event
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Preview Stream */}
        <section className="mt-8">
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-4 sm:p-6 border border-purple-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-[#F5F5F5] text-lg font-bold">raveculture®</h2>
                <p className="text-[#888] text-sm">Underground culture. Onchain access.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://warpcast.com/raveculture"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-[#E5E5E5] transition-all active:scale-[0.97] touch-target"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.24 4.315l-6.24 15.63-2.385-6.15L3.465 11.4l14.775-7.085zm.255-.63L3.21 10.77a.75.75 0 00-.135 1.29l6.855 2.67 2.67 6.855a.75.75 0 001.29-.135l7.085-14.775a.75.75 0 00-.93-.99z"/>
                  </svg>
                  <span>Farcaster</span>
                </a>
                <a
                  href="https://base.app/profile/raveculture"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2C2C2E] text-white rounded-full text-sm font-semibold hover:bg-[#3C3C3E] transition-all active:scale-[0.97] touch-target"
                >
                  <svg className="w-4 h-4" viewBox="0 0 111 111" fill="none">
                    <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" fill="white"/>
                  </svg>
                  <span>Base</span>
                </a>
                <a
                  href="https://raveculture.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2C2C2E] text-white rounded-full text-sm font-semibold hover:bg-[#3C3C3E] transition-all active:scale-[0.97] touch-target"
                >
                  <span>Website</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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

            {/* Logo Below Stream */}
            <div className="flex justify-center mt-4">
              <Image
                src="/IMG_raveculture.png"
                alt="RaveCulture"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Share App Section */}
        <section className="mt-8">
          <ShareApp variant="full" />
        </section>

      </div>
    </div>
  );
}
