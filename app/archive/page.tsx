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

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-2">
            Show Archive
          </h1>
          <p className="text-[#888]">
            Listen back to past broadcasts
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'All Shows' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? 'bg-[#F5F5F5] text-[#0A0A0A]'
                  : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Archive Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-xl overflow-hidden">
                <div className="aspect-video skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 skeleton rounded" />
                  <div className="h-4 w-1/2 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#F5F5F5] mb-2">No archived shows yet</h3>
            <p className="text-[#888] text-sm">
              Past broadcasts will appear here after streams end
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {shows.map((show) => (
              <Link
                key={show.id}
                href={`/archive/${show.id}`}
                className="bg-[#1A1A1A] rounded-xl overflow-hidden group hover:bg-[#222] transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video">
                  <Image
                    src={show.thumbnailUrl || DEFAULT_COVER}
                    alt={show.title}
                    fill
                    className={show.thumbnailUrl ? 'object-cover' : 'object-contain p-4 opacity-50'}
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white font-medium">
                    {formatDuration(show.duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-[#F5F5F5] font-medium line-clamp-1 group-hover:text-white transition-colors">
                    {show.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-[#333]">
                      {show.djAvatar ? (
                        <Image
                          src={show.djAvatar}
                          alt={show.djName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#888]">
                          {show.djName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-[#888]">{show.djName}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-[#666]">
                    <span>{formatDate(show.recordedAt)}</span>
                    {show.genre && (
                      <span className="px-2 py-0.5 bg-[#333] rounded">{show.genre}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
