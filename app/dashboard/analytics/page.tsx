'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

interface StreamStats {
  id: string;
  title: string;
  status: string;
  viewerCount: number;
  peakViewers: number;
  totalTips: number;
  chatMessages: number;
  duration: number;
  createdAt: string;
}

interface AnalyticsData {
  totalStreams: number;
  totalViewers: number;
  totalTips: number;
  totalDuration: number;
  streams: StreamStats[];
}

export default function AnalyticsPage() {
  const { address, isConnected } = useAccount();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchAnalytics();
    }
  }, [address]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-4">Analytics</h1>
          <p className="text-[#888]">Connect your wallet to view analytics</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-8">Analytics</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-[#333] rounded w-20 mb-2" />
                <div className="h-8 bg-[#333] rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Analytics</h1>
          <Link
            href="/dashboard"
            className="text-sm text-[#888] hover:text-[#F5F5F5]"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <p className="text-xs text-[#888] mb-1">Total Streams</p>
            <p className="text-2xl font-bold text-[#F5F5F5]">
              {analytics?.totalStreams || 0}
            </p>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <p className="text-xs text-[#888] mb-1">Total Viewers</p>
            <p className="text-2xl font-bold text-[#F5F5F5]">
              {analytics?.totalViewers || 0}
            </p>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <p className="text-xs text-[#888] mb-1">Tips Received</p>
            <p className="text-2xl font-bold text-purple-400">
              {analytics?.totalTips || 0} RAVE
            </p>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4">
            <p className="text-xs text-[#888] mb-1">Stream Time</p>
            <p className="text-2xl font-bold text-[#F5F5F5]">
              {formatDuration(analytics?.totalDuration || 0)}
            </p>
          </div>
        </div>

        {/* Stream History */}
        <div className="bg-[#1A1A1A] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Stream History</h2>

          {analytics?.streams && analytics.streams.length > 0 ? (
            <div className="space-y-3">
              {analytics.streams.map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-[#F5F5F5]">{stream.title}</h3>
                    <p className="text-xs text-[#888]">
                      {new Date(stream.createdAt).toLocaleDateString()} · {formatDuration(stream.duration)}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-[#F5F5F5] font-medium">{stream.peakViewers}</p>
                      <p className="text-xs text-[#888]">Peak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#F5F5F5] font-medium">{stream.chatMessages}</p>
                      <p className="text-xs text-[#888]">Chats</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-400 font-medium">{stream.totalTips}</p>
                      <p className="text-xs text-[#888]">Tips</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#888]">No streams yet</p>
              <Link
                href="/dashboard/create"
                className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
              >
                Create Your First Stream
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
