'use client';

import { useStream } from '@/hooks/useStream';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TokenGate } from '@/components/TokenGate';
import Link from 'next/link';

export default function StreamPage({ params }: { params: { id: string } }) {
  const { stream, isLoading, error } = useStream(params.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-800 rounded mb-4" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Stream Not Found</h1>
        <p className="text-gray-400 mb-6">
          {error || 'This stream does not exist or has been removed.'}
        </p>
        <Link
          href="/"
          className="text-base-blue hover:underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const isLive = stream.status === 'LIVE';
  const isPreparing = stream.status === 'PREPARING';
  const hasEnded = stream.status === 'ENDED';

  const renderPlayer = () => {
    if (hasEnded) {
      return (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">This stream has ended</p>
        </div>
      );
    }

    if (!isLive && !isPreparing) {
      return (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Stream has not started yet</p>
          {stream.scheduledStartTime && (
            <p className="text-gray-500 text-sm mt-2">
              Scheduled for: {new Date(stream.scheduledStartTime).toLocaleString()}
            </p>
          )}
        </div>
      );
    }

    if (isPreparing) {
      return (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-yellow-400">Stream is starting...</p>
        </div>
      );
    }

    if (!stream.hlsPlaybackUrl) {
      return (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-red-400">Stream URL not available</p>
        </div>
      );
    }

    return (
      <AudioPlayer
        streamUrl={stream.hlsPlaybackUrl}
        title={stream.title}
        djName={stream.djName}
        coverImageUrl={stream.coverImageUrl}
        autoPlay={true}
      />
    );
  };

  const playerContent = renderPlayer();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/"
        className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Discover
      </Link>

      {/* Stream Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">{stream.title}</h1>
          {isLive && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          {stream.isGated && (
            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
              Token Gated
            </span>
          )}
        </div>
        <p className="text-gray-400">by {stream.djName}</p>
      </div>

      {/* Player Section */}
      <div className="mb-8">
        {stream.isGated && stream.requiredTokenAddress ? (
          <TokenGate
            tokenAddress={stream.requiredTokenAddress}
            requiredAmount={stream.requiredTokenAmount || 1}
          >
            {playerContent}
          </TokenGate>
        ) : (
          playerContent
        )}
      </div>

      {/* Stream Details */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">About this Stream</h2>

        {stream.description && (
          <p className="text-gray-400 mb-4">{stream.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {stream.genre && (
            <div>
              <span className="text-gray-500">Genre</span>
              <p className="text-white">{stream.genre}</p>
            </div>
          )}
          {stream.tags && stream.tags.length > 0 && (
            <div>
              <span className="text-gray-500">Tags</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {stream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-700 rounded text-gray-300 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
