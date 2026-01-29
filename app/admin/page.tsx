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
