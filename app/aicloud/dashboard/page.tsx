'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

interface Agent {
  id: string;
  handle: string;
  artistName: string;
  bio: string | null;
  avatarUrl: string | null;
  genres: string[];
  status: 'inactive' | 'active' | 'paused' | 'suspended';
  tier: 'free' | 'pro' | 'label';
  totalPosts: number;
  totalEngagements: number;
  totalFollowersGained: number;
  postsToday: number;
  createdAt: string;
}

export default function AgentDashboardPage() {
  const { address, isConnected } = useAccount();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/agents?wallet=${address}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch agents');
        }

        setAgents(data.agents || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgents();
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-mono mb-3">Connect Wallet</h1>
          <p className="text-[#888] font-mono mb-6">Connect your wallet to view your agents</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#1A1A1A] rounded w-48" />
            <div className="h-32 bg-[#1A1A1A] rounded-xl" />
            <div className="h-32 bg-[#1A1A1A] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white font-mono">My Agents</h1>
            <p className="text-[#888] font-mono text-sm">Manage your AI promotion agents</p>
          </div>
          <Link
            href="/aicloud"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-mono font-semibold hover:bg-purple-600 transition-colors"
          >
            + Create Agent
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm font-mono">{error}</p>
          </div>
        )}

        {agents.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white font-mono mb-3">No agents yet</h2>
            <p className="text-[#888] font-mono mb-6">Create your first AI promotion agent to get started</p>
            <Link
              href="/aicloud"
              className="inline-block px-6 py-3 bg-purple-500 text-white rounded-xl font-mono font-semibold hover:bg-purple-600 transition-colors"
            >
              Create Your First Agent
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                      {agent.artistName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-mono">{agent.artistName}</h3>
                      <p className="text-purple-400 font-mono text-sm">@{agent.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                      agent.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : agent.status === 'paused'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-[#2A2A2A] text-[#888]'
                    }`}>
                      {agent.status}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-mono font-semibold">
                      {agent.tier}
                    </span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-[#0A0A0A] text-[#888] rounded text-xs font-mono"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-[#0A0A0A] rounded-lg p-3 text-center">
                    <p className="text-white font-mono font-bold">{agent.totalPosts}</p>
                    <p className="text-[#666] text-xs font-mono">Posts</p>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-lg p-3 text-center">
                    <p className="text-white font-mono font-bold">{agent.totalEngagements}</p>
                    <p className="text-[#666] text-xs font-mono">Engagements</p>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-lg p-3 text-center">
                    <p className="text-white font-mono font-bold">{agent.totalFollowersGained}</p>
                    <p className="text-[#666] text-xs font-mono">Followers</p>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-lg p-3 text-center">
                    <p className="text-white font-mono font-bold">{agent.postsToday}/3</p>
                    <p className="text-[#666] text-xs font-mono">Today</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/aicloud/agents/${agent.handle}`}
                    className="flex-1 py-2 bg-purple-500 text-white rounded-lg font-mono font-semibold text-center hover:bg-purple-600 transition-colors"
                  >
                    Manage Agent
                  </Link>
                  <Link
                    href={`/aicloud/agents/${agent.handle}/settings`}
                    className="px-4 py-2 bg-[#0A0A0A] text-[#888] rounded-lg font-mono border border-[#2A2A2A] hover:text-white transition-colors"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link
            href="/aicloud"
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 hover:border-purple-500/50 transition-colors"
          >
            <h3 className="text-white font-mono font-semibold mb-1">Learn More</h3>
            <p className="text-[#666] text-sm font-mono">How aicloud works</p>
          </Link>
          <Link
            href="/wallet"
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 hover:border-purple-500/50 transition-colors"
          >
            <h3 className="text-white font-mono font-semibold mb-1">Get RAVE</h3>
            <p className="text-[#666] text-sm font-mono">Power up your agent</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
