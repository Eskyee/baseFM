'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePlayer, CurrentStream } from '@/contexts/PlayerContext';

const DEFAULT_ARTWORK = '/logo.png';

interface LiveShowCardProps {
  id: string;
  title: string;
  djName: string;
  djWalletAddress?: string;
  artwork?: string;
  genre?: string;
  isLive?: boolean;
  isTokenGated?: boolean;
  startTime?: string;
  variant?: 'featured' | 'compact' | 'carousel';
  onClick?: () => void;
  muxPlaybackId?: string;
  hlsUrl?: string;
  useGlobalPlayer?: boolean;
}

export function LiveShowCard({
  id,
  title,
  djName,
  djWalletAddress,
  artwork,
  genre,
  isLive = false,
  isTokenGated = false,
  startTime,
  variant = 'compact',
  onClick,
  muxPlaybackId,
  hlsUrl,
  useGlobalPlayer = false,
}: LiveShowCardProps) {
  const { playStream, setVolume } = usePlayer();

  const imageUrl = artwork || DEFAULT_ARTWORK;
  const hasCustomArtwork = !!artwork;

  const handlePlay = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (useGlobalPlayer && isLive) {
      const streamData: CurrentStream = {
        id,
        title,
        djName,
        djWalletAddress,
        artwork,
        genre,
        isLive,
        isTokenGated,
        muxPlaybackId,
        hlsUrl,
      };
      setVolume(0.8);
      playStream(streamData);
    }
  };

  const content = (
    <>
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
          className={`transition-transform duration-300 group-hover:scale-105 ${
            hasCustomArtwork ? 'object-cover' : 'object-contain p-8 bg-[#0A0A0A]'
          }`}
        />
        {variant === 'featured' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {isLive && (
            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded animate-glow flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <svg className="w-6 h-6 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {variant === 'featured' && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-white text-2xl font-bold mb-1">{title}</h2>
            <p className="text-[#888] text-sm">{djName}</p>
          </div>
        )}
      </div>
      {variant !== 'featured' && (
        <div className={`mt-3 ${variant === 'carousel' ? 'w-40' : ''}`}>
          <h3 className="text-[#F5F5F5] font-medium text-sm line-clamp-1">{title}</h3>
          <p className="text-[#888] text-xs line-clamp-1">{djName}</p>
        </div>
      )}
    </>
  );

  const wrapperClasses = `group block transition-subtle ${
    variant === 'featured' ? '' : variant === 'carousel' ? 'flex-shrink-0' : ''
  }`;

  if (useGlobalPlayer && isLive) {
    return (
      <button onClick={handlePlay} className={`${wrapperClasses} text-left w-full`}>
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
