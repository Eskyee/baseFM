'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { DJ } from '@/types/dj';
import { Stream } from '@/types/stream';
import { DJStats } from '@/lib/db/dj-stats';
import { TipButton } from '@/components/TipButton';

const DEFAULT_AVATAR = '/logo.png';

type TabType = 'shows' | 'about';

export default function DJProfilePage({ params }: { params: { slug: string } }) {
  const { address } = useAccount();
  const [dj, setDJ] = useState<DJ | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [stats, setStats] = useState<DJStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('shows');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch DJ profile
        const djRes = await fetch(`/api/djs/${params.slug}`);
        if (!djRes.ok) {
          throw new Error('DJ not found');
        }
        const djData = await djRes.json();
        setDJ(djData.dj);

        // Fetch DJ's streams
        const streamsRes = await fetch(`/api/streams?djWalletAddress=${djData.dj.walletAddress}`);
        if (streamsRes.ok) {
          const streamsData = await streamsRes.json();
          setStreams(streamsData.streams || []);
        }

        // Fetch DJ stats (will fetch again if wallet connects later)
        const viewerParam = address ? `?viewer=${address}` : '';
        const statsRes = await fetch(`/api/djs/${params.slug}/stats${viewerParam}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
          setIsFollowing(statsData.isFollowing || false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load DJ profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.slug, address]);

  const handleFollow = async () => {
    if (!address || !dj || isFollowLoading) return;
    setIsFollowLoading(true);

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`/api/djs/${params.slug}/follow`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        if (stats) {
          setStats({
            ...stats,
            followerCount: isFollowing ? stats.followerCount - 1 : stats.followerCount + 1,
          });
        }
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-[#1A1A1A] rounded-xl mb-6" />
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-[#1A1A1A] rounded-full" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-[#1A1A1A] rounded w-48" />
                <div className="h-4 bg-[#1A1A1A] rounded w-full" />
                <div className="h-4 bg-[#1A1A1A] rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dj) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-4">DJ Not Found</h1>
          <p className="text-[#888] mb-6">{error || 'This DJ profile does not exist'}</p>
          <Link href="/djs" className="text-blue-400 hover:underline">
            Browse all DJs
          </Link>
        </div>
      </div>
    );
  }

  const liveStream = streams.find(s => s.status === 'LIVE');
  const pastStreams = streams.filter(s => s.status === 'ENDED').slice(0, 12);
  const upcomingStreams = streams.filter(s => s.status === 'CREATED' || s.status === 'PREPARING');
  const hasAvatar = !!dj.avatarUrl && !avatarError;
  const hasCover = !!dj.coverImageUrl && !coverError;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const socialLinks = [
    { url: dj.twitterUrl, icon: 'twitter', label: 'X' },
    { url: dj.instagramUrl, icon: 'instagram', label: 'Instagram' },
    { url: dj.farcasterUrl, icon: 'farcaster', label: 'Farcaster' },
    { url: dj.soundcloudUrl, icon: 'soundcloud', label: 'SoundCloud' },
    { url: dj.mixcloudUrl, icon: 'mixcloud', label: 'Mixcloud' },
    { url: dj.spotifyUrl, icon: 'spotify', label: 'Spotify' },
    { url: dj.websiteUrl, icon: 'website', label: 'Website' },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen pb-20">
      {/* Cover Image Banner - Industry Standard Professional Layout */}
      <div className="relative">
        {/* Banner container with proper aspect ratio for different screens */}
        <div className="relative w-full aspect-[3/1] sm:aspect-[4/1] md:aspect-[5/1] max-h-80 overflow-hidden">
          {hasCover ? (
            <Image
              src={dj.coverImageUrl as string}
              alt={`${dj.name} cover`}
              fill
              unoptimized
              onError={() => setCoverError(true)}
              className="object-cover object-center"
              style={{ objectPosition: 'center 30%' }}
            />
          ) : (
            // Professional gradient fallback with animated accents
            <div className="w-full h-full bg-gradient-to-br from-purple-900/60 via-[#0A0A0A] to-blue-900/60 relative">
              {/* Subtle grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
              />
              {/* Subtle glow effects */}
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
            </div>
          )}

          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        </div>

        {/* Back button - always visible */}
        <Link
          href="/djs"
          className="absolute top-4 left-4 z-10 p-2.5 bg-black/60 backdrop-blur-md rounded-full hover:bg-black/80 transition-colors border border-white/10"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Share button */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${dj.name} on baseFM`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="absolute top-4 right-4 z-10 p-2.5 bg-black/60 backdrop-blur-md rounded-full hover:bg-black/80 transition-colors border border-white/10"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header - Professional Layout */}
        <div className="relative -mt-16 sm:-mt-20 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Avatar - Larger and more prominent */}
            <div className="relative flex-shrink-0">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-4 border-[#0A0A0A] bg-gradient-to-br from-purple-900/50 to-blue-900/50 shadow-2xl shadow-black/50 flex items-center justify-center">
                {hasAvatar ? (
                  <Image
                    src={dj.avatarUrl!}
                    alt={dj.name}
                    fill
                    unoptimized
                    onError={() => setAvatarError(true)}
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src={DEFAULT_AVATAR}
                    alt={dj.name}
                    fill
                    unoptimized
                    className="object-contain p-4"
                  />
                )}
              </div>
              {/* Live indicator on avatar if streaming */}
              {liveStream && (
                <div className="absolute -bottom-1 -right-1 px-2 py-1 bg-red-500 rounded-full flex items-center gap-1.5 border-2 border-[#0A0A0A]">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              )}
            </div>

            {/* Name, Badges & Actions */}
            <div className="flex-1 pt-2 sm:pt-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">{dj.name}</h1>
                {dj.isVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Verified
                  </span>
                )}
                {dj.isResident && (
                  <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full">
                    Resident
                  </span>
                )}
              </div>

              {/* Genres - Better styled */}
              {dj.genres && dj.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {dj.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1.5 bg-[#1A1A1A] text-[#999] text-xs font-medium rounded-lg border border-[#2A2A2A] hover:border-purple-500/30 transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons - More prominent */}
              <div className="flex items-center gap-3">
                {address && address.toLowerCase() !== dj.walletAddress.toLowerCase() && (
                  <button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                      isFollowing
                        ? 'bg-[#2A2A2A] text-[#F5F5F5] border border-[#444] hover:bg-[#333] hover:border-red-500/50 hover:text-red-400'
                        : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                    }`}
                  >
                    {isFollowLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : isFollowing ? (
                      'Following'
                    ) : (
                      'Follow'
                    )}
                  </button>
                )}
                <TipButton djWalletAddress={dj.walletAddress} djName={dj.name} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-[#1A1A1A] rounded-xl p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">
              {formatNumber(stats?.followerCount || 0)}
            </div>
            <div className="text-[#666] text-xs">Followers</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">
              {formatNumber(stats?.totalShows || dj.totalShows || 0)}
            </div>
            <div className="text-[#666] text-xs">Shows</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">
              {formatNumber(stats?.totalListeners || dj.totalListeners || 0)}
            </div>
            <div className="text-[#666] text-xs">Listeners</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">
              {(stats?.totalTipsEth || 0).toFixed(2)}
            </div>
            <div className="text-[#666] text-xs">ETH Tips</div>
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {socialLinks.map((link) => (
              <a
                key={link.icon}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] rounded-full text-[#888] text-sm hover:text-[#F5F5F5] hover:bg-[#2A2A2A] transition-colors"
              >
                <SocialIcon type={link.icon} />
                <span className="hidden sm:inline">{link.label}</span>
              </a>
            ))}
          </div>
        )}

        {/* Live Now Banner */}
        {liveStream && (
          <Link
            href={`/stream/${liveStream.id}`}
            className="block mb-6 bg-gradient-to-r from-red-900/40 to-red-600/20 rounded-xl p-4 border border-red-500/30 hover:border-red-500/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">Live Now</span>
                </span>
                <span className="text-[#F5F5F5] font-medium">{liveStream.title}</span>
              </div>
              <svg className="w-5 h-5 text-[#666] group-hover:text-[#888] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#1A1A1A] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('shows')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'shows'
                ? 'bg-[#2A2A2A] text-[#F5F5F5]'
                : 'text-[#888] hover:text-[#F5F5F5]'
            }`}
          >
            Shows
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-[#2A2A2A] text-[#F5F5F5]'
                : 'text-[#888] hover:text-[#F5F5F5]'
            }`}
          >
            About
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'shows' && (
          <div className="space-y-6">
            {/* Upcoming Shows */}
            {upcomingStreams.length > 0 && (
              <div>
                <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Upcoming
                </h2>
                <div className="space-y-2">
                  {upcomingStreams.map((stream) => (
                    <Link
                      key={stream.id}
                      href={`/stream/${stream.id}`}
                      className="flex items-center justify-between bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors"
                    >
                      <div>
                        <h3 className="text-[#F5F5F5] font-medium">{stream.title}</h3>
                        {stream.scheduledStartTime && (
                          <span className="text-[#888] text-sm">
                            {new Date(stream.scheduledStartTime).toLocaleString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Past Shows */}
            {pastStreams.length > 0 && (
              <div>
                <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3">
                  Past Shows
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {pastStreams.map((stream) => (
                    <div
                      key={stream.id}
                      className="bg-[#1A1A1A] rounded-xl overflow-hidden hover:ring-1 hover:ring-[#333] transition-all"
                    >
                      <div className="aspect-square bg-[#0A0A0A] relative flex items-center justify-center">
                        {stream.coverImageUrl ? (
                          <Image
                            src={stream.coverImageUrl}
                            alt={stream.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image
                              src="/logo.png"
                              alt="baseFM"
                              width={48}
                              height={48}
                              className="opacity-30 object-contain"
                            />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-[#F5F5F5] text-sm font-medium line-clamp-1">
                          {stream.title}
                        </h3>
                        <span className="text-[#666] text-xs">
                          {new Date(stream.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Shows */}
            {upcomingStreams.length === 0 && pastStreams.length === 0 && !liveStream && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#666]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <p className="text-[#888]">No shows yet</p>
                <p className="text-[#666] text-sm mt-1">Follow to get notified when they go live</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Bio */}
            {dj.bio ? (
              <div className="bg-[#1A1A1A] rounded-xl p-4">
                <h2 className="text-[#F5F5F5] font-semibold mb-3">About</h2>
                <p className="text-[#888] whitespace-pre-line leading-relaxed">{dj.bio}</p>
              </div>
            ) : (
              <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
                <p className="text-[#666]">No bio yet</p>
              </div>
            )}

            {/* Member Info */}
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <h2 className="text-[#F5F5F5] font-semibold mb-3">Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666]">Member since</span>
                  <span className="text-[#888]">
                    {new Date(stats?.memberSince || dj.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                {stats?.lastActive && (
                  <div className="flex justify-between">
                    <span className="text-[#666]">Last active</span>
                    <span className="text-[#888]">
                      {new Date(stats.lastActive).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {stats?.mixCount !== undefined && stats.mixCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#666]">Mixes uploaded</span>
                    <span className="text-[#888]">{stats.mixCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SocialIcon({ type }: { type: string }) {
  switch (type) {
    case 'twitter':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'farcaster':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.24 4H5.76A1.76 1.76 0 004 5.76v12.48A1.76 1.76 0 005.76 20h12.48A1.76 1.76 0 0020 18.24V5.76A1.76 1.76 0 0018.24 4zM12 15.36a3.36 3.36 0 110-6.72 3.36 3.36 0 010 6.72z" />
        </svg>
      );
    case 'soundcloud':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667z" />
        </svg>
      );
    case 'mixcloud':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.27 12c0 1.253-1.015 2.267-2.27 2.267A2.267 2.267 0 019.73 12c0-1.254 1.016-2.267 2.27-2.267 1.254 0 2.27 1.013 2.27 2.267z" />
        </svg>
      );
    case 'spotify':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      );
    case 'website':
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
  }
}
