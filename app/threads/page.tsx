'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import { ThreadCard } from '@/components/threads/ThreadCard';
import { ThreadComposer } from '@/components/threads/ThreadComposer';
import { Thread } from '@/types/thread';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

const balanceOfAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function ThreadsPage() {
  const { address, isConnected } = useAccount();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

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

  const hasAccess = tokenBalance >= DJ_TOKEN_CONFIG.requiredAmount;

  const fetchThreads = useCallback(async () => {
    try {
      const url = new URL('/api/threads', window.location.origin);
      url.searchParams.set('parentId', 'null'); // Top-level threads only
      url.searchParams.set('limit', '50');
      if (address) {
        url.searchParams.set('viewer', address);
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setThreads(data.threads || []);
    } catch (err) {
      setError('Failed to load threads');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleCreateThread = async (content: string) => {
    if (!address) return;

    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorWallet: address,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show user-friendly error
        if (res.status === 403 && data.details) {
          setPostError(`Token required: ${data.details}`);
        } else {
          setPostError(data.error || 'Failed to create thread');
        }
        throw new Error(data.error || 'Failed to create thread');
      }

      // Clear any error on success
      setPostError(null);

      // Refresh threads
      await fetchThreads();
    } catch (err) {
      console.error('Failed to post thread:', err);
      throw err;
    }
  };

  const handleLike = async (threadId: string) => {
    if (!address) return;

    await fetch(`/api/threads/${threadId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: address }),
    });
  };

  const handleUnlike = async (threadId: string) => {
    if (!address) return;

    await fetch(`/api/threads/${threadId}/like?wallet=${address}`, {
      method: 'DELETE',
    });
  };

  const handleDelete = async (threadId: string) => {
    if (!address) return;

    const confirmed = window.confirm('Delete this thread?');
    if (!confirmed) return;

    await fetch(`/api/threads/${threadId}?wallet=${address}`, {
      method: 'DELETE',
    });

    setThreads((prev) => prev.filter((t) => t.id !== threadId));
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-1">Threads</h1>
          <p className="text-xs text-[#888]">Community conversations</p>
        </div>

        {/* Token Gate */}
        {!isConnected ? (
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 rounded-2xl p-4 mb-5">
            <h3 className="text-[#F5F5F5] font-semibold text-sm mb-1">Connect to Join</h3>
            <p className="text-xs text-[#888] mb-3">
              Hold {DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()} {DJ_TOKEN_CONFIG.symbol} to post
            </p>
            <WalletConnect />
          </div>
        ) : !hasAccess ? (
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
                  You have <span className="text-yellow-400">{tokenBalance.toLocaleString()}</span>. Need{' '}
                  {DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()} to post.
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
        ) : address ? (
          /* Composer */
          <div className="mb-5">
            <ThreadComposer
              walletAddress={address}
              onSubmit={handleCreateThread}
              placeholder="Share with the community..."
            />
            {postError && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-red-400 text-xs">{postError}</p>
                  <button
                    onClick={() => setPostError(null)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Navigation tabs */}
        <div className="flex gap-1 mb-4 border-b border-[#1A1A1A]">
          <button className="px-4 py-2.5 text-sm font-medium text-purple-400 border-b-2 border-purple-400">
            For You
          </button>
          <Link
            href="/community"
            className="px-4 py-2.5 text-sm font-medium text-[#666] hover:text-[#888] transition-colors"
          >
            Members
          </Link>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-2xl p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#333] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-[#333] rounded animate-pulse" />
                    <div className="h-4 w-full bg-[#333] rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-[#333] rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={fetchThreads}
              className="mt-4 text-purple-400 text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">No threads yet</h3>
            <p className="text-[#888] text-sm mb-4">Be the first to start a conversation!</p>
            {hasAccess && (
              <p className="text-xs text-[#666]">Use the composer above to post</p>
            )}
          </div>
        ) : (
          /* Thread feed */
          <div className="space-y-3">
            {threads.map((thread) => (
              <Link key={thread.id} href={`/threads/${thread.id}`}>
                <ThreadCard
                  thread={thread}
                  currentWallet={address}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onDelete={handleDelete}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
