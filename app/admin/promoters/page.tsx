'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import Image from 'next/image';
import { Promoter } from '@/types/event';

const TYPE_LABELS: Record<string, string> = {
  promoter: 'Promoter',
  collective: 'Collective',
  venue: 'Venue',
  label: 'Label',
  organization: 'Organization',
};

const DEFAULT_LOGO = '/logo.png';

function adminHeaders(walletAddress?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (walletAddress) {
    headers['x-wallet-address'] = walletAddress
  }
  return headers
}

export default function AdminPromotersPage() {
  const { address, isConnected } = useAccount();
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPromoters() {
      try {
        const res = await fetch('/api/admin/promoters');
        if (res.ok) {
          const data = await res.json();
          setPromoters(data.promoters || []);
        }
      } catch (err) {
        console.error('Failed to fetch promoters:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isConnected) {
      fetchPromoters();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Promoter Management</h1>
          <p className="text-[#888] mb-8">Connect your admin wallet</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const handleAction = async (promoterId: string, action: string, value: boolean) => {
    setUpdating(promoterId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/promoters', {
        method: 'PATCH',
        headers: adminHeaders(address),
        body: JSON.stringify({
          walletAddress: address,
          promoterId,
          action,
          value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update');
      }

      // Update local state
      setPromoters(promoters.map(p =>
        p.id === promoterId ? data.promoter : p
      ));

      const actionLabels: Record<string, string> = {
        setVerified: value ? 'verified' : 'unverified',
        setFeatured: value ? 'featured' : 'unfeatured',
        setBanned: value ? 'banned' : 'unbanned',
      };
      setSuccess(`Promoter ${actionLabels[action] || 'updated'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (promoter: Promoter) => {
    if (!confirm(`Are you sure you want to delete "${promoter.name}"? This will also affect their events.`)) {
      return;
    }

    setUpdating(promoter.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/promoters', {
        method: 'DELETE',
        headers: adminHeaders(address),
        body: JSON.stringify({
          walletAddress: address,
          promoterId: promoter.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      setPromoters(promoters.filter(p => p.id !== promoter.id));
      setSuccess(`"${promoter.name}" deleted`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
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
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Promoter Management</h1>
            <p className="text-[#888] text-sm mt-1">Manage promoters, collectives, and venues</p>
          </div>
          <div className="text-sm text-[#888]">
            {promoters.length} registered
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

        {/* Promoters List */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#1A1A1A] rounded-lg" />
            ))}
          </div>
        ) : promoters.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-lg">
            <p className="text-[#888]">No promoters registered yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promoters.map((promoter) => (
              <div
                key={promoter.id}
                className={`bg-[#1A1A1A] rounded-lg p-4 ${promoter.isBanned ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0A0A0A] flex-shrink-0">
                    <Image
                      src={promoter.logoUrl || DEFAULT_LOGO}
                      alt={promoter.name}
                      fill
                      className={promoter.logoUrl ? 'object-cover' : 'object-contain p-2'}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#F5F5F5] font-medium truncate">{promoter.name}</h3>
                      <span className="px-2 py-0.5 bg-[#333] text-[#888] text-[10px] font-medium rounded">
                        {TYPE_LABELS[promoter.type]}
                      </span>
                      {promoter.isVerified && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded">
                          Verified
                        </span>
                      )}
                      {promoter.isFeatured && (
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded">
                          Featured
                        </span>
                      )}
                      {promoter.isBanned && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded">
                          Banned
                        </span>
                      )}
                    </div>
                    {promoter.walletAddress && (
                      <p className="text-[#888] text-sm truncate font-mono">
                        {promoter.walletAddress.slice(0, 6)}...{promoter.walletAddress.slice(-4)}
                      </p>
                    )}
                    <p className="text-[#666] text-xs mt-1">
                      {promoter.totalEvents} events
                      {promoter.city && ` · ${promoter.city}`}
                      {promoter.country && `, ${promoter.country}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => handleAction(promoter.id, 'setVerified', !promoter.isVerified)}
                      disabled={updating === promoter.id}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                        promoter.isVerified
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-[#333] text-[#888] hover:bg-[#444] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {promoter.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleAction(promoter.id, 'setFeatured', !promoter.isFeatured)}
                      disabled={updating === promoter.id}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                        promoter.isFeatured
                          ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                          : 'bg-[#333] text-[#888] hover:bg-[#444] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {promoter.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => handleAction(promoter.id, 'setBanned', !promoter.isBanned)}
                      disabled={updating === promoter.id}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                        promoter.isBanned
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      }`}
                    >
                      {promoter.isBanned ? 'Unban' : 'Ban'}
                    </button>
                    <Link
                      href={`/collectives/${promoter.slug}`}
                      className="px-3 py-1.5 bg-[#333] text-[#888] rounded text-sm font-medium hover:bg-[#444] transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(promoter)}
                      disabled={updating === promoter.id}
                      className="px-3 py-1.5 bg-red-900/20 text-red-400 rounded text-sm font-medium hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-[#1A1A1A] rounded-lg">
          <h3 className="text-[#F5F5F5] font-medium mb-2">Promoter Status Types</h3>
          <ul className="text-[#888] text-sm space-y-1">
            <li><span className="text-blue-400">Verified</span> — Identity confirmed, trusted organizer</li>
            <li><span className="text-purple-400">Featured</span> — Highlighted on the promoters page</li>
            <li><span className="text-red-400">Banned</span> — Hidden from listings and cannot submit events</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
