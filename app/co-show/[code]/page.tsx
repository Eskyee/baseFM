'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import { CoShowStudio } from '@/components/CoShowStudio';
import type { CoShow } from '@/types/co-show';

export default function CoShowJoinPage({ params }: { params: { code: string } }) {
  const { address, isConnected } = useAccount();
  const [invite, setInvite] = useState<{
    id: string;
    hostName: string;
    status: string;
    expiresAt: string;
    inviteCode: string;
  } | null>(null);
  const [coShow, setCoShow] = useState<CoShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [djName, setDjName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvite() {
      try {
        const res = await fetch(`/api/co-show/${params.code}`);
        if (res.status === 404) {
          setError('Co-show not found');
          return;
        }
        if (res.status === 410) {
          setError('This invite has expired');
          return;
        }
        if (!res.ok) {
          setError('Failed to load invite');
          return;
        }
        const data = await res.json();
        setInvite(data);
      } catch {
        setError('Failed to load invite');
      } finally {
        setLoading(false);
      }
    }
    loadInvite();
  }, [params.code]);

  const handleJoin = async () => {
    if (!address || !djName.trim()) return;
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`/api/co-show/${params.code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, djName: djName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join');
      setCoShow(data.coShow);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="animate-pulse text-zinc-600 text-sm">LOADING...</div>
      </div>
    );
  }

  // Error / not found / expired
  if (error && !invite) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
          <p className="text-zinc-500 text-sm">This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  // Ended
  if (invite?.status === 'ended') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">This co-show has ended.</h1>
        </div>
      </div>
    );
  }

  // Active + user is co-dj — render studio
  if (coShow?.status === 'active' && address) {
    return (
      <CoShowStudio
        coShow={coShow}
        role="co-dj"
        walletAddress={address}
        djName={djName || coShow.coDjName || 'Co-DJ'}
        inviteCode={params.code}
      />
    );
  }

  // Pre-join
  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="text-amber-400 font-bold tracking-tighter text-sm">[baseFM]</span>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-white mt-4">
            YOU&apos;VE BEEN INVITED TO JOIN A B2B SET
          </h1>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 rounded p-6">
          <div className="text-center mb-6">
            <span className="text-zinc-500 text-xs uppercase">Host DJ</span>
            <p className="text-white text-xl font-bold mt-1">{invite?.hostName}</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {!isConnected ? (
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-4">Connect your wallet to join</p>
              <WalletConnect />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase block mb-1">Your DJ Name</label>
                <input
                  type="text"
                  value={djName}
                  onChange={(e) => setDjName(e.target.value)}
                  placeholder="Enter your DJ name"
                  className="w-full bg-black border border-zinc-700 rounded px-3 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={handleJoin}
                disabled={joining || !djName.trim()}
                className="w-full py-4 bg-amber-400 text-black font-bold uppercase tracking-tighter rounded text-sm hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {joining ? 'JOINING...' : 'JOIN CO-SHOW'}
              </button>

              <p className="text-zinc-600 text-[10px] text-center">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
