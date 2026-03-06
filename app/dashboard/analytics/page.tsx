'use client';

import { useState, useEffect, useMemo } from 'react';
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

type DateRange = 'all' | '7d' | '30d' | '90d';

// Simple bar chart component
function BarChart({ data, label, color }: { data: number[]; label: string; color: string }) {
  const max = Math.max(...data, 1);

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#888]">{label}</p>
      <div className="flex items-end gap-1 h-16">
        {data.map((value, i) => (
          <div
            key={i}
            className="flex-1 rounded-t transition-all hover:opacity-80"
            style={{
              height: `${(value / max) * 100}%`,
              backgroundColor: color,
              minHeight: value > 0 ? '4px' : '0',
            }}
            title={`${value}`}
          />
        ))}
      </div>
    </div>
  );
}

// Metric card with trend indicator
function MetricCard({
  label,
  value,
  subValue,
  trend,
  icon,
  color = 'text-[#F5F5F5]',
}: {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: number; isPositive: boolean };
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-3 sm:p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#333] flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <svg className={`w-3 h-3 ${trend.isPositive ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14l5-5 5 5H7z" />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-xs text-[#888] mb-1">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
      {subValue && <p className="text-xs text-[#666] mt-1">{subValue}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { address, isConnected } = useAccount();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('all');

  useEffect(() => {
    if (address) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    }

    fetchAnalytics();
  }, [address]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Filter streams by date range
  const filteredStreams = useMemo(() => {
    if (!analytics?.streams) return [];
    if (dateRange === 'all') return analytics.streams;

    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return analytics.streams.filter((s) => new Date(s.createdAt) >= cutoff);
  }, [analytics?.streams, dateRange]);

  // Calculate filtered totals
  const filteredTotals = useMemo(() => {
    return {
      totalStreams: filteredStreams.length,
      totalViewers: filteredStreams.reduce((sum, s) => sum + s.peakViewers, 0),
      totalTips: filteredStreams.reduce((sum, s) => sum + s.totalTips, 0),
      totalDuration: filteredStreams.reduce((sum, s) => sum + s.duration, 0),
      totalChats: filteredStreams.reduce((sum, s) => sum + s.chatMessages, 0),
    };
  }, [filteredStreams]);

  // Calculate averages
  const averages = useMemo(() => {
    const count = filteredStreams.length || 1;
    return {
      avgViewers: Math.round(filteredTotals.totalViewers / count),
      avgDuration: Math.round(filteredTotals.totalDuration / count),
      avgTips: (filteredTotals.totalTips / count).toFixed(1),
      avgChats: Math.round(filteredTotals.totalChats / count),
    };
  }, [filteredStreams.length, filteredTotals]);

  // Chart data - last 7 streams performance
  const chartData = useMemo(() => {
    const last7 = filteredStreams.slice(0, 7).reverse();
    return {
      viewers: last7.map((s) => s.peakViewers),
      chats: last7.map((s) => s.chatMessages),
      tips: last7.map((s) => s.totalTips),
    };
  }, [filteredStreams]);

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
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">Analytics</h1>
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm text-[#888] hover:text-[#F5F5F5] flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'All Time' },
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value as DateRange)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                dateRange === option.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <MetricCard
            label="Total Streams"
            value={filteredTotals.totalStreams}
            subValue={`Avg ${formatDuration(averages.avgDuration)}/stream`}
            icon={
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          />
          <MetricCard
            label="Peak Viewers"
            value={filteredTotals.totalViewers}
            subValue={`Avg ${averages.avgViewers}/stream`}
            icon={
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          <MetricCard
            label="Tips Received"
            value={filteredTotals.totalTips}
            subValue={`Avg ${averages.avgTips}/stream`}
            color="text-purple-400"
            icon={
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <MetricCard
            label="Stream Time"
            value={formatDuration(filteredTotals.totalDuration)}
            subValue={`${filteredTotals.totalChats} chat messages`}
            icon={
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Performance Charts */}
        {filteredStreams.length > 1 && (
          <div className="bg-[#1A1A1A] rounded-xl p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Performance Trends</h2>
            <p className="text-xs text-[#666] mb-4">Last {Math.min(7, filteredStreams.length)} streams</p>
            <div className="grid grid-cols-3 gap-4">
              <BarChart data={chartData.viewers} label="Viewers" color="#8B5CF6" />
              <BarChart data={chartData.chats} label="Chats" color="#3B82F6" />
              <BarChart data={chartData.tips} label="Tips" color="#10B981" />
            </div>
          </div>
        )}

        {/* Engagement Summary */}
        {filteredStreams.length > 0 && (
          <div className="bg-[#1A1A1A] rounded-xl p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Engagement Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#F5F5F5]">{averages.avgChats}</p>
                <p className="text-xs text-[#888]">Avg Chats/Stream</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#F5F5F5]">{averages.avgViewers}</p>
                <p className="text-xs text-[#888]">Avg Viewers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{averages.avgTips}</p>
                <p className="text-xs text-[#888]">Avg Tips</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#F5F5F5]">{formatDuration(averages.avgDuration)}</p>
                <p className="text-xs text-[#888]">Avg Duration</p>
              </div>
            </div>
          </div>
        )}

        {/* Stream History */}
        <div className="bg-[#1A1A1A] rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#F5F5F5]">Stream History</h2>
            {filteredStreams.length > 0 && (
              <span className="text-xs text-[#666]">{filteredStreams.length} streams</span>
            )}
          </div>

          {filteredStreams.length > 0 ? (
            <div className="space-y-3">
              {filteredStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="p-3 sm:p-4 bg-[#0A0A0A] rounded-lg"
                >
                  {/* Title Row */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[#F5F5F5] text-sm sm:text-base truncate">{stream.title}</h3>
                      {stream.status === 'live' && (
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded">LIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-[#888]">
                      {new Date(stream.createdAt).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })} · {formatDuration(stream.duration)}
                    </p>
                  </div>
                  {/* Stats Row - Grid on mobile */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#1A1A1A] rounded-lg py-2">
                      <p className="text-[#F5F5F5] font-medium text-sm">{stream.peakViewers}</p>
                      <p className="text-xs text-[#888]">Peak</p>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-lg py-2">
                      <p className="text-[#F5F5F5] font-medium text-sm">{stream.chatMessages}</p>
                      <p className="text-xs text-[#888]">Chats</p>
                    </div>
                    <div className="bg-[#1A1A1A] rounded-lg py-2">
                      <p className="text-purple-400 font-medium text-sm">{stream.totalTips}</p>
                      <p className="text-xs text-[#888]">Tips</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[#888] mb-4">
                {analytics?.streams?.length
                  ? 'No streams in this time period'
                  : 'No streams yet'}
              </p>
              <Link
                href="/dashboard/create"
                className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium"
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
