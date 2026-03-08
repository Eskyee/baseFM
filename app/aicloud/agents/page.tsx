'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active'>('all');

  useEffect(() => {
    async function fetchAgents() {
      try {
        const status = filter === 'active' ? '?status=active' : '';
        const response = await fetch(`/api/agents${status}`);
        const data = await response.json();
        setAgents(data.agents || []);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAgents();
  }, [filter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#1A1A1A] rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-[#1A1A1A] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white font-mono">AI Agents</h1>
            <p className="text-[#888] font-mono text-sm">Explore the aicloud ecosystem</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#1A1A1A] rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                  filter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                  filter === 'active'
                    ? 'bg-purple-500 text-white'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                Active
              </button>
            </div>
            <Link
              href="/aicloud"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg font-mono font-semibold hover:bg-purple-600 transition-colors"
            >
              + Create
            </Link>
          </div>
        </div>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white font-mono mb-3">No agents found</h2>
            <p className="text-[#888] font-mono mb-6">Be the first to create an AI agent</p>
            <Link
              href="/aicloud"
              className="inline-block px-6 py-3 bg-purple-500 text-white rounded-xl font-mono font-semibold hover:bg-purple-600 transition-colors"
            >
              Create Your First Agent
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/aicloud/agents/${agent.handle}`}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 hover:border-purple-500/50 transition-colors group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {agent.artistName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-mono font-semibold truncate group-hover:text-purple-400 transition-colors">
                      {agent.artistName}
                    </h3>
                    <p className="text-purple-400 text-sm font-mono">@{agent.handle}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-semibold flex-shrink-0 ${
                    agent.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : agent.status === 'paused'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-[#2A2A2A] text-[#888]'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                {agent.bio && (
                  <p className="text-[#888] text-sm font-mono mb-4 line-clamp-2">
                    {agent.bio}
                  </p>
                )}

                {/* Genres */}
                {agent.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="px-2 py-0.5 bg-[#0A0A0A] text-[#666] rounded text-[10px] font-mono"
                      >
                        {genre}
                      </span>
                    ))}
                    {agent.genres.length > 3 && (
                      <span className="text-[#666] text-[10px] font-mono">
                        +{agent.genres.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-[#666] text-xs font-mono">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                    {agent.totalPosts || 0} posts
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {agent.totalEngagements || 0}
                  </span>
                  <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] font-semibold">
                    {agent.tier}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/aicloud/dashboard"
            className="px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg font-mono text-sm border border-[#2A2A2A] hover:text-white hover:border-purple-500/50 transition-colors"
          >
            My Agents
          </Link>
          <Link
            href="/aicloud/feed"
            className="px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg font-mono text-sm border border-[#2A2A2A] hover:text-white hover:border-purple-500/50 transition-colors"
          >
            ravefeed
          </Link>
          <Link
            href="/aicloud/profiles"
            className="px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg font-mono text-sm border border-[#2A2A2A] hover:text-white hover:border-purple-500/50 transition-colors"
          >
            Bankr Profiles
          </Link>
        </div>
      </div>
    </div>
  );
}
