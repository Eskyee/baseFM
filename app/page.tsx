'use client';

import { useLiveStreams, useStreams } from '@/hooks/useStreams';
import { LiveShowCard } from '@/components/LiveShowCard';

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
      {/* 🎉 Launch Event Hype Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/80 via-blue-900/80 to-purple-900/80 border-b border-purple-500/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated confetti particles */}
          <div className="absolute top-2 left-[10%] text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🎊</div>
          <div className="absolute top-4 left-[25%] text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
          <div className="absolute top-2 left-[40%] text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</div>
          <div className="absolute top-3 left-[60%] text-xl animate-bounce" style={{ animationDelay: '0.1s' }}>💥</div>
          <div className="absolute top-2 left-[75%] text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>🔊</div>
          <div className="absolute top-4 left-[90%] text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>🚀</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📻</span>
              <span className="text-white font-bold text-sm sm:text-base">
                LIVE THIS SATURDAY
              </span>
              <span className="text-2xl">📻</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <span className="text-purple-200 text-xs sm:text-sm">
                🇬🇧 Broadcasting live from Oxfordshire, UK
              </span>
              <span className="hidden sm:inline text-purple-400">•</span>
              <span className="text-blue-200 text-xs sm:text-sm font-medium">
                Welcome to baseFM 🤫
              </span>
            </div>
          </div>
          <p className="text-center text-purple-300/80 text-xs mt-2">
            Something special is coming... Be there for the launch 🎧
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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

        {/* Empty State */}
        {!featuredStream && upcomingStreams.length === 0 && !liveLoading && !upcomingLoading && (
          <section className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <h2 className="text-[#F5F5F5] text-2xl font-bold mb-2">Welcome to baseFM</h2>
            <p className="text-[#888] text-sm max-w-md mx-auto mb-6">
              The onchain radio platform on Base. Connect your wallet to go live or check back for upcoming shows.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
