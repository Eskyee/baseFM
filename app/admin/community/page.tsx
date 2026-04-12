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
  bio: string | null;
  tokenBalance: number;
  isVerified: boolean;
  isFeatured: boolean;
  showsAttended: number;
  createdAt: string;
}

function formatBalance(balance: number): string {
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(1)}M`;
  }
  if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)}K`;
  }
  return balance.toLocaleString();
}

function adminHeaders(walletAddress?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (walletAddress) {
    headers['x-wallet-address'] = walletAddress
  }
  return headers
}

export default function AdminCommunityPage() {
  const { address, isConnected } = useAccount();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/community', {
        headers: adminHeaders(address),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (memberId: string, action: 'verify' | 'unverify' | 'feature' | 'unfeature' | 'delete') => {
    setActionLoading(memberId + action);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/community', {
        method: 'POST',
        headers: adminHeaders(address),
        body: JSON.stringify({
          walletAddress: address,
          memberId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Action failed' });
        return;
      }

      setMessage({ type: 'success', text: data.message || 'Action completed' });
      fetchMembers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to perform action' });
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
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Community Admin</h1>
          <p className="text-[#888] mb-8">Connect your admin wallet to manage members</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
            <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Community Management</h1>
            <p className="text-[#888] text-sm">{members.length} members</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-lg mb-6 text-sm ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-500 text-green-400'
              : 'bg-red-900/20 border border-red-500 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <div className="text-2xl font-bold text-[#F5F5F5]">{members.length}</div>
            <div className="text-sm text-[#888]">Total Members</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{members.filter(m => m.isVerified).length}</div>
            <div className="text-sm text-[#888]">Verified</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">{members.filter(m => m.isFeatured).length}</div>
            <div className="text-sm text-[#888]">Featured</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {formatBalance(members.reduce((sum, m) => sum + m.tokenBalance, 0))}
            </div>
            <div className="text-sm text-[#888]">Total {DJ_TOKEN_CONFIG.symbol}</div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#333]">
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#888]">Member</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#888]">Balance</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#888]">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#888]">Joined</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-[#888]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#888]">Loading...</td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#888]">No members yet</td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="border-b border-[#222] hover:bg-[#222]/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Identity
                            address={member.walletAddress as `0x${string}`}
                            className="!bg-transparent"
                          >
                            <Avatar className="w-10 h-10 rounded-full" />
                          </Identity>
                          <div>
                            <Identity
                              address={member.walletAddress as `0x${string}`}
                              className="!bg-transparent"
                            >
                              <Name className="text-[#F5F5F5] text-sm font-medium" />
                            </Identity>
                            <div className="text-xs text-[#666] font-mono">
                              {member.walletAddress.slice(0, 6)}...{member.walletAddress.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-purple-400 font-medium">
                          {formatBalance(member.tokenBalance)}
                        </span>
                        <span className="text-[#888] text-sm ml-1">{DJ_TOKEN_CONFIG.symbol}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {member.isVerified && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                              Verified
                            </span>
                          )}
                          {member.isFeatured && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                              Featured
                            </span>
                          )}
                          {!member.isVerified && !member.isFeatured && (
                            <span className="text-[#666] text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#888] text-sm">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(member.id, member.isVerified ? 'unverify' : 'verify')}
                            disabled={actionLoading === member.id + (member.isVerified ? 'unverify' : 'verify')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                              member.isVerified
                                ? 'bg-[#333] text-[#888] hover:bg-[#444]'
                                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            }`}
                          >
                            {member.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          <button
                            onClick={() => handleAction(member.id, member.isFeatured ? 'unfeature' : 'feature')}
                            disabled={actionLoading === member.id + (member.isFeatured ? 'unfeature' : 'feature')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                              member.isFeatured
                                ? 'bg-[#333] text-[#888] hover:bg-[#444]'
                                : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                            }`}
                          >
                            {member.isFeatured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this member?')) {
                                handleAction(member.id, 'delete');
                              }
                            }}
                            disabled={actionLoading === member.id + 'delete'}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
