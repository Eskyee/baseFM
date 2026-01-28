'use client';

import { useAccount } from 'wagmi';
import { useStreams } from '@/hooks/useStreams';
import { StreamCard } from '@/components/StreamCard';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { streams, isLoading } = useStreams({
    djWalletAddress: address,
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">DJ Dashboard</h1>
          <p className="text-[#888] mb-8">
            Connect your wallet to manage your streams
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const liveStreams = streams.filter((s) => s.status === 'LIVE');
  const preparingStreams = streams.filter((s) => s.status === 'PREPARING');
  const scheduledStreams = streams.filter((s) => s.status === 'CREATED');
  const pastStreams = streams.filter((s) => s.status === 'ENDED');

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Dashboard</h1>
            <p className="text-[#888] text-sm mt-1">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="px-5 py-2.5 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
          >
            Go Live
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : streams.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-lg p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-2">
              No streams yet
            </h2>
            <p className="text-[#888] text-sm mb-6">
              Create your first stream to start broadcasting
            </p>
            <Link
              href="/dashboard/create"
              className="px-5 py-2.5 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm inline-block"
            >
              Create Your First Stream
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live/Preparing Streams */}
            {(liveStreams.length > 0 || preparingStreams.length > 0) && (
              <section>
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Active Streams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...liveStreams, ...preparingStreams].map((stream) => (
                    <StreamCard key={stream.id} stream={stream} showDJControls linkPrefix="/dashboard" />
                  ))}
                </div>
              </section>
            )}

            {/* Scheduled Streams */}
            {scheduledStreams.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">
                  Scheduled Streams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scheduledStreams.map((stream) => (
                    <StreamCard key={stream.id} stream={stream} showDJControls linkPrefix="/dashboard" />
                  ))}
                </div>
              </section>
            )}

            {/* Past Streams */}
            {pastStreams.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">
                  Past Streams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastStreams.slice(0, 6).map((stream) => (
                    <StreamCard key={stream.id} stream={stream} showDJControls linkPrefix="/dashboard" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
