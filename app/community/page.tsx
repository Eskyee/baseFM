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
  if (balance >= 1000000) return `${(balance / 1000000).toFixed(1)}M`;
  if (balance >= 1000) return `${(balance / 1000).toFixed(1)}K`;
  return balance.toLocaleString();
}

function getTierLabel(balance: number): string | null {
  if (balance >= 1000000000) return 'Whale';
  if (balance >= 100000) return 'OG';
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

function MemberCard({
  member,
  isExpanded,
  onToggle,
}: {
  member: Member;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const tierLabel = getTierLabel(member.tokenBalance);

  return (
    <button
      type="button"
      className="basefm-panel text-left hover:bg-zinc-950 transition-colors"
      onClick={onToggle}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Identity address={member.walletAddress as `0x${string}`} className="!bg-transparent">
            <Avatar className="w-12 h-12 border border-zinc-900 flex-shrink-0" />
          </Identity>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Identity address={member.walletAddress as `0x${string}`} className="!bg-transparent">
                <Name className="text-white text-sm font-bold uppercase tracking-wider truncate" />
              </Identity>
              {member.isVerified ? <span className="basefm-kicker text-blue-500">Verified</span> : null}
              {tierLabel ? <span className="basefm-kicker text-zinc-500">{tierLabel}</span> : null}
            </div>

            <div className="text-xs text-zinc-400">
              {formatBalance(member.tokenBalance)} {DJ_TOKEN_CONFIG.symbol}
              {member.showsAttended > 0 ? ` · ${member.showsAttended} shows` : ''}
            </div>
          </div>

          <div className="text-[10px] uppercase tracking-widest text-zinc-600">
            {isExpanded ? 'Open' : 'More'}
          </div>
        </div>

        {isExpanded ? (
          <div className="mt-4 pt-4 border-t border-zinc-900">
            {member.bio ? <p className="text-sm text-zinc-400 leading-relaxed mb-4">{member.bio}</p> : null}
            <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-600 mb-4">
              <span>Joined {formatTimeAgo(member.createdAt)}</span>
              {member.favoriteGenres.length > 0 ? <span>{member.favoriteGenres.slice(0, 3).join(' · ')}</span> : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {member.twitterUrl ? (
                <a
                  href={member.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="basefm-button-secondary !px-4 !py-2"
                >
                  X
                </a>
              ) : null}
              {member.farcasterUrl ? (
                <a
                  href={member.farcasterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="basefm-button-secondary !px-4 !py-2"
                >
                  Farcaster
                </a>
              ) : null}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  navigator.clipboard.writeText(member.walletAddress);
                }}
                className="basefm-button-secondary !px-4 !py-2"
              >
                Copy Wallet
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </button>
  );
}

export default function CommunityPage() {
  const { address, isConnected } = useAccount();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<FilterTier>('all');
  const [sortBy, setSortBy] = useState<SortOption>('balance');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

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

  const filteredMembers = useMemo(() => {
    let result = [...members];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((member) =>
        member.walletAddress.toLowerCase().includes(query) ||
        member.displayName?.toLowerCase().includes(query) ||
        member.ensName?.toLowerCase().includes(query) ||
        member.baseName?.toLowerCase().includes(query)
      );
    }

    if (filterTier === 'whale') {
      result = result.filter((member) => member.tokenBalance >= 1000000000);
    } else if (filterTier === 'og') {
      result = result.filter((member) => member.tokenBalance >= 100000 && member.tokenBalance < 1000000000);
    } else if (filterTier === 'member') {
      result = result.filter((member) => member.tokenBalance < 100000);
    }

    if (sortBy === 'balance') {
      result.sort((a, b) => b.tokenBalance - a.tokenBalance);
    } else if (sortBy === 'shows') {
      result.sort((a, b) => b.showsAttended - a.showsAttended);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [members, searchQuery, filterTier, sortBy]);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/community');
        if (!response.ok) {
          throw new Error('Failed to fetch community');
        }
        const data = await response.json();
        setMembers(data.members || []);

        if (address) {
          const found = data.members.find(
            (member: Member) => member.walletAddress.toLowerCase() === address.toLowerCase()
          );
          setIsMember(Boolean(found));
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
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
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();
      if (!response.ok) {
        setJoinError(data.details || data.error || 'Failed to join');
        return;
      }

      const refreshResponse = await fetch('/api/community');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setMembers(refreshData.members || []);
      }

      setIsMember(true);
    } catch {
      setJoinError('Failed to join community');
    } finally {
      setIsJoining(false);
    }
  };

  const totalBalance = members.reduce((sum, member) => sum + member.tokenBalance, 0);
  const verifiedCount = members.filter((member) => member.isVerified).length;
  const totalShows = members.reduce((sum, member) => sum + member.showsAttended, 0);

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Community</span>
            <span className="basefm-kicker text-zinc-500">{DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()}+ {DJ_TOKEN_CONFIG.symbol}</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Station community.
              <br />
              <span className="text-zinc-700">Token holders behind the culture.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              This is the wallet-native layer around baseFM. Hold the station token, join the member list, and carry that identity through the wider Agentbot-powered live system.
            </p>
          </div>

          {!isConnected ? (
            <div className="basefm-panel p-6">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Connect to check access</div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                Connect a Base wallet to see if you qualify for the community gate.
              </p>
              <WalletConnect />
            </div>
          ) : !hasEnoughTokens ? (
            <div className="basefm-panel p-6">
              <div className="text-[10px] uppercase tracking-widest text-yellow-400 mb-3">More tokens needed</div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                You currently hold {tokenBalance.toLocaleString()} {DJ_TOKEN_CONFIG.symbol}. The community path opens at {DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`https://app.uniswap.org/swap?chain=base&outputCurrency=${DJ_TOKEN_CONFIG.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="basefm-button-primary"
                >
                  Get {DJ_TOKEN_CONFIG.symbol}
                </Link>
              </div>
            </div>
          ) : !isMember ? (
            <div className="basefm-panel p-6">
              <div className="text-[10px] uppercase tracking-widest text-blue-500 mb-3">Eligible</div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                You hold {tokenBalance.toLocaleString()} {DJ_TOKEN_CONFIG.symbol}. Join the community to appear in the member list and unlock the social layer.
              </p>
              {joinError ? <div className="border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 mb-4">{joinError}</div> : null}
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="basefm-button-primary disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isJoining ? 'Joining...' : 'Join Community'}
              </button>
            </div>
          ) : (
            <div className="basefm-panel p-6">
              <div className="text-[10px] uppercase tracking-widest text-green-400 mb-3">Member active</div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                You are in. Your wallet sits on the community layer and the wider Agentbot/baseFM station path.
              </p>
            </div>
          )}

          <div className="grid gap-px bg-zinc-900 sm:grid-cols-4">
            {[
              ['Members', `${members.length}`],
              ['Total token', formatBalance(totalBalance)],
              ['Verified', `${verifiedCount}`],
              ['Shows', `${totalShows}`],
            ].map(([label, value]) => (
              <div key={label} className="bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{label}</div>
                <div className="text-xl font-bold tracking-tight text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20 space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Member list</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                Holder roster.
                <br />
                <span className="text-zinc-700">Search, sort, and inspect.</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search members"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full sm:w-64 bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { value: 'all', label: 'All' },
              { value: 'whale', label: 'Whale' },
              { value: 'og', label: 'OG' },
              { value: 'member', label: 'Member' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterTier(option.value as FilterTier)}
                className={filterTier === option.value ? 'basefm-button-primary' : 'basefm-button-secondary'}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { value: 'balance', label: 'Sort: Balance' },
              { value: 'shows', label: 'Sort: Shows' },
              { value: 'recent', label: 'Sort: Recent' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as SortOption)}
                className={sortBy === option.value ? 'basefm-button-primary' : 'basefm-button-secondary'}
              >
                {option.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-px bg-zinc-900">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-black p-5 animate-pulse">
                  <div className="h-4 w-40 bg-zinc-900 mb-3" />
                  <div className="h-3 w-24 bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="basefm-panel p-8 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">No matches</div>
              <p className="text-sm text-zinc-400">
                {searchQuery || filterTier !== 'all' ? 'Try a broader search or reset the filters.' : 'No members have joined yet.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isExpanded={expandedMemberId === member.id}
                  onToggle={() => setExpandedMemberId(expandedMemberId === member.id ? null : member.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
