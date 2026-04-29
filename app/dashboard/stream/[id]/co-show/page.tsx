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
      <main className="min-h-screen bg-black text-white font-mono pb-20">
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-16 text-center space-y-6">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600">Co-Show (B2B)</div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase">Connect Wallet</h1>
          <p className="text-zinc-400 text-sm">Connect your wallet to manage co-shows.</p>
          <WalletConnect />
        </section>
      </main>
    );
  }

  if (streamLoading || loading) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20">
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-16">
          <div className="space-y-px">
            <div className="basefm-panel p-6 animate-pulse"><div className="h-8 bg-zinc-900 w-1/3 mb-4" /><div className="h-48 bg-zinc-900" /></div>
          </div>
        </section>
      </main>
    );
  }

  if (!stream) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20">
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Stream Not Found</h1>
          <Link href="/dashboard" className="text-[10px] uppercase tracking-widest text-orange-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (stream.djWalletAddress.toLowerCase() !== address?.toLowerCase()) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20">
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Unauthorized</h1>
          <Link href="/dashboard" className="text-[10px] uppercase tracking-widest text-orange-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </section>
      </main>
    );
  }

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

  if (coShow?.status === 'pending') {
    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/co-show/${coShow.inviteCode}`;
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20">
        <section className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <Link
            href={`/dashboard/stream/${params.id}`}
            className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-6 inline-block"
          >
            ← Back to Stream
          </Link>

          <div className="basefm-panel p-6 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 bg-orange-400 animate-pulse inline-block" />
              <div className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">
                Waiting for co-DJ to connect
              </div>
            </div>

            <p className="text-xs text-zinc-500 mb-4">
              Share this link with your co-DJ. Valid for 24 hours.
            </p>

            <div className="bg-black border border-zinc-800 p-4 mb-4">
              <code className="text-orange-400 text-xs font-mono break-all">{inviteUrl}</code>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl);
              }}
              className="w-full basefm-button-primary"
            >
              Copy Invite Link
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20">
      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <Link
          href={`/dashboard/stream/${params.id}`}
          className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-6 inline-block"
        >
          ← Back to Stream
        </Link>

        <div className="basefm-panel p-6 mt-6">
          <div className="text-[10px] uppercase tracking-widest text-orange-400 mb-3">Co-Show (B2B)</div>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tighter text-white mb-4">
            Start a B2B Co-Show
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed mb-6">
            Invite another DJ to share this stream. They get the same RTMP credentials and can take
            over when you hand off. Pirate radio style.
          </p>

          {error && (
            <div className="border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-300 mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full basefm-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Co-Show'}
          </button>
        </div>
      </section>
    </main>
  );
}
