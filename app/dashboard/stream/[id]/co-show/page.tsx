'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useStream } from '@/hooks/useStream';
import { WalletConnect } from '@/components/WalletConnect';
import { CoShowStudio } from '@/components/CoShowStudio';
import Link from 'next/link';
import type { CoShow } from '@/types/co-show';

export default function CoShowPage({ params }: { params: { id: string } }) {
  const { address, isConnected } = useAccount();
  const { stream, isLoading: streamLoading } = useStream(params.id);
  const [coShow, setCoShow] = useState<CoShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoShow = useCallback(async () => {
    try {
      const res = await fetch(`/api/streams/${params.id}/co-show`);
      if (res.ok) {
        const data = await res.json();
        setCoShow(data.coShow || null);
      }
    } catch (err) {
      console.error('Failed to fetch co-show:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchCoShow();
  }, [fetchCoShow]);

  // Poll when pending to detect co-DJ joining
  useEffect(() => {
    if (coShow?.status !== 'pending') return;
    const interval = setInterval(fetchCoShow, 5000);
    return () => clearInterval(interval);
  }, [coShow?.status, fetchCoShow]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/streams/${params.id}/co-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          djWalletAddress: address,
          djName: stream?.djName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create co-show');
      setCoShow(data.coShow);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono">
        <h1 className="text-2xl font-bold text-white mb-4">Co-Show (B2B)</h1>
        <p className="text-zinc-400 mb-8">Connect your wallet to manage co-shows</p>
        <WalletConnect />
      </div>
    );
  }

  if (streamLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 font-mono">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/3" />
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center font-mono">
        <h1 className="text-2xl font-bold text-white mb-4">Stream Not Found</h1>
        <Link href="/dashboard" className="text-amber-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (stream.djWalletAddress.toLowerCase() !== address?.toLowerCase()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center font-mono">
        <h1 className="text-2xl font-bold text-white mb-4">Unauthorized</h1>
        <Link href="/dashboard" className="text-amber-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Active co-show — render studio
  if (coShow?.status === 'active') {
    return (
      <CoShowStudio
        coShow={coShow}
        role="host"
        walletAddress={address!}
        djName={stream.djName}
        inviteCode={coShow.inviteCode}
      />
    );
  }

  // Pending co-show — show invite
  if (coShow?.status === 'pending') {
    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/co-show/${coShow.inviteCode}`;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 font-mono">
        <Link
          href={`/dashboard/stream/${params.id}`}
          className="text-zinc-400 hover:text-white mb-6 inline-flex items-center gap-2 text-sm"
        >
          &larr; Back to Stream
        </Link>

        <div className="mt-6 border border-zinc-800 bg-zinc-950 rounded p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-lg font-bold uppercase tracking-tighter text-white">
              WAITING FOR CO-DJ TO CONNECT...
            </h2>
          </div>

          <p className="text-zinc-400 text-sm mb-4">
            Share this link with your co-DJ. Valid for 24 hours.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-4 mb-4">
            <code className="text-amber-400 text-sm break-all">{inviteUrl}</code>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteUrl);
            }}
            className="w-full py-3 bg-amber-400 text-black font-bold uppercase tracking-tighter rounded text-sm hover:bg-amber-300 transition-colors"
          >
            COPY INVITE LINK
          </button>
        </div>
      </div>
    );
  }

  // No co-show — create one
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-mono">
      <Link
        href={`/dashboard/stream/${params.id}`}
        className="text-zinc-400 hover:text-white mb-6 inline-flex items-center gap-2 text-sm"
      >
        &larr; Back to Stream
      </Link>

      <div className="mt-6 border border-zinc-800 bg-zinc-950 rounded p-6">
        <h2 className="text-xl font-bold uppercase tracking-tighter text-white mb-4">
          START A B2B CO-SHOW
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          Invite another DJ to share this stream. They get the same RTMP credentials and can take
          over when you hand off. Pirate radio style.
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full py-4 bg-amber-400 text-black font-bold uppercase tracking-tighter rounded text-sm hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? 'CREATING...' : 'CREATE CO-SHOW'}
        </button>
      </div>
    </div>
  );
}
