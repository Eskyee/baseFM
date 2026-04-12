'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePlayer } from '@/contexts/PlayerContext';
import { Stream } from '@/types/stream';

interface Replay {
  id: string;
  title: string;
  date: string;
  duration: string;
  hlsUrl: string;
  isTokenGated: boolean;
}

export default function ShowPage({ params }: { params: { slug: string } }) {
  const { playStream } = usePlayer();
  const [stream, setStream] = useState<Stream | null>(null);
  const [replays, setReplays] = useState<Replay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShow() {
      try {
        const res = await fetch(`/api/streams/${params.slug}`);
        if (!res.ok) throw new Error('Show not found');
        const data = await res.json();
        setStream(data.stream);

        // Mock replays for now (would come from API)
        setReplays([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load show');
      } finally {
        setIsLoading(false);
      }
    }

    fetchShow();
  }, [params.slug]);

  const handlePlay = () => {
    if (!stream) return;

    playStream({
      id: stream.id,
      title: stream.title,
      djName: stream.djName,
      djWalletAddress: stream.djWalletAddress,
      artwork: stream.coverImageUrl,
      isLive: stream.status === 'LIVE',
      isTokenGated: stream.isGated,
      muxPlaybackId: stream.muxPlaybackId,
      hlsUrl: stream.hlsPlaybackUrl,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="aspect-[16/9] bg-[#1A1A1A] rounded-xl mb-6" />
            <div className="h-8 bg-[#1A1A1A] rounded w-2/3 mb-4" />
            <div className="h-4 bg-[#1A1A1A] rounded w-1/3 mb-8" />
            <div className="h-20 bg-[#1A1A1A] rounded mb-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <h2 className="text-[#F5F5F5] text-xl font-bold mb-2">Show Not Found</h2>
          <p className="text-[#888] text-sm mb-4">{error || 'This show does not exist'}</p>
          <Link href="/" className="text-[#3B82F6] hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isLive = stream.status === 'LIVE';

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="text-[#888] hover:text-[#F5F5F5] mb-6 inline-flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Show Header / Artwork */}
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#1A1A1A] mb-6">
          {stream.coverImageUrl ? (
            <Image
              src={stream.coverImageUrl}
              alt={stream.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-[#333]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {isLive && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase rounded animate-glow flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Live Now
              </span>
            )}
            {stream.isGated && (
              <span className="px-3 py-1 bg-[#F59E0B] text-black text-xs font-bold uppercase rounded">
                Token Gated
              </span>
            )}
          </div>

          {/* Play Button */}
          {stream.hlsPlaybackUrl && (
            <button
              onClick={handlePlay}
              className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-[#F5F5F5] text-[#0A0A0A] flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            >
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>

        {/* Show Info */}
        <div className="mb-8">
          {stream.genre && (
            <span className="text-[#888] text-xs uppercase tracking-wider mb-2 block">
              {stream.genre}
            </span>
          )}
          <h1 className="text-[#F5F5F5] text-3xl font-bold mb-2">{stream.title}</h1>
          <p className="text-[#888] text-lg">{stream.djName}</p>
        </div>

        {/* DJ Bio / Description */}
        {stream.description && (
          <div className="mb-8">
            <h2 className="text-[#F5F5F5] text-lg font-semibold mb-3">About</h2>
            <p className="text-[#888] leading-relaxed">{stream.description}</p>
          </div>
        )}

        {/* Tags */}
        {stream.tags && stream.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {stream.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#1A1A1A] text-[#888] text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Replays Section */}
        {replays.length > 0 && (
          <div>
            <h2 className="text-[#F5F5F5] text-lg font-semibold mb-4">Previous Episodes</h2>
            <div className="space-y-3">
              {replays.map((replay) => (
                <div
                  key={replay.id}
                  className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg hover:bg-[#222] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-[#333] text-[#F5F5F5] flex items-center justify-center hover:bg-[#444] transition-colors">
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <div>
                      <h3 className="text-[#F5F5F5] font-medium">{replay.title}</h3>
                      <p className="text-[#888] text-sm">{replay.date} · {replay.duration}</p>
                    </div>
                  </div>
                  {replay.isTokenGated && (
                    <span className="px-2 py-1 bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-medium rounded">
                      Token
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Replays */}
        {replays.length === 0 && (
          <div className="text-center py-8 bg-[#1A1A1A] rounded-lg">
            <p className="text-[#888] text-sm">No previous episodes available</p>
          </div>
        )}
      </div>
    </div>
  );
}
