'use client';

import { useStream } from '@/hooks/useStream';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TokenGate } from '@/components/TokenGate';
import { TipButton } from '@/components/TipButton';
import Link from 'next/link';
import Image from 'next/image';

export default function StreamPage({ params }: { params: { id: string } }) {
  const { stream, isLoading, error } = useStream(params.id);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 safe-area-all">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Back button skeleton */}
          <div className="h-10 w-10 bg-[#1A1A1A] rounded-full mb-6 skeleton" />

          {/* Artwork skeleton */}
          <div className="aspect-square max-w-sm mx-auto bg-[#1A1A1A] rounded-3xl mb-8 skeleton" />

          {/* Title skeleton */}
          <div className="text-center space-y-3 mb-8">
            <div className="h-8 bg-[#1A1A1A] rounded-lg w-3/4 mx-auto skeleton" />
            <div className="h-5 bg-[#1A1A1A] rounded w-1/2 mx-auto skeleton" />
          </div>

          {/* Player skeleton */}
          <div className="h-20 bg-[#1A1A1A] rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center safe-area-all">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Stream Not Found</h1>
          <p className="text-[#888] mb-8 text-sm leading-relaxed">
            {error || 'This stream does not exist or has been removed.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-full font-semibold text-sm transition-all active:scale-[0.97] hover:bg-[#E5E5E5] touch-target"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isLive = stream.status === 'LIVE';
  const isPreparing = stream.status === 'PREPARING';
  const hasEnded = stream.status === 'ENDED';

  const renderPlayer = () => {
    if (hasEnded) {
      return (
        <div className="bg-[#1A1A1A] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
          <p className="text-[#888] font-medium">This stream has ended</p>
        </div>
      );
    }

    if (!isLive && !isPreparing) {
      return (
        <div className="bg-[#1A1A1A] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#888] font-medium mb-2">Stream hasn&apos;t started yet</p>
          {stream.scheduledStartTime && (
            <p className="text-[#666] text-sm">
              Scheduled for {new Date(stream.scheduledStartTime).toLocaleString()}
            </p>
          )}
        </div>
      );
    }

    if (isPreparing) {
      return (
        <div className="bg-[#1A1A1A] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-yellow-400 font-medium">Stream is starting...</p>
        </div>
      );
    }

    if (!stream.hlsPlaybackUrl) {
      return (
        <div className="bg-[#1A1A1A] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium">Stream URL not available</p>
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
    <div className="min-h-screen pb-24 safe-area-all">
      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
        {/* iOS-style header with back button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1A1A1A]/80 backdrop-blur-sm text-[#888] hover:text-white transition-colors active:scale-[0.95] touch-target"
            aria-label="Back to Discover"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Live indicator in header */}
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 backdrop-blur-sm rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-semibold uppercase tracking-wide">Live</span>
            </div>
          )}

          {/* Spacer for centering */}
          <div className="w-10" />
        </div>

        {/* Album art style artwork - centered, prominent */}
        <div className="mb-8">
          <div className="aspect-square max-w-xs sm:max-w-sm mx-auto relative rounded-3xl overflow-hidden bg-[#1A1A1A] shadow-2xl shadow-black/50">
            {stream.coverImageUrl ? (
              <Image
                src={stream.coverImageUrl}
                alt={stream.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]">
                <svg className="w-24 h-24 text-[#333]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}

            {/* Badges overlay */}
            {stream.isGated && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 bg-[#F59E0B]/90 backdrop-blur-sm text-black text-xs font-bold uppercase rounded-full">
                  Token Gated
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stream info - Apple Music style centered text */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            {stream.title}
          </h1>
          <p className="text-[#3B82F6] font-medium text-lg">
            {stream.djName}
          </p>
          {stream.genre && (
            <p className="text-[#888] text-sm mt-2 uppercase tracking-wider">
              {stream.genre}
            </p>
          )}
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

        {/* Actions - Tip button prominent for live streams */}
        {isLive && stream.djWalletAddress && (
          <div className="flex justify-center mb-8">
            <TipButton
              djWalletAddress={stream.djWalletAddress}
              djName={stream.djName}
              streamId={stream.id}
            />
          </div>
        )}

        {/* Stream Details - collapsed by default on mobile */}
        {(stream.description || (stream.tags && stream.tags.length > 0)) && (
          <div className="bg-[#1A1A1A]/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-4">
              About
            </h2>

            {stream.description && (
              <p className="text-[#F5F5F5] text-sm leading-relaxed mb-4">
                {stream.description}
              </p>
            )}

            {stream.tags && stream.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {stream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-[#0A0A0A] rounded-full text-[#888] text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
