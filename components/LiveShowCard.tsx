'use client';

import Image from 'next/image';
import Link from 'next/link';

// Default fallback image - baseFM logo
const DEFAULT_ARTWORK = '/logo.png';

interface LiveShowCardProps {
  id: string;
  title: string;
  djName: string;
  artwork?: string;
  genre?: string;
  isLive?: boolean;
  isTokenGated?: boolean;
  startTime?: string;
  variant?: 'featured' | 'compact' | 'carousel';
  onClick?: () => void;
}

export function LiveShowCard({
  id,
  title,
  djName,
  artwork,
  genre,
  isLive = false,
  isTokenGated = false,
  startTime,
  variant = 'compact',
  onClick,
}: LiveShowCardProps) {
  // Use provided artwork or fall back to logo
  const imageUrl = artwork || DEFAULT_ARTWORK;

  const content = (
    <>
      {/* Artwork */}
      <div
        className={`relative overflow-hidden bg-[#1A1A1A] ${
          variant === 'featured'
            ? 'aspect-[16/9] rounded-xl'
            : variant === 'carousel'
            ? 'aspect-square w-40 rounded-lg'
            : 'aspect-square rounded-lg'
        }`}
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
            !artwork ? 'object-contain p-8 bg-[#0A0A0A]' : ''
          }`}
        />

        {/* Gradient overlay for featured */}
        {variant === 'featured' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {isLive && (
            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded animate-glow flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Live
            </span>
          )}
          {isTokenGated && (
            <span className="px-2 py-1 bg-[#F59E0B] text-black text-[10px] font-bold uppercase rounded">
              Token Gated
            </span>
          )}
        </div>

        {/* Play button overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Featured variant: info overlay */}
        {variant === 'featured' && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              {genre && (
                <span className="text-[#888] text-xs uppercase tracking-wider">{genre}</span>
              )}
              {startTime && !isLive && (
                <span className="text-[#888] text-xs">{startTime}</span>
              )}
            </div>
            <h2 className="text-white text-2xl font-bold mb-1">{title}</h2>
            <p className="text-[#888] text-sm">{djName}</p>
          </div>
        )}
      </div>

      {/* Info below artwork (non-featured) */}
      {variant !== 'featured' && (
        <div className={`mt-3 ${variant === 'carousel' ? 'w-40' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            {genre && (
              <span className="text-[#888] text-[10px] uppercase tracking-wider">{genre}</span>
            )}
          </div>
          <h3 className="text-[#F5F5F5] font-medium text-sm line-clamp-1">{title}</h3>
          <p className="text-[#888] text-xs line-clamp-1">{djName}</p>
          {startTime && !isLive && (
            <p className="text-[#666] text-xs mt-1">{startTime}</p>
          )}
        </div>
      )}
    </>
  );

  // Wrapper with click or link
  const wrapperClasses = `group block transition-subtle ${
    variant === 'featured' ? '' : variant === 'carousel' ? 'flex-shrink-0' : ''
  }`;

  if (onClick) {
    return (
      <button onClick={onClick} className={`${wrapperClasses} text-left`}>
        {content}
      </button>
    );
  }

  return (
    <Link href={`/stream/${id}`} className={wrapperClasses}>
      {content}
    </Link>
  );
}
