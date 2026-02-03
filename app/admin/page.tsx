'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

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
          <p className="text-[#888] mb-8">
            Connect your admin wallet to access controls
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const handleClearStreams = async () => {
    if (!confirm('Are you sure you want to delete ALL streams? This cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/clear-streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear streams');
      }

      setResult({ success: true, message: data.message });
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
        <p className="text-[#888] text-sm mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/schedule"
            className="bg-[#1A1A1A] rounded-lg p-6 hover:bg-[#222] transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium mb-1">Schedule Manager</h3>
            <p className="text-[#888] text-sm">Manage weekly programming</p>
          </Link>

          <Link
            href="/admin/djs"
            className="bg-[#1A1A1A] rounded-lg p-6 hover:bg-[#222] transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium mb-1">DJ Management</h3>
            <p className="text-[#888] text-sm">Manage DJs & permissions</p>
          </Link>

          <Link
            href="/admin/community"
            className="bg-[#1A1A1A] rounded-lg p-6 hover:bg-[#222] transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium mb-1">Community</h3>
            <p className="text-[#888] text-sm">Manage members & verification</p>
          </Link>

          <Link
            href="/dashboard"
            className="bg-[#1A1A1A] rounded-lg p-6 hover:bg-[#222] transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-medium mb-1">Go Live</h3>
            <p className="text-[#888] text-sm">Start streaming</p>
          </Link>
        </div>

        {/* Admin Actions */}
        <div className="bg-[#1A1A1A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Stream Management</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg">
              <div>
                <h3 className="text-[#F5F5F5] font-medium">Clear All Streams</h3>
                <p className="text-[#888] text-sm">Delete all streams from database and Mux</p>
              </div>
              <button
                onClick={handleClearStreams}
                disabled={isClearing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearing ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-[#1A1A1A] rounded-lg">
          <p className="text-[#888] text-xs">
            Admin access is controlled by the <code className="text-[#F5F5F5]">ADMIN_WALLET_ADDRESS</code> environment variable.
            You can add multiple admin wallets separated by commas.
          </p>
        </div>
      </div>
    </div>
  );
}
