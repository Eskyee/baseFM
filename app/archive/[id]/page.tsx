'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MuxPlayer from '@mux/mux-player-react';

interface ShowDetails {
  id: string;
  title: string;
  description: string | null;
  djName: string;
  djSlug: string;
  djAvatar: string | null;
  djBio: string | null;
  playbackId: string;
  duration: number;
  recordedAt: string;
  genre: string | null;
  viewCount: number;
}

const DEFAULT_AVATAR = '/logo.png';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ShowPage() {
  const params = useParams();
  const [show, setShow] = useState<ShowDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShow() {
      try {
        const res = await fetch(`/api/archive/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Show not found');
          } else {
            setError('Failed to load show');
          }
          return;
        }
        const data = await res.json();
        setShow(data.show);
      } catch {
        setError('Failed to load show');
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchShow();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-4xl space-y-6">
            <div className="aspect-video bg-zinc-900 animate-pulse" />
            <div className="h-6 w-2/3 bg-zinc-900 animate-pulse" />
            <div className="h-4 w-1/3 bg-zinc-900 animate-pulse" />
          </div>
        </section>
      </main>
    );
  }

  if (error || !show) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-sm uppercase tracking-widest text-zinc-500">
            {error || 'Show not found'}
          </h1>
          <Link
            href="/archive"
            className="inline-block text-[10px] uppercase tracking-widest text-blue-500 border border-blue-500/30 px-4 py-2 hover:bg-blue-500/10 transition-colors"
          >
            Back to archive
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/archive"
              className="basefm-kicker text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← Archive
            </Link>
            {show.genre && (
              <span className="basefm-kicker text-blue-500">{show.genre}</span>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.9]">
              {show.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-widest text-zinc-600">
              <span>{formatDate(show.recordedAt)}</span>
              <span className="text-zinc-800">·</span>
              <span>{formatDuration(show.duration)}</span>
              <span className="text-zinc-800">·</span>
              <span>{show.viewCount} views</span>
            </div>
          </div>
        </div>
      </section>

      {/* Player */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="max-w-4xl">
            <div className="overflow-hidden bg-black border border-zinc-900">
              <MuxPlayer
                playbackId={show.playbackId}
                metadata={{
                  video_title: show.title,
                  viewer_user_id: 'anonymous',
                }}
                accentColor="#3B82F6"
                className="w-full aspect-video"
              />
            </div>

            {/* Description */}
            {show.description && (
              <div className="mt-8 border-t border-zinc-900 pt-8">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">
                  About this set
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {show.description}
                </p>
              </div>
            )}

            {/* DJ Card */}
            <div className="mt-8 border-t border-zinc-900 pt-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">
                Performed by
              </div>
              <Link
                href={`/djs/${show.djSlug}`}
                className="group flex items-center gap-5 p-5 border border-zinc-900 hover:border-zinc-700 transition-colors"
              >
                <div className="relative w-12 h-12 overflow-hidden bg-zinc-900 flex-shrink-0">
                  <Image
                    src={show.djAvatar || DEFAULT_AVATAR}
                    alt={show.djName}
                    fill
                    className={
                      show.djAvatar
                        ? 'object-cover grayscale group-hover:grayscale-0 transition-all duration-500'
                        : 'object-contain p-2 opacity-30'
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">
                    {show.djName}
                  </h3>
                  {show.djBio && (
                    <p className="text-xs text-zinc-600 line-clamp-1 mt-1">
                      {show.djBio}
                    </p>
                  )}
                </div>
                <svg
                  className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
