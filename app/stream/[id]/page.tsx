'use client';

import { useStream } from '@/hooks/useStream';
import { TokenGate } from '@/components/TokenGate';
import { TipButton } from '@/components/TipButton';
import { usePlayer } from '@/components/AppShell';
import Link from 'next/link';
import Image from 'next/image';
import MuxPlayer from '@mux/mux-player-react';
import { ListenerCount } from '@/components/ListenerCount';

export default function StreamPage({ params }: { params: { id: string } }) {
  const { stream, isLoading, error } = useStream(params.id);
  const { currentShow, setCurrentShow } = usePlayer();

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 safe-area-all">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Back button skeleton */}
          <div className="h-10 w-10 bg-[#1A1A1A] rounded-full mb-6 skeleton" />

          {/* Player skeleton */}
          <div className="aspect-video bg-[#1A1A1A] rounded-2xl mb-6 skeleton" />

          {/* Title skeleton */}
          <div className="text-center space-y-3 mb-8">
            <div className="h-8 bg-[#1A1A1A] rounded-lg w-3/4 mx-auto skeleton" />
            <div className="h-5 bg-[#1A1A1A] rounded w-1/2 mx-auto skeleton" />
          </div>
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

  // Check if this stream is currently playing in persistent player
  const isInPersistentPlayer = currentShow?.streamId === stream.id;

  // Enable persistent playback - audio continues while browsing
  const enablePersistentPlayback = () => {
    const hlsUrl = stream.muxPlaybackId
      ? `https://stream.mux.com/${stream.muxPlaybackId}.m3u8`
      : stream.hlsPlaybackUrl;

    setCurrentShow({
      title: stream.title,
      djName: stream.djName,
      artwork: stream.coverImageUrl,
      isLive: isLive,
      isTokenGated: stream.isGated,
      hlsUrl: hlsUrl || undefined,
      streamId: stream.id,
    });
  };

  // Stop persistent playback
  const stopPersistentPlayback = () => {
    setCurrentShow(null);
  };

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

    // Use Mux Player if we have a playback ID
    if (stream.muxPlaybackId) {
      return (
        <div className="rounded-2xl overflow-hidden bg-black shadow-2xl shadow-purple-500/10">
          <MuxPlayer
            playbackId={stream.muxPlaybackId}
            streamType="live"
            autoPlay="muted"
            muted
            accentColor="#8B5CF6"
            primaryColor="#FFFFFF"
            secondaryColor="#1A1A1A"
            metadata={{
              video_title: stream.title,
              viewer_user_id: 'anonymous',
            }}
            style={{
              aspectRatio: '16/9',
              width: '100%',
              borderRadius: '1rem',
            }}
          />
        </div>
      );
    }

    // Fallback if no playback ID available
    if (!stream.hlsPlaybackUrl && !stream.muxPlaybackId) {
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

    // Fallback to HLS URL with Mux player
    return (
      <div className="rounded-2xl overflow-hidden bg-black shadow-2xl shadow-purple-500/10">
        <MuxPlayer
          src={stream.hlsPlaybackUrl}
          streamType="live"
          autoPlay="muted"
          muted
          accentColor="#8B5CF6"
          primaryColor="#FFFFFF"
          secondaryColor="#1A1A1A"
          metadata={{
            video_title: stream.title,
            viewer_user_id: 'anonymous',
          }}
          style={{
            aspectRatio: '16/9',
            width: '100%',
            borderRadius: '1rem',
          }}
        />
      </div>
    );
  };

  const playerContent = renderPlayer();

  return (
    <div className="min-h-screen pb-24 safe-area-all bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A] to-purple-950/20">
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
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

          {/* Live indicator and listener count in header */}
          {isLive && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 backdrop-blur-sm rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs font-semibold uppercase tracking-wide">Live</span>
              </div>
              <div className="px-3 py-1.5 bg-[#1A1A1A]/80 backdrop-blur-sm rounded-full">
                <ListenerCount streamId={stream.id} size="sm" />
              </div>
            </div>
          )}

          {/* Spacer for centering */}
          <div className="w-10" />
        </div>

        {/* Player Section - Full width, prominent */}
        <div className="mb-6">
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

        {/* Stream info below player */}
        <div className="flex items-start gap-4 mb-6">
          {/* Cover art thumbnail */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#1A1A1A] flex-shrink-0 shadow-lg">
            {stream.coverImageUrl ? (
              <Image
                src={stream.coverImageUrl}
                alt={stream.title}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                <svg className="w-8 h-8 text-[#444]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>

          {/* Stream details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {stream.isGated && (
                <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] text-[10px] font-bold uppercase rounded">
                  Token Gated
                </span>
              )}
              {stream.genre && (
                <span className="text-[#888] text-xs uppercase tracking-wider">{stream.genre}</span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight line-clamp-2">
              {stream.title}
            </h1>
            <p className="text-purple-400 font-medium">
              {stream.djName}
            </p>
          </div>
        </div>

        {/* Actions - Tip button and persistent player toggle */}
        {isLive && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            {/* Listen While Browsing button */}
            <button
              onClick={isInPersistentPlayer ? stopPersistentPlayback : enablePersistentPlayback}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm transition-all active:scale-[0.97] ${
                isInPersistentPlayer
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1A1A1A] text-[#F5F5F5] hover:bg-[#252525]'
              }`}
            >
              {isInPersistentPlayer ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                  Playing in Background
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Listen While Browsing
                </>
              )}
            </button>

            {/* Tip button */}
            {stream.djWalletAddress && (
              <TipButton
                djWalletAddress={stream.djWalletAddress}
                djName={stream.djName}
                streamId={stream.id}
              />
            )}
          </div>
        )}

        {/* Stream Details */}
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
