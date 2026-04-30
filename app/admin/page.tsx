'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
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

interface ActiveStream {
  id: string;
  title: string;
  djName: string;
  status: string;
  viewerCount: number;
  createdAt: string;
}

interface PlatformStats {
  totalStreams: number;
  activeStreams: number;
  totalMembers: number;
  recentErrors: number;
}

function formatBalance(balance: number): string {
  if (balance >= 1000000) return `${(balance / 1000000).toFixed(1)}M`;
  if (balance >= 1000) return `${(balance / 1000).toFixed(1)}K`;
  return balance.toLocaleString();
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="basefm-panel p-5">
      <div className={`text-[10px] uppercase tracking-widest mb-2 ${color}`}>{label}</div>
      <div className="text-3xl font-bold tracking-tighter uppercase text-white">{value}</div>
    </div>
  );
}

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { adminFetch } = useAdminAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeStreams, setActiveStreams] = useState<ActiveStream[]>([]);
  const [stats, setStats] = useState<PlatformStats>({ totalStreams: 0, activeStreams: 0, totalMembers: 0, recentErrors: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, streamsRes, improvementRes] = await Promise.allSettled([
        adminFetch('/api/admin/community'),
        fetch('/api/streams?status=PREPARING&status=ARMED&status=LIVE'),
        adminFetch('/api/admin/improvement'),
      ]);

      if (membersRes.status === 'fulfilled' && membersRes.value.ok) {
        const data = await membersRes.value.json();
        setMembers(data.members || []);
        setStats(s => ({ ...s, totalMembers: (data.members || []).length }));
      }

      if (streamsRes.status === 'fulfilled' && streamsRes.value.ok) {
        const data = await streamsRes.value.json();
        const streams = data.streams || [];
        setActiveStreams(streams);
        setStats(s => ({ ...s, activeStreams: streams.length }));
      }

      if (improvementRes.status === 'fulfilled' && improvementRes.value.ok) {
        const data = await improvementRes.value.json();
        setStats(s => ({ ...s, recentErrors: (data.insights || []).filter((i: { severity: string }) => i.severity === 'error').length }));
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    if (isConnected) void fetchData();
  }, [fetchData, isConnected]);

  const handleMemberAction = async (memberId: string, action: 'verify' | 'unverify' | 'feature' | 'unfeature' | 'delete') => {
    setActionLoading(memberId + action);
    setResult(null);

    try {
      const signedRes = await adminFetch('/api/admin/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, memberId, action }),
      });
      const data = await signedRes.json();

      if (!signedRes.ok) {
        setResult({ error: data.error || 'Action failed' });
        return;
      }

      setResult({ success: true, message: data.message });
      void fetchData();
    } catch {
      setResult({ error: 'Failed to perform action' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearStreams = async () => {
    if (!confirm('Are you sure you want to delete ALL streams? This cannot be undone.')) return;

    setIsClearing(true);
    setResult(null);

    try {
      const response = await adminFetch('/api/admin/clear-streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to clear streams');

      setResult({ success: true, message: data.message });
      void fetchData();
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsClearing(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="basefm-panel p-8 text-center">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Admin only</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-4">Admin Panel</h1>
            <p className="max-w-md mx-auto text-sm text-zinc-400 leading-relaxed mb-6">
              Connect an admin wallet to manage the station.
            </p>
            <WalletConnect />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Admin</span>
            <span className="basefm-kicker text-zinc-500">Station control</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Admin panel.
              <br />
              <span className="text-zinc-700">Manage everything.</span>
            </h1>
          </div>

          <p className="text-xs text-zinc-600 font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)} · {DJ_TOKEN_CONFIG.symbol} holder
          </p>
        </div>
      </section>

      {/* Status Messages */}
      {result?.success && (
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300 mb-6">{result.message}</div>
        </div>
      )}
      {result?.error && (
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 mb-6">{result.error}</div>
        </div>
      )}

      {/* Platform Stats */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Platform overview</div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-black p-5 animate-pulse">
                  <div className="h-3 w-20 bg-zinc-900 mb-3" />
                  <div className="h-8 w-16 bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-900">
              <StatCard label="Active streams" value={stats.activeStreams} color="text-green-400" />
              <StatCard label="Community" value={stats.totalMembers} color="text-blue-400" />
              <StatCard label="Recent errors" value={stats.recentErrors} color={stats.recentErrors > 0 ? 'text-red-400' : 'text-zinc-500'} />
              <StatCard label="Total streams" value={stats.totalStreams} color="text-zinc-500" />
            </div>
          )}
        </div>
      </section>

      {/* Active Streams */}
      {activeStreams.length > 0 && (
        <section className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Active streams</div>
            <div className="grid gap-px bg-zinc-900">
              {activeStreams.map(stream => (
                <Link
                  key={stream.id}
                  href={`/stream/${stream.id}`}
                  className="bg-black p-4 hover:bg-zinc-950 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm text-white font-medium">{stream.title}</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">{stream.djName}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                      stream.status === 'LIVE' ? 'border-green-500/30 text-green-400' :
                      stream.status === 'ARMED' ? 'border-amber-500/30 text-amber-400' :
                      'border-zinc-700 text-zinc-500'
                    }`}>
                      {stream.status}
                    </span>
                    {stream.viewerCount > 0 && (
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">{stream.viewerCount} watching</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Quick actions</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-zinc-900">
            {[
              { href: '/admin/schedule', label: 'Schedule', color: 'text-purple-400' },
              { href: '/admin/djs', label: 'DJs', color: 'text-blue-400' },
              { href: '/admin/events', label: 'Events', color: 'text-green-400' },
              { href: '/admin/improvement', label: 'Improve', color: 'text-cyan-400' },
              { href: '/dashboard', label: 'Go Live', color: 'text-orange-400' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-black p-5 hover:bg-zinc-950 transition-colors group"
              >
                <div className={`text-[10px] uppercase tracking-widest ${link.color} group-hover:text-white transition-colors`}>
                  {link.label} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community Members */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">Community members</div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-600">{members.length}</span>
          </div>

          {isLoading ? (
            <div className="grid gap-px bg-zinc-900">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-black p-4 animate-pulse">
                  <div className="h-4 w-40 bg-zinc-900 mb-2" />
                  <div className="h-3 w-24 bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="basefm-panel p-8 text-center">
              <p className="text-sm text-zinc-400">No members yet.</p>
            </div>
          ) : (
            <div className="grid gap-px bg-zinc-900">
              {members.map(member => (
                <div key={member.id} className="bg-black p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-500 shrink-0">
                      {member.displayName?.[0] || member.walletAddress[2].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-white truncate">
                          {member.displayName || `${member.walletAddress.slice(0, 6)}...${member.walletAddress.slice(-4)}`}
                        </span>
                        {member.isVerified && (
                          <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 border border-blue-500/30 text-blue-400">Verified</span>
                        )}
                        {member.isFeatured && (
                          <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 border border-purple-500/30 text-purple-400">Featured</span>
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                        <span className="text-purple-400">{formatBalance(member.tokenBalance)}</span> {DJ_TOKEN_CONFIG.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleMemberAction(member.id, member.isVerified ? 'unverify' : 'verify')}
                      disabled={!!actionLoading}
                      className={`text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors disabled:opacity-50 ${
                        member.isVerified
                          ? 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                          : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                      }`}
                    >
                      {actionLoading === member.id + (member.isVerified ? 'unverify' : 'verify')
                        ? '...'
                        : member.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleMemberAction(member.id, member.isFeatured ? 'unfeature' : 'feature')}
                      disabled={!!actionLoading}
                      className={`text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors disabled:opacity-50 ${
                        member.isFeatured
                          ? 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                          : 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
                      }`}
                    >
                      {actionLoading === member.id + (member.isFeatured ? 'unfeature' : 'feature')
                        ? '...'
                        : member.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this member?')) handleMemberAction(member.id, 'delete'); }}
                      disabled={!!actionLoading}
                      className="text-[10px] uppercase tracking-widest px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === member.id + 'delete' ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="text-[10px] uppercase tracking-widest text-red-500 mb-4">Danger zone</div>
          <div className="basefm-panel p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-white">Clear all streams</div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">Deletes every stream from database and Mux. Cannot be undone.</div>
            </div>
            <button
              onClick={handleClearStreams}
              disabled={isClearing}
              className="text-[10px] uppercase tracking-widest px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 shrink-0"
            >
              {isClearing ? 'Clearing...' : 'Clear all'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
