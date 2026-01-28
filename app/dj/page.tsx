'use client';

import { useAccount } from 'wagmi';
import { useStreams } from '@/hooks/useStreams';
import { StreamCard } from '@/components/StreamCard';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';

export default function DJDashboardPage() {
  const { address, isConnected } = useAccount();
  const { streams, isLoading } = useStreams({
    djWalletAddress: address,
  });

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">DJ Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Connect your wallet to manage your streams
        </p>
        <WalletConnect />
      </div>
    );
  }

  const liveStreams = streams.filter((s) => s.status === 'LIVE');
  const preparingStreams = streams.filter((s) => s.status === 'PREPARING');
  const scheduledStreams = streams.filter((s) => s.status === 'CREATED');
  const pastStreams = streams.filter((s) => s.status === 'ENDED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">DJ Dashboard</h1>
          <p className="text-gray-400 mt-1">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <Link
          href="/dj/create"
          className="px-6 py-3 bg-base-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Create Stream
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      ) : streams.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <h2 className="text-xl font-semibold text-white mb-2">
            No streams yet
          </h2>
          <p className="text-gray-400 mb-6">
            Create your first stream to start broadcasting
          </p>
          <Link
            href="/dj/create"
            className="px-6 py-3 bg-base-blue text-white rounded-lg hover:bg-blue-600 transition-colors font-medium inline-block"
          >
            Create Your First Stream
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Live/Preparing Streams */}
          {(liveStreams.length > 0 || preparingStreams.length > 0) && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Active Streams
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...liveStreams, ...preparingStreams].map((stream) => (
                  <StreamCard key={stream.id} stream={stream} showDJControls />
                ))}
              </div>
            </section>
          )}

          {/* Scheduled Streams */}
          {scheduledStreams.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                Scheduled Streams
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduledStreams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} showDJControls />
                ))}
              </div>
            </section>
          )}

          {/* Past Streams */}
          {pastStreams.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">
                Past Streams
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastStreams.slice(0, 6).map((stream) => (
                  <StreamCard key={stream.id} stream={stream} showDJControls />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
