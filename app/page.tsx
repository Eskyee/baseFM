'use client';

import { useLiveStreams, useStreams } from '@/hooks/useStreams';
import { StreamCard } from '@/components/StreamCard';

export default function HomePage() {
  const { streams: liveStreams, isLoading: liveLoading } = useLiveStreams();
  const { streams: upcomingStreams, isLoading: upcomingLoading } = useStreams({
    status: ['CREATED', 'PREPARING'],
    limit: 6,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to baseFM
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover live streams from DJs around the world. Token-gated content
          on Base.
        </p>
      </div>

      {/* Live Now Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Live Now</h2>
        </div>

        {liveLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg h-64 animate-pulse"
              />
            ))}
          </div>
        ) : liveStreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No live streams right now</p>
            <p className="text-gray-500 text-sm mt-2">
              Check back soon or start your own stream!
            </p>
          </div>
        )}
      </section>

      {/* Upcoming Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Upcoming Streams</h2>

        {upcomingLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg h-64 animate-pulse"
              />
            ))}
          </div>
        ) : upcomingStreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingStreams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No upcoming streams scheduled</p>
          </div>
        )}
      </section>
    </div>
  );
}
