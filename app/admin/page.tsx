'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

interface Member {
  id: string;
  walletAddress: string;
  displayName: string | null;
  tokenBalance: number;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
}

function formatBalance(balance: number): string {
  if (balance >= 1000000) return `${(balance / 1000000).toFixed(1)}M`;
  if (balance >= 1000) return `${(balance / 1000).toFixed(1)}K`;
  return balance.toLocaleString();
}

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      fetchMembers();
    }
  }, [isConnected]);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/community');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleMemberAction = async (memberId: string, action: 'verify' | 'unverify' | 'feature' | 'unfeature' | 'delete') => {
    setActionLoading(memberId + action);
    setResult(null);

    try {
      const res = await fetch('/api/admin/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, memberId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ error: data.error || 'Action failed' });
        return;
      }

      setResult({ success: true, message: data.message });
      fetchMembers();
    } catch (err) {
      setResult({ error: 'Failed to perform action' });
    } finally {
      setActionLoading(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Admin Panel</h1>
          <p className="text-[#888] mb-8">Connect your admin wallet to access controls</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const handleClearStreams = async () => {
    if (!confirm('Are you sure you want to delete ALL streams? This cannot be undone.')) return;

    setIsClearing(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/clear-streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to clear streams');

      setResult({ success: true, message: data.message });
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="text-[#888] hover:text-[#F5F5F5] mb-6 inline-flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Admin Panel</h1>
        <p className="text-[#888] text-sm mb-6">
          Connected as: <span className="font-mono text-[#F5F5F5]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </p>

        {/* Results */}
        {result?.success && (
          <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {result.message}
          </div>
        )}
        {result?.error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {result.error}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/events"
            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-3 group-hover:bg-pink-500/30 transition-colors">
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium text-sm">Events</h3>
          </Link>

          <Link
            href="/admin/crew"
            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:bg-cyan-500/30 transition-colors">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium text-sm">Crew</h3>
          </Link>

          <Link
            href="/admin/accounting"
            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3 group-hover:bg-green-500/30 transition-colors">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium text-sm">Accounting</h3>
          </Link>

          <Link
            href="/admin/promoters"
            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-3 group-hover:bg-orange-500/30 transition-colors">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium text-sm">Promoters</h3>
          </Link>

          <Link
            href="/admin/schedule"
            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium text-sm">Schedule</h3>
          </Link>

          <Link
            href="/admin/djs"
            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/30 transition-colors">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium text-sm">DJs</h3>
          </Link>

          <Link
            href="/promoter"
            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3 group-hover:bg-yellow-500/30 transition-colors">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium text-sm">Promoter Dashboard</h3>
          </Link>

          <Link
            href="/dashboard"
            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3 group-hover:bg-red-500/30 transition-colors">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium text-sm">Go Live</h3>
          </Link>
        </div>

        {/* Community Members */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Community Members</h2>
            <span className="text-sm text-[#888]">{members.length} members</span>
          </div>

          {isLoadingMembers ? (
            <div className="text-center py-8 text-[#888]">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-[#888]">No members yet</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Identity
                      address={member.walletAddress as `0x${string}`}
                      className="!bg-transparent"
                    >
                      <Avatar className="w-10 h-10 rounded-full" />
                    </Identity>
                    <div>
                      <div className="flex items-center gap-2">
                        <Identity
                          address={member.walletAddress as `0x${string}`}
                          className="!bg-transparent"
                        >
                          <Name className="text-[#F5F5F5] text-sm font-medium" />
                        </Identity>
                        {member.isVerified && (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Verified</span>
                        )}
                        {member.isFeatured && (
                          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">Featured</span>
                        )}
                      </div>
                      <div className="text-xs text-[#666]">
                        <span className="text-purple-400 font-medium">{formatBalance(member.tokenBalance)}</span>
                        <span className="ml-1">{DJ_TOKEN_CONFIG.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMemberAction(member.id, member.isVerified ? 'unverify' : 'verify')}
                      disabled={!!actionLoading}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                        member.isVerified
                          ? 'bg-[#333] text-[#888] hover:bg-[#444]'
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      }`}
                    >
                      {actionLoading === member.id + (member.isVerified ? 'unverify' : 'verify')
                        ? '...'
                        : member.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleMemberAction(member.id, member.isFeatured ? 'unfeature' : 'feature')}
                      disabled={!!actionLoading}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                        member.isFeatured
                          ? 'bg-[#333] text-[#888] hover:bg-[#444]'
                          : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                      }`}
                    >
                      {actionLoading === member.id + (member.isFeatured ? 'unfeature' : 'feature')
                        ? '...'
                        : member.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this member?')) {
                          handleMemberAction(member.id, 'delete');
                        }
                      }}
                      disabled={!!actionLoading}
                      className="px-3 py-1.5 text-xs font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === member.id + 'delete' ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stream Management */}
        <div className="bg-[#1A1A1A] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Stream Management</h2>
          <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg">
            <div>
              <h3 className="text-[#F5F5F5] font-medium">Clear All Streams</h3>
              <p className="text-[#888] text-sm">Delete all streams from database and Mux</p>
            </div>
            <button
              onClick={handleClearStreams}
              disabled={isClearing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isClearing ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
