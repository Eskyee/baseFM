'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Stream } from '@/types/stream';

// Default fallback image - baseFM logo
const DEFAULT_COVER = '/logo.png';

interface StreamCardProps {
  stream: Stream;
  showDJControls?: boolean;
  linkPrefix?: string;
}

export function StreamCard({ stream, showDJControls = false, linkPrefix = '/dashboard' }: StreamCardProps) {
  const isLive = stream.status === 'LIVE';
  const isPreparing = stream.status === 'PREPARING';

  const statusColors = {
    CREATED: 'bg-[#48484A]',
    PREPARING: 'bg-[#FF9F0A]',
    LIVE: 'bg-[#FF453A]',
    ENDING: 'bg-[#FF9F0A]',
    ENDED: 'bg-[#48484A]',
  };

  const statusLabels = {
    CREATED: 'Scheduled',
    PREPARING: 'Starting...',
    LIVE: 'Live',
    ENDING: 'Ending...',
    ENDED: 'Ended',
  };

  // Use provided cover image or fall back to logo
  const coverImage = stream.coverImageUrl || DEFAULT_COVER;
  const hasCustomImage = !!stream.coverImageUrl;

  return (
    <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden hover:bg-[#2C2C2E] transition-all active:scale-[0.98]">
      {/* Cover Image */}
      <div className="relative aspect-video bg-[#0A0A0A]">
        <Image
          src={coverImage}
          alt={stream.title}
          fill
          className={`${
            hasCustomImage ? 'object-cover' : 'object-contain p-8'
          }`}
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${statusColors[stream.status]} flex items-center gap-1.5`}
          >
            {isLive && (
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
            {statusLabels[stream.status]}
          </span>
        </div>

        {/* Token Gated Badge */}
        {stream.isGated && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-black bg-[#F59E0B]">
              Token Gated
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-base mb-1 truncate">
          {stream.title}
        </h3>
        <p className="text-[#8E8E93] text-sm mb-2">by {stream.djName}</p>

        {stream.genre && (
          <span className="inline-block px-2.5 py-1 bg-[#2C2C2E] rounded-full text-xs text-[#8E8E93] mb-3">
            {stream.genre}
          </span>
        )}

        {stream.description && (
          <p className="text-[#636366] text-sm line-clamp-2 mb-4">
            {stream.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {showDJControls ? (
            <Link
              href={`${linkPrefix}/stream/${stream.id}`}
              className="flex-1 px-4 py-2.5 bg-white text-black text-center rounded-xl transition-all text-sm font-semibold hover:bg-[#E5E5E5] active:scale-[0.97]"
            >
              Manage Stream
            </Link>
          ) : (
            <Link
              href={`/stream/${stream.id}`}
              className={`flex-1 px-4 py-2.5 text-center rounded-xl transition-all text-sm font-semibold active:scale-[0.97] ${
                isLive || isPreparing
                  ? 'bg-white text-black hover:bg-[#E5E5E5]'
                  : 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
              }`}
            >
              {isLive ? 'Listen Now' : isPreparing ? 'Starting Soon' : 'View Details'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
