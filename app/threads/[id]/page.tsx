'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Link from 'next/link';
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

export default function ThreadDetailPage({ params }: { params: { id: string } }) {
  const { address } = useAccount();
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchThread = useCallback(async () => {
    try {
      const url = new URL(`/api/threads/${params.id}`, window.location.origin);
      url.searchParams.set('replies', 'true');
      if (address) {
        url.searchParams.set('viewer', address);
      }

      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Thread not found');
        } else {
          setError('Failed to load thread');
        }
        return;
      }

      const data = await res.json();
      setThread(data.thread);
      setReplies(data.replies || []);
    } catch {
      setError('Failed to load thread');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, address]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const handleReply = async (content: string) => {
    if (!address) return;

    const res = await fetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorWallet: address,
        content,
        parentId: params.id,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to reply');
    }

    // Refresh thread to get new replies
    await fetchThread();
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

    const confirmed = window.confirm('Delete this?');
    if (!confirmed) return;

    await fetch(`/api/threads/${threadId}?wallet=${address}`, {
      method: 'DELETE',
    });

    // If deleting main thread, go back
    if (threadId === params.id) {
      window.history.back();
    } else {
      // Deleting a reply
      setReplies((prev) => prev.filter((t) => t.id !== threadId));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Back button skeleton */}
          <div className="h-8 w-16 bg-[#1A1A1A] rounded mb-4" />

          {/* Thread skeleton */}
          <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#333] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-[#333] rounded animate-pulse" />
                <div className="h-4 w-full bg-[#333] rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-[#333] rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-2">{error || 'Thread not found'}</h2>
          <Link href="/threads" className="text-purple-400 text-sm hover:underline">
            Back to Threads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back button */}
        <Link
          href="/threads"
          className="inline-flex items-center gap-1.5 text-[#888] hover:text-[#F5F5F5] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </Link>

        {/* Main thread */}
        <div className="mb-4">
          <ThreadCard
            thread={thread}
            currentWallet={address}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onDelete={handleDelete}
          />
        </div>

        {/* Reply composer */}
        {hasAccess && address && (
          <div className="mb-4">
            <ThreadComposer
              walletAddress={address}
              onSubmit={handleReply}
              placeholder="Post your reply..."
              parentId={params.id}
            />
          </div>
        )}

        {/* Replies header */}
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-[#888]">
            {replies.length > 0 ? `${replies.length} Replies` : 'Replies'}
          </h2>
        </div>

        {/* Replies */}
        {replies.length === 0 ? (
          <div className="text-center py-8 bg-[#1A1A1A] rounded-2xl">
            <p className="text-[#666] text-sm">No replies yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => (
              <ThreadCard
                key={reply.id}
                thread={reply}
                currentWallet={address}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onDelete={handleDelete}
                isCompact
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
