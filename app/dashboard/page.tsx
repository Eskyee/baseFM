'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStreams } from '@/hooks/useStreams';
import { useDJAccess } from '@/hooks/useDJAccess';
import { StreamCard } from '@/components/StreamCard';
import { WalletConnect } from '@/components/WalletConnect';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';
import Link from 'next/link';

interface ActivityLog {
  id: string;
  message: string;
  time: Date;
  type: 'info' | 'success' | 'warning';
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [connectedAt, setConnectedAt] = useState<Date | null>(null);

  // Track connection
  useEffect(() => {
    if (isConnected && address) {
      const now = new Date();
      setConnectedAt(now);
      addActivity(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`, 'success');
    }
  }, [isConnected, address]);

  const addActivity = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setActivityLog(prev => [{
      id: Date.now().toString(),
      message,
      time: new Date(),
      type
    }, ...prev].slice(0, 10)); // Keep last 10
  };
  const { hasAccess, isChecking, balance, requiredAmount, tokenSymbol } = useDJAccess();
  const { streams, isLoading } = useStreams({
    djWalletAddress: address,
  });

  // Not connected - show connect wallet
  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">DJ Dashboard</h1>
          <p className="text-[#888] mb-8">
            Connect your wallet to access the DJ dashboard
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  // Checking token balance
  if (isChecking) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-8 h-8 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-3">Checking Access...</h1>
          <p className="text-[#888] text-sm">
            Verifying your {tokenSymbol} token balance
          </p>
        </div>
      </div>
    );
  }

  // No token access - show gate
  if (!hasAccess) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Token Required</h1>
          <p className="text-[#888] mb-6">
            You need <span className="text-[#F59E0B] font-bold">{requiredAmount} {tokenSymbol}</span> tokens to access the DJ dashboard
          </p>

          <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#888] text-sm">Your Balance</span>
              <span className="text-[#F5F5F5] font-mono">{balance} {tokenSymbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#888] text-sm">Required</span>
              <span className="text-[#F59E0B] font-mono">{requiredAmount} {tokenSymbol}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-[#333]">
              <div className="flex justify-between items-center">
                <span className="text-[#888] text-sm">Needed</span>
                <span className="text-red-400 font-mono">
                  {Math.max(0, parseInt(requiredAmount) - parseInt(balance))} {tokenSymbol}
                </span>
              </div>
            </div>
          </div>

          <a
            href={`https://basescan.org/token/${DJ_TOKEN_CONFIG.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3B82F6] hover:underline text-sm"
          >
            View {tokenSymbol} on BaseScan →
          </a>
        </div>
      </div>
    );
  }

  // Has access - show dashboard
  const liveStreams = streams.filter((s) => s.status === 'LIVE');
  const preparingStreams = streams.filter((s) => s.status === 'PREPARING');
  const scheduledStreams = streams.filter((s) => s.status === 'CREATED');
  const pastStreams = streams.filter((s) => s.status === 'ENDED');

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Mobile First */}
        <div className="mb-6">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">DJ Dashboard</h1>
              <p className="text-[#888] text-xs sm:text-sm mt-1 flex items-center gap-2">
                {address?.slice(0, 6)}...{address?.slice(-4)}
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded-full tracking-wider border border-purple-500/30">
                  {balance} {tokenSymbol}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions - Mobile friendly grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link
              href="/dashboard/create"
              className="flex flex-col items-center justify-center py-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl transition-all shadow-lg shadow-purple-500/10 active:scale-[0.97]"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">Go Live</span>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="flex flex-col items-center justify-center py-4 bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5] rounded-xl border border-[#2A2A2A] transition-colors active:scale-[0.97]"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-medium">Stats</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex flex-col items-center justify-center py-4 bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5] rounded-xl border border-[#2A2A2A] transition-colors active:scale-[0.97]"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Profile</span>
            </Link>
            <Link
              href="/schedule"
              className="flex flex-col items-center justify-center py-4 bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5] rounded-xl border border-[#2A2A2A] transition-colors active:scale-[0.97]"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">Shows</span>
            </Link>
          </div>

          {/* Activity Log */}
          <div className="mt-4 bg-[#1A1A1A] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#F5F5F5]">Activity Log</h3>
              {connectedAt && (
                <span className="text-xs text-[#888]">
                  Connected {connectedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {activityLog.length === 0 ? (
                <p className="text-xs text-[#666]">No recent activity</p>
              ) : (
                activityLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      log.type === 'success' ? 'bg-green-500' :
                      log.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[#888]">{log.message}</span>
                      <span className="text-[#555] ml-2">
                        {log.time.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : streams.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-lg p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-2">
              No streams yet
            </h2>
            <p className="text-[#888] text-sm mb-6">
              Create your first stream to start broadcasting
            </p>
            <Link
              href="/dashboard/create"
              className="px-5 py-2.5 bg-white text-black rounded-lg hover:bg-[#E5E5E5] transition-colors font-medium text-sm inline-block active:scale-[0.97]"
            >
              Create Your First Stream
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live/Preparing Streams */}
            {(liveStreams.length > 0 || preparingStreams.length > 0) && (
              <section>
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Active Streams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...liveStreams, ...preparingStreams].map((stream) => (
                    <StreamCard key={stream.id} stream={stream} showDJControls linkPrefix="/dashboard" />
                  ))}
                </div>
              </section>
            )}

            {/* Scheduled Streams */}
            {scheduledStreams.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">
                  Scheduled Streams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scheduledStreams.map((stream) => (
                    <StreamCard key={stream.id} stream={stream} showDJControls linkPrefix="/dashboard" />
                  ))}
                </div>
              </section>
            )}

            {/* Past Streams */}
            {pastStreams.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">
                  Past Streams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastStreams.slice(0, 6).map((stream) => (
                    <StreamCard key={stream.id} stream={stream} showDJControls linkPrefix="/dashboard" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
