'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import Image from 'next/image';
import { DJ } from '@/types/dj';

const DEFAULT_AVATAR = '/logo.png';

export default function AdminDJsPage() {
  const { address, isConnected } = useAccount();
  const { adminFetch } = useAdminAuth();
  const [djs, setDJs] = useState<DJ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDJs() {
      try {
        const res = await adminFetch('/api/admin/djs');
        if (res.ok) {
          const data = await res.json();
          setDJs(data.djs || []);
        }
      } catch (err) {
        console.error('Failed to fetch DJs:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isConnected) {
      fetchDJs();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">DJ Management</h1>
          <p className="text-[#888] mb-8">Connect your admin wallet</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const handleToggleResident = async (dj: DJ) => {
    setUpdating(dj.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminFetch('/api/admin/djs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          djWalletAddress: dj.walletAddress,
          action: 'setResident',
          value: !dj.isResident,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update');
      }

      // Update local state
      setDJs(djs.map(d =>
        d.id === dj.id ? { ...d, isResident: !d.isResident } : d
      ));
      setSuccess(`${dj.name} is now ${!dj.isResident ? 'a resident' : 'a guest'} DJ`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleVerified = async (dj: DJ) => {
    setUpdating(dj.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminFetch('/api/admin/djs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          djWalletAddress: dj.walletAddress,
          action: 'setVerified',
          value: !dj.isVerified,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update');
      }

      setDJs(djs.map(d =>
        d.id === dj.id ? { ...d, isVerified: !d.isVerified } : d
      ));
      setSuccess(`${dj.name} is now ${!dj.isVerified ? 'verified' : 'unverified'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleBanned = async (dj: DJ) => {
    if (!dj.isBanned && !confirm(`Are you sure you want to ban ${dj.name}?`)) {
      return;
    }

    setUpdating(dj.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await adminFetch('/api/admin/djs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          djWalletAddress: dj.walletAddress,
          action: 'setBanned',
          value: !dj.isBanned,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update');
      }

      setDJs(djs.map(d =>
        d.id === dj.id ? { ...d, isBanned: !d.isBanned } : d
      ));
      setSuccess(`${dj.name} is now ${!dj.isBanned ? 'banned' : 'unbanned'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/admin"
          className="text-[#888] hover:text-[#F5F5F5] mb-6 inline-flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Admin
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">DJ Management</h1>
            <p className="text-[#888] text-sm mt-1">Manage DJ profiles and permissions</p>
          </div>
          <div className="text-sm text-[#888]">
            {djs.length} DJs registered
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* DJ List */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#1A1A1A] rounded-lg" />
            ))}
          </div>
        ) : djs.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-lg">
            <p className="text-[#888]">No DJs registered yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {djs.map((dj) => (
              <div
                key={dj.id}
                className={`bg-[#1A1A1A] rounded-lg p-4 ${dj.isBanned ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0A0A0A] flex-shrink-0">
                    <Image
                      src={dj.avatarUrl || DEFAULT_AVATAR}
                      alt={dj.name}
                      fill
                      className={dj.avatarUrl ? 'object-cover' : 'object-contain p-2'}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#F5F5F5] font-medium truncate">{dj.name}</h3>
                      {dj.isResident && (
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded">
                          Resident
                        </span>
                      )}
                      {dj.isVerified && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded">
                          Verified
                        </span>
                      )}
                      {dj.isBanned && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded">
                          Banned
                        </span>
                      )}
                    </div>
                    <p className="text-[#888] text-sm truncate font-mono">
                      {dj.walletAddress.slice(0, 6)}...{dj.walletAddress.slice(-4)}
                    </p>
                    <p className="text-[#666] text-xs mt-1">
                      {dj.totalShows} shows · Joined {new Date(dj.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleResident(dj)}
                      disabled={updating === dj.id}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                        dj.isResident
                          ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                          : 'bg-[#333] text-[#888] hover:bg-[#444] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {dj.isResident ? 'Remove Resident' : 'Make Resident'}
                    </button>
                    <button
                      onClick={() => handleToggleVerified(dj)}
                      disabled={updating === dj.id}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                        dj.isVerified
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-[#333] text-[#888] hover:bg-[#444] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {dj.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleToggleBanned(dj)}
                      disabled={updating === dj.id}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                        dj.isBanned
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      }`}
                    >
                      {dj.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-[#1A1A1A] rounded-lg">
          <h3 className="text-[#F5F5F5] font-medium mb-2">DJ Status Types</h3>
          <ul className="text-[#888] text-sm space-y-1">
            <li><span className="text-purple-400">Resident</span> — Core station DJs with regular slots</li>
            <li><span className="text-blue-400">Verified</span> — Identity confirmed, trusted DJ</li>
            <li><span className="text-red-400">Banned</span> — Blocked from streaming and hidden from directory</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
