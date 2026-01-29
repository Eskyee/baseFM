'use client';

import Link from 'next/link';
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
    CREATED: 'bg-gray-500',
    PREPARING: 'bg-yellow-500',
    LIVE: 'bg-red-500',
    ENDING: 'bg-orange-500',
    ENDED: 'bg-gray-600',
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

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
      {/* Cover Image */}
      <div className="relative aspect-video bg-gray-900">
        <img
          src={coverImage}
          alt={stream.title}
          className={`w-full h-full ${
            stream.coverImageUrl ? 'object-cover' : 'object-contain p-8 bg-[#0A0A0A]'
          }`}
        />

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium text-white ${statusColors[stream.status]}`}
          >
            {isLive && (
              <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
            )}
            {statusLabels[stream.status]}
          </span>
        </div>

        {/* Token Gated Badge */}
        {stream.isGated && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded text-xs font-medium text-white bg-purple-600">
              Token Gated
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-1 truncate">
          {stream.title}
        </h3>
        <p className="text-gray-400 text-sm mb-2">by {stream.djName}</p>

        {stream.genre && (
          <span className="inline-block px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300 mb-3">
            {stream.genre}
          </span>
        )}

        {stream.description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {stream.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {showDJControls ? (
            <Link
              href={`${linkPrefix}/stream/${stream.id}`}
              className="flex-1 px-4 py-2 bg-base-blue text-white text-center rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Manage Stream
            </Link>
          ) : (
            <Link
              href={`/stream/${stream.id}`}
              className={`flex-1 px-4 py-2 text-white text-center rounded-lg transition-colors text-sm font-medium ${
                isLive || isPreparing
                  ? 'bg-base-blue hover:bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
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
