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
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-3 active:scale-[0.98] transition-transform">
      <div className="flex items-center gap-3">
        {/* OnchainKit Avatar */}
        <Identity
          address={member.walletAddress as `0x${string}`}
          className="!bg-transparent"
        >
          <Avatar className="w-11 h-11 rounded-full flex-shrink-0" />
        </Identity>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
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

        {/* Chevron */}
        <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
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
        {/* Header */}
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
        ) : members.length === 0 ? (
          <div className="text-center py-12 bg-[#1A1A1A] rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-[#F5F5F5] mb-1">No members yet</h3>
            <p className="text-[#888] text-xs">Be the first to join!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
