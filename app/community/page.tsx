'use client';

import { useState, useEffect } from 'react';
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

function formatBalance(balance: number): string {
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(1)}M`;
  }
  if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)}K`;
  }
  return balance.toLocaleString();
}

function MemberCard({ member }: { member: Member }) {
  const displayName = member.baseName || member.ensName || member.displayName ||
    `${member.walletAddress.slice(0, 6)}...${member.walletAddress.slice(-4)}`;

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors">
      <div className="flex items-center gap-4">
        {/* OnchainKit Avatar */}
        <Identity
          address={member.walletAddress as `0x${string}`}
          className="!bg-transparent"
        >
          <Avatar className="w-14 h-14 rounded-full" />
        </Identity>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Identity
              address={member.walletAddress as `0x${string}`}
              className="!bg-transparent"
            >
              <Name className="text-[#F5F5F5] font-medium truncate" />
            </Identity>
            {member.isVerified && (
              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>

          {member.bio && (
            <p className="text-sm text-[#888] line-clamp-1 mt-1">{member.bio}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-[#666]">
            <span className="flex items-center gap-1">
              <span className="text-purple-400">{formatBalance(member.tokenBalance)}</span>
              <span>{DJ_TOKEN_CONFIG.symbol}</span>
            </span>
            {member.showsAttended > 0 && (
              <span>{member.showsAttended} shows</span>
            )}
          </div>
        </div>

        {/* Social links */}
        <div className="flex gap-2">
          {member.twitterUrl && (
            <Link
              href={member.twitterUrl}
              target="_blank"
              className="p-2 rounded-lg text-[#888] hover:text-[#F5F5F5] hover:bg-[#333] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
          )}
          {member.farcasterUrl && (
            <Link
              href={member.farcasterUrl}
              target="_blank"
              className="p-2 rounded-lg text-[#888] hover:text-[#F5F5F5] hover:bg-[#333] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </Link>
          )}
        </div>
      </div>
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
        setJoinError(data.error || 'Failed to join');
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-2">
            Community
          </h1>
          <p className="text-[#888]">
            Token holders with {DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()}+ {DJ_TOKEN_CONFIG.symbol}
          </p>
        </div>

        {/* Token Gate Banner */}
        {!isConnected ? (
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-[#F5F5F5] font-semibold mb-1">Connect to Join</h3>
                <p className="text-sm text-[#888]">
                  Hold {DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()} {DJ_TOKEN_CONFIG.symbol} tokens to access the community
                </p>
              </div>
              <WalletConnect />
            </div>
          </div>
        ) : !hasEnoughTokens ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[#F5F5F5] font-semibold mb-1">More Tokens Needed</h3>
                <p className="text-sm text-[#888] mb-2">
                  You have <span className="text-yellow-400">{tokenBalance.toLocaleString()}</span> {DJ_TOKEN_CONFIG.symbol}.
                  Need {DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()} to join.
                </p>
                <Link
                  href={`https://app.uniswap.org/swap?chain=base&outputCurrency=${DJ_TOKEN_CONFIG.address}`}
                  target="_blank"
                  className="text-sm text-purple-400 hover:underline"
                >
                  Get {DJ_TOKEN_CONFIG.symbol} on Uniswap →
                </Link>
              </div>
            </div>
          </div>
        ) : !isMember ? (
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-[#F5F5F5] font-semibold mb-1">You&apos;re Eligible!</h3>
                <p className="text-sm text-[#888]">
                  You hold <span className="text-purple-400">{tokenBalance.toLocaleString()}</span> {DJ_TOKEN_CONFIG.symbol}.
                  Join the community directory!
                </p>
                {joinError && (
                  <p className="text-sm text-red-400 mt-2">{joinError}</p>
                )}
              </div>
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                {isJoining ? 'Joining...' : 'Join Community'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-green-400 text-sm font-medium">
                You&apos;re a community member with {tokenBalance.toLocaleString()} {DJ_TOKEN_CONFIG.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">{members.length}</div>
            <div className="text-sm text-[#888]">Members</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formatBalance(members.reduce((sum, m) => sum + m.tokenBalance, 0))}
            </div>
            <div className="text-sm text-[#888]">Total {DJ_TOKEN_CONFIG.symbol}</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">
              {members.filter(m => m.isVerified).length}
            </div>
            <div className="text-sm text-[#888]">Verified</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">
              {members.reduce((sum, m) => sum + m.showsAttended, 0)}
            </div>
            <div className="text-sm text-[#888]">Shows Attended</div>
          </div>
        </div>

        {/* Members List */}
        <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">
          Token Holders
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 skeleton rounded" />
                    <div className="h-4 w-48 skeleton rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-xl">
            <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#F5F5F5] mb-2">No members yet</h3>
            <p className="text-[#888] text-sm">Be the first to join the community!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
