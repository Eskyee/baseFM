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
  const [copied, setCopied] = useState(false);

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

  useEffect(() => { fetchCoShow(); }, [fetchCoShow]);

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
        body: JSON.stringify({ djWalletAddress: address, djName: stream?.djName }),
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

  const copyInvite = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Not connected ───────────────────────────────────────────────
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="basefm-kicker text-amber-400">Co-Show</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter uppercase leading-[0.92]">
              Connect wallet.
            </h1>
            <p className="text-sm text-zinc-400">Connect your wallet to manage co-shows.</p>
            <WalletConnect />
          </div>
        </section>
      </main>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────
  if (streamLoading || loading) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-zinc-900" />
            <div className="h-64 bg-zinc-900" />
          </div>
        </section>
      </main>
    );
  }

  // ── Not found ───────────────────────────────────────────────────
  if (!stream) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">Error</div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">Stream Not Found</h1>
            <Link href="/dashboard" className="inline-block text-[10px] uppercase tracking-widest text-blue-500 border border-blue-500/30 px-4 py-2 hover:bg-blue-500/10 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ── Unauthorized ────────────────────────────────────────────────
  if (stream.djWalletAddress.toLowerCase() !== address?.toLowerCase()) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-red-400">Unauthorized</div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">Not Your Stream</h1>
            <Link href="/dashboard" className="inline-block text-[10px] uppercase tracking-widest text-blue-500 border border-blue-500/30 px-4 py-2 hover:bg-blue-500/10 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ── Active co-show — render studio ──────────────────────────────
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

  const inviteUrl = coShow ? `${typeof window !== 'undefined' ? window.location.origin : ''}/co-show/${coShow.inviteCode}` : '';

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl space-y-6">
          <Link href={`/dashboard/stream/${params.id}`} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Stream
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-amber-400">Co-Show</span>
            <span className="basefm-kicker text-zinc-500">B2B</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              {coShow?.status === 'pending' ? 'Waiting for co-DJ.' : 'Start a B2B co-show.'}
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              {coShow?.status === 'pending'
                ? 'Share the invite link below. Valid for 24 hours.'
                : 'Invite another DJ to share this stream. They get the same RTMP credentials and can take over when you hand off. Pirate radio style.'}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="max-w-3xl space-y-px">
            {error && (
              <div className="border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Pending — show invite */}
            {coShow?.status === 'pending' && (
              <>
                <div className="border border-zinc-800 bg-zinc-950 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-amber-400">Waiting for co-DJ to connect</span>
                  </div>

                  <div className="border border-zinc-800 bg-black p-4 mb-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Invite Link</div>
                    <code className="block text-xs text-amber-400 break-all select-all">{inviteUrl}</code>
                  </div>

                  <button onClick={() => copyInvite(inviteUrl)} className="w-full py-3 text-[10px] font-bold uppercase tracking-widest border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black transition-all">
                    {copied ? 'Copied!' : 'Copy Invite Link'}
                  </button>
                </div>

                <div className="border border-zinc-800 bg-zinc-950 p-6">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">How it works</div>
                  <div className="grid gap-px bg-zinc-900 sm:grid-cols-3">
                    {[
                      ['Share link', 'Send the invite to your co-DJ. They open it and connect their wallet.'],
                      ['Both stream', 'You both get the same RTMP credentials. Whoever is live feeds the station.'],
                      ['Hand off', 'Take turns. One DJ plays while the other prepares the next track.'],
                    ].map(([label, body]) => (
                      <div key={label} className="bg-black p-4">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{label}</div>
                        <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* No co-show — create one */}
            {!coShow && (
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Create Co-Show</div>

                <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 mb-6">
                  {[
                    ['Shared credentials', 'Both DJs get the same RTMP stream key and server URL.'],
                    ['Pirate radio style', 'Take turns playing sets. One DJ decks, the other prepares.'],
                    ['Same gate', 'Your co-DJ needs the same token access as you.'],
                    ['24h invite', 'The invite link expires after 24 hours. Resend if needed.'],
                  ].map(([label, body]) => (
                    <div key={label} className="bg-black p-4">
                      <div className="text-sm font-bold uppercase tracking-wider text-white mb-2">{label}</div>
                      <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>

                <button onClick={handleCreate} disabled={creating} className="w-full py-3 text-[10px] font-bold uppercase tracking-widest border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {creating ? 'Creating...' : 'Create Co-Show'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
