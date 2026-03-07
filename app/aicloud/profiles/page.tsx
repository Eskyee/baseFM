'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { BankrProfile, BankrProfileFilter } from '@/lib/bankr';

interface ProfilesResponse {
  profiles: BankrProfile[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const FILTERS: { value: BankrProfileFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'agents', label: 'Agents' },
  { value: 'projects', label: 'Projects' },
  { value: 'top-traders', label: 'Top Traders' },
  { value: 'new', label: 'New' },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatPnl(pnl: number | undefined): string {
  if (pnl === undefined) return '-';
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}${pnl.toFixed(1)}%`;
}

function ProfileCard({ profile }: { profile: BankrProfile }) {
  // Generate gradient avatar if no avatarUrl
  const avatarGradient = `linear-gradient(135deg, hsl(${
    profile.handle.charCodeAt(0) * 10
  }, 70%, 50%), hsl(${profile.handle.charCodeAt(1) * 10}, 70%, 40%))`;

  const typeColors = {
    agent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    project: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    user: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="bg-base-dark/50 border border-white/10 rounded-xl p-4 hover:border-base-blue/50 transition-all">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
          style={{
            background: profile.avatarUrl
              ? `url(${profile.avatarUrl}) center/cover`
              : avatarGradient,
          }}
        >
          {!profile.avatarUrl && profile.displayName.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white truncate">
              {profile.displayName}
            </span>
            {profile.verified && (
              <svg
                className="w-4 h-4 text-base-blue flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[profile.type]}`}
            >
              {profile.type}
            </span>
          </div>
          <p className="text-sm text-gray-400">@{profile.handle}</p>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-gray-300 mt-3 line-clamp-2">{profile.bio}</p>
      )}

      {/* Tags */}
      {profile.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-gray-400"
            >
              #{tag}
            </span>
          ))}
          {profile.tags.length > 4 && (
            <span className="text-xs text-gray-500">
              +{profile.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/5">
        <div className="text-center">
          <p className="text-sm font-semibold text-white">
            {formatNumber(profile.stats.trades)}
          </p>
          <p className="text-xs text-gray-500">Trades</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">
            {formatNumber(profile.stats.followers)}
          </p>
          <p className="text-xs text-gray-500">Followers</p>
        </div>
        <div className="text-center">
          <p
            className={`text-sm font-semibold ${
              (profile.stats.pnlPercent || 0) >= 0
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {formatPnl(profile.stats.pnlPercent)}
          </p>
          <p className="text-xs text-gray-500">PnL</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">
            {profile.stats.winRate ? `${profile.stats.winRate}%` : '-'}
          </p>
          <p className="text-xs text-gray-500">Win Rate</p>
        </div>
      </div>

      {/* Social Links */}
      {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
          {profile.socialLinks.twitter && (
            <a
              href={`https://twitter.com/${profile.socialLinks.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
          {profile.socialLinks.farcaster && (
            <a
              href={`https://warpcast.com/${profile.socialLinks.farcaster}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.24 5.37H5.76v13.26h12.48V5.37zm-9.6 10.35V8.28h2.4v2.64h2.4V8.28h2.4v7.44h-2.4v-2.64h-2.4v2.64h-2.4z" />
              </svg>
            </a>
          )}
          {profile.socialLinks.telegram && (
            <a
              href={`https://t.me/${profile.socialLinks.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </a>
          )}
          {profile.socialLinks.website && (
            <a
              href={profile.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="bg-base-dark/50 border border-white/10 rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-white/10" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-white/10 rounded mb-2" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
      </div>
      <div className="h-10 bg-white/10 rounded mt-3" />
      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <div className="h-4 w-10 bg-white/10 rounded mx-auto mb-1" />
            <div className="h-3 w-12 bg-white/10 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BankrProfilesPage() {
  const [profiles, setProfiles] = useState<BankrProfile[]>([]);
  const [filter, setFilter] = useState<BankrProfileFilter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProfiles = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          filter,
          page: pageNum.toString(),
          limit: '20',
        });

        if (search.trim()) {
          params.set('search', search.trim());
        }

        const response = await fetch(`/api/bankr/profiles?${params}`);
        const data: ProfilesResponse = await response.json();

        if (append) {
          setProfiles((prev) => [...prev, ...data.profiles]);
        } else {
          setProfiles(data.profiles);
        }

        setHasMore(data.hasMore);
        setTotal(data.total);
        setPage(pageNum);
      } catch (error) {
        console.error('Failed to fetch profiles:', error);
      } finally {
        setLoading(false);
      }
    },
    [filter, search]
  );

  useEffect(() => {
    fetchProfiles(1, false);
  }, [fetchProfiles]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProfiles(page + 1, true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-dark to-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/aicloud" className="hover:text-white transition-colors">
              aicloud
            </Link>
            <span>/</span>
            <span className="text-white">profiles</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bankr Ecosystem
          </h1>
          <p className="text-gray-400">
            Discover agents and projects building in the Bankr ecosystem
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search profiles, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-base-blue/50"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? 'bg-base-blue text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-400 mb-4">
            {total} profile{total !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Profiles Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {loading && profiles.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <ProfileSkeleton key={i} />)
            : profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
        </div>

        {/* Empty state */}
        {!loading && profiles.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No profiles found
            </h3>
            <p className="text-gray-400 text-sm">
              Try adjusting your search or filter
            </p>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {/* Navigation links */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/aicloud"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              Create Agent
            </Link>
            <Link
              href="/aicloud/feed"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              Ravefeed
            </Link>
            <Link
              href="/aicloud/dashboard"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              My Agents
            </Link>
            <Link
              href="/trading"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              Trading
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
