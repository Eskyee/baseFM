'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';
import { Member } from '@/types/member';

const balanceOfAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type FilterTier = 'all' | 'whale' | 'og' | 'member';
type SortOption = 'balance' | 'shows' | 'recent';

function formatBalance(balance: number): string {
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(1)}M`;
  }
  if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)}K`;
  }
  return balance.toLocaleString();
}

function getTierBadge(balance: number): { label: string; color: string } | null {
  if (balance >= 1000000000) return { label: 'Whale', color: 'bg-purple-500/20 text-purple-400' };
  if (balance >= 100000) return { label: 'OG', color: 'bg-blue-500/20 text-blue-400' };
  return null;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function MemberCard({ member, isExpanded, onToggle }: {
  member: Member;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const tierBadge = getTierBadge(member.tokenBalance);

  return (
    <div
      className="bg-[#1A1A1A] rounded-2xl p-3 active:scale-[0.99] transition-all cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <Identity
          address={member.walletAddress as `0x${string}`}
          className="!bg-transparent"
        >
          <Avatar className="w-11 h-11 rounded-full flex-shrink-0" />
        </Identity>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Identity
              address={member.walletAddress as `0x${string}`}
              className="!bg-transparent"
            >
              <Name className="text-[#F5F5F5] font-medium text-sm truncate" />
            </Identity>
            {member.isVerified && (
              <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
            {tierBadge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tierBadge.color}`}>
                {tierBadge.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#666]">
            <span className="text-purple-400 font-medium">{formatBalance(member.tokenBalance)}</span>
            <span>{DJ_TOKEN_CONFIG.symbol}</span>
            {member.showsAttended > 0 && (
              <>
                <span>·</span>
                <span>{member.showsAttended} shows</span>
              </>
            )}
          </div>
        </div>

        <svg
          className={`w-4 h-4 text-[#666] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#333]">
          {member.bio && (
            <p className="text-xs text-[#888] mb-3">{member.bio}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Joined date */}
            <span className="text-[10px] text-[#666]">
              Joined {formatTimeAgo(member.createdAt)}
            </span>

            {/* Social links */}
            <div className="flex items-center gap-2 ml-auto">
              {member.twitterUrl && (
                <a
                  href={member.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#444] transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {member.farcasterUrl && (
                <a
                  href={member.farcasterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#444] transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </a>
              )}
              {/* Copy wallet address */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(member.walletAddress);
                }}
                className="w-7 h-7 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#444] transition-colors"
                title="Copy wallet address"
              >
                <svg className="w-3.5 h-3.5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  const { address, isConnected } = useAccount();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<FilterTier>('all');
  const [sortBy, setSortBy] = useState<SortOption>('balance');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Check token balance
  const { data: balanceData } = useReadContract({
    address: DJ_TOKEN_CONFIG.address,
    abi: balanceOfAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const tokenBalance = balanceData
    ? Number(balanceData / BigInt(10 ** DJ_TOKEN_CONFIG.decimals))
    : 0;

  const hasEnoughTokens = tokenBalance >= DJ_TOKEN_CONFIG.requiredAmount;

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((m) =>
        m.walletAddress.toLowerCase().includes(query) ||
        m.displayName?.toLowerCase().includes(query) ||
        m.ensName?.toLowerCase().includes(query) ||
        m.baseName?.toLowerCase().includes(query)
      );
    }

    // Tier filter
    if (filterTier === 'whale') {
      result = result.filter((m) => m.tokenBalance >= 1000000000);
    } else if (filterTier === 'og') {
      result = result.filter((m) => m.tokenBalance >= 100000 && m.tokenBalance < 1000000000);
    } else if (filterTier === 'member') {
      result = result.filter((m) => m.tokenBalance < 100000);
    }

    // Sort
    if (sortBy === 'balance') {
      result.sort((a, b) => b.tokenBalance - a.tokenBalance);
    } else if (sortBy === 'shows') {
      result.sort((a, b) => b.showsAttended - a.showsAttended);
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [members, searchQuery, filterTier, sortBy]);

  // Recent joins (last 7 days)
  const recentJoins = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return members
      .filter((m) => new Date(m.createdAt) > weekAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [members]);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch('/api/community');
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);

          // Check if current user is a member
          if (address) {
            const found = data.members.find(
              (m: Member) => m.walletAddress.toLowerCase() === address.toLowerCase()
            );
            setIsMember(!!found);
          }
        }
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, [address]);

  const handleJoin = async () => {
    if (!address) return;

    setIsJoining(true);
    setJoinError(null);

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Join error response:', data);
        setJoinError(data.details || data.error || 'Failed to join');
        return;
      }

      // Refresh members list
      const refreshRes = await fetch('/api/community');
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setMembers(refreshData.members || []);
      }

      setIsMember(true);
    } catch (err) {
      setJoinError('Failed to join community');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back + Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#888] hover:text-[#F5F5F5] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </Link>
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-1">
            Community
          </h1>
          <p className="text-xs text-[#888]">
            {DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()}+ {DJ_TOKEN_CONFIG.symbol} holders
          </p>
        </div>

        {/* Token Gate Banner */}
        {!isConnected ? (
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 rounded-2xl p-4 mb-5">
            <h3 className="text-[#F5F5F5] font-semibold text-sm mb-1">Connect to Join</h3>
            <p className="text-xs text-[#888] mb-3">
              Hold {DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()} {DJ_TOKEN_CONFIG.symbol} to access
            </p>
            <WalletConnect />
          </div>
        ) : !hasEnoughTokens ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#F5F5F5] font-semibold text-sm mb-0.5">More Tokens Needed</h3>
                <p className="text-xs text-[#888] mb-2">
                  You have <span className="text-yellow-400">{tokenBalance.toLocaleString()}</span>. Need {DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()}.
                </p>
                <Link
                  href={`https://app.uniswap.org/swap?chain=base&outputCurrency=${DJ_TOKEN_CONFIG.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400"
                >
                  Get {DJ_TOKEN_CONFIG.symbol} →
                </Link>
              </div>
            </div>
          </div>
        ) : !isMember ? (
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 rounded-2xl p-4 mb-5">
            <h3 className="text-[#F5F5F5] font-semibold text-sm mb-1">You&apos;re Eligible!</h3>
            <p className="text-xs text-[#888] mb-3">
              You hold <span className="text-purple-400">{tokenBalance.toLocaleString()}</span> {DJ_TOKEN_CONFIG.symbol}
            </p>
            {joinError && (
              <p className="text-xs text-red-400 mb-2">{joinError}</p>
            )}
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {isJoining ? 'Joining...' : 'Join Community'}
            </button>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 mb-5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-green-400 text-xs font-medium">
                Member · {tokenBalance.toLocaleString()} {DJ_TOKEN_CONFIG.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="bg-[#1A1A1A] rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-[#F5F5F5]">{members.length}</div>
            <div className="text-xs text-[#888]">Members</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-purple-400">
              {formatBalance(members.reduce((sum, m) => sum + m.tokenBalance, 0))}
            </div>
            <div className="text-xs text-[#888]">{DJ_TOKEN_CONFIG.symbol}</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-[#F5F5F5]">
              {members.filter(m => m.isVerified).length}
            </div>
            <div className="text-xs text-[#888]">Verified</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-[#F5F5F5]">
              {members.reduce((sum, m) => sum + m.showsAttended, 0)}
            </div>
            <div className="text-xs text-[#888]">Shows</div>
          </div>
        </div>

        {/* Recent Joins */}
        {recentJoins.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-[#888] mb-3">RECENT JOINS</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {recentJoins.map((member) => (
                <div
                  key={member.id}
                  className="flex-shrink-0 bg-[#1A1A1A] rounded-xl p-2 flex items-center gap-2"
                >
                  <Identity
                    address={member.walletAddress as `0x${string}`}
                    className="!bg-transparent"
                  >
                    <Avatar className="w-8 h-8 rounded-full" />
                  </Identity>
                  <div className="min-w-0">
                    <Identity
                      address={member.walletAddress as `0x${string}`}
                      className="!bg-transparent"
                    >
                      <Name className="text-[#F5F5F5] text-xs font-medium truncate max-w-[80px]" />
                    </Identity>
                    <p className="text-[10px] text-[#666]">{formatTimeAgo(member.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#666] focus:outline-none focus:border-purple-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#888]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#F5F5F5]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {(filterTier !== 'all' || sortBy !== 'balance') && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </button>
            <span className="text-xs text-[#666]">
              {filteredMembers.length} of {members.length}
            </span>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="bg-[#1A1A1A] rounded-xl p-3 space-y-3">
              {/* Tier Filter */}
              <div>
                <p className="text-xs text-[#666] mb-2">Tier</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'whale', label: 'Whale (1B+)' },
                    { value: 'og', label: 'OG (100K+)' },
                    { value: 'member', label: 'Member' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterTier(option.value as FilterTier)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        filterTier === option.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#333] text-[#888] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-xs text-[#666] mb-2">Sort by</p>
                <div className="flex gap-2">
                  {[
                    { value: 'balance', label: 'Balance' },
                    { value: 'shows', label: 'Shows' },
                    { value: 'recent', label: 'Recent' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as SortOption)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        sortBy === option.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#333] text-[#888] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Members List */}
        <h2 className="text-sm font-semibold text-[#888] mb-3">
          TOKEN HOLDERS
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#333] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-[#333] rounded animate-pulse" />
                    <div className="h-3 w-32 bg-[#333] rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 bg-[#1A1A1A] rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-[#F5F5F5] mb-1">
              {searchQuery || filterTier !== 'all' ? 'No matches found' : 'No members yet'}
            </h3>
            <p className="text-[#888] text-xs">
              {searchQuery || filterTier !== 'all' ? 'Try adjusting your filters' : 'Be the first to join!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isExpanded={expandedMemberId === member.id}
                onToggle={() => setExpandedMemberId(
                  expandedMemberId === member.id ? null : member.id
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
