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
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="aspect-video bg-[#1A1A1A] skeleton rounded-xl mb-6" />
          <div className="h-8 w-2/3 skeleton rounded mb-4" />
          <div className="h-4 w-1/3 skeleton rounded" />
        </div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-4">{error || 'Show not found'}</h1>
          <Link href="/archive" className="text-blue-400 hover:underline">
            Back to archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/archive"
          className="inline-flex items-center gap-2 text-[#888] hover:text-[#F5F5F5] mb-6 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to archive
        </Link>

        {/* Video Player */}
        <div className="rounded-xl overflow-hidden bg-black mb-6">
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

        {/* Show Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-2">
              {show.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#888]">
              <span>{formatDate(show.recordedAt)}</span>
              <span>·</span>
              <span>{formatDuration(show.duration)}</span>
              {show.genre && (
                <>
                  <span>·</span>
                  <span className="px-2 py-0.5 bg-[#1A1A1A] rounded">{show.genre}</span>
                </>
              )}
            </div>
          </div>

          {show.description && (
            <p className="text-[#888] leading-relaxed">{show.description}</p>
          )}

          {/* DJ Card */}
          <Link
            href={`/djs/${show.djSlug}`}
            className="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors"
          >
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#333]">
              <Image
                src={show.djAvatar || DEFAULT_AVATAR}
                alt={show.djName}
                fill
                className={show.djAvatar ? 'object-cover' : 'object-contain p-2'}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-[#F5F5F5] font-medium">{show.djName}</h3>
              {show.djBio && (
                <p className="text-sm text-[#888] line-clamp-1">{show.djBio}</p>
              )}
            </div>
            <svg className="w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
