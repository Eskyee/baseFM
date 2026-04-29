'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ArchivedShow {
  id: string;
  title: string;
  djName: string;
  djSlug: string;
  djAvatar: string | null;
  playbackId: string | null;
  thumbnailUrl: string | null;
  duration: number;
  recordedAt: string;
  genre: string | null;
  viewCount: number;
}

const DEFAULT_COVER = '/logo.png';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ArchivePage() {
  const [shows, setShows] = useState<ArchivedShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    async function fetchArchive() {
      try {
        const res = await fetch(`/api/archive?filter=${filter}`);
        if (res.ok) {
          const data = await res.json();
          setShows(data.shows || []);
        }
      } catch (err) {
        console.error('Failed to fetch archive:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArchive();
  }, [filter]);

  const filters = [
    { value: 'all' as const, label: 'All Shows' },
    { value: 'week' as const, label: 'This Week' },
    { value: 'month' as const, label: 'This Month' },
  ];

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Archive</span>
            <span className="basefm-kicker text-zinc-500">Past broadcasts</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Show archive.
              <br />
              <span className="text-zinc-700">Listen back any time.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              Every past broadcast, preserved and replayable. Find a set you missed or relive a session that hit different.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="grid gap-px bg-zinc-900 sm:grid-cols-3 max-w-md">
            {filters.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`bg-black px-4 py-4 text-left transition-colors ${
                  filter === tab.value
                    ? 'bg-zinc-950 border border-zinc-800'
                    : 'hover:bg-zinc-950'
                }`}
              >
                <div className="text-[10px] uppercase tracking-widest text-zinc-600">
                  {tab.label}
                </div>
                {filter === tab.value && (
                  <div className="mt-2 h-2 w-2 bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Archive Grid */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          {isLoading ? (
            <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-black p-5 animate-pulse">
                  <div className="aspect-video bg-zinc-900 mb-4" />
                  <div className="h-4 w-3/4 bg-zinc-900 mb-3" />
                  <div className="h-3 w-1/2 bg-zinc-900 mb-2" />
                  <div className="h-3 w-1/3 bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : shows.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-2">
                No archived shows
              </h3>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                Past broadcasts will appear here after streams end.
              </p>
            </div>
          ) : (
            <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shows.map((show) => (
                <Link
                  key={show.id}
                  href={`/archive/${show.id}`}
                  className="bg-black group hover:bg-zinc-950 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={show.thumbnailUrl || DEFAULT_COVER}
                      alt={show.title}
                      fill
                      className={
                        show.thumbnailUrl
                          ? 'object-cover grayscale group-hover:grayscale-0 transition-all duration-500'
                          : 'object-contain p-6 opacity-30'
                      }
                    />

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 border border-white/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/90 text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
                      {formatDuration(show.duration)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 border-t border-zinc-900">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">
                      {formatDate(show.recordedAt)}
                    </div>
                    <h3 className="text-sm text-zinc-300 font-medium line-clamp-1 group-hover:text-white transition-colors uppercase tracking-wide">
                      {show.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-3">
                      <div className="relative w-5 h-5 overflow-hidden bg-zinc-900">
                        {show.djAvatar ? (
                          <Image
                            src={show.djAvatar}
                            alt={show.djName}
                            fill
                            className="object-cover grayscale"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-600 uppercase">
                            {show.djName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                        {show.djName}
                      </span>
                    </div>

                    {show.genre && (
                      <div className="mt-3">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-600 border border-zinc-800 px-2 py-0.5">
                          {show.genre}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
