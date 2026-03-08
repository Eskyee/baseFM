'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

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
  postingFrequency: string;
  tone: string;
  peakHoursStart: number;
  peakHoursEnd: number;
  autoReply: boolean;
  autoLike: boolean;
  autoFollow: boolean;
  createdAt: string;
  activatedAt: string | null;
}

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default function AgentManagePage({ params }: PageProps) {
  const { handle } = use(params);
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgent() {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/agents/${handle}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Agent not found');
        }

        setAgent(data.agent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agent');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgent();
  }, [handle, address, isConnected]);

  const handleActivate = async () => {
    if (!agent || !address) return;

    setIsActivating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const action = agent.status === 'active' ? 'pause' : 'activate';
      const response = await fetch(`/api/agents/${handle}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} agent`);
      }

      setAgent(data.agent);
      setSuccessMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsActivating(false);
    }
  };

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
          <p className="text-[#888] font-mono">Connect your wallet to manage this agent</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#1A1A1A] rounded w-48" />
            <div className="h-48 bg-[#1A1A1A] rounded-xl" />
            <div className="h-32 bg-[#1A1A1A] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-mono mb-3">Agent Not Found</h1>
          <p className="text-[#888] font-mono mb-6">{error}</p>
          <Link href="/aicloud/dashboard" className="text-purple-400 hover:text-purple-300 font-mono">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!agent) return null;

  const postsLimit = agent.tier === 'label' ? 100 : agent.tier === 'pro' ? 20 : 3;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/aicloud/dashboard"
          className="inline-flex items-center gap-2 text-[#888] hover:text-white font-mono text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Agent Header */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl">
              {agent.artistName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white font-mono">{agent.artistName}</h1>
              <p className="text-purple-400 font-mono">@{agent.handle}</p>
              <div className="flex items-center gap-2 mt-2">
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
          </div>

          {/* Activation Button */}
          <button
            onClick={handleActivate}
            disabled={isActivating || agent.status === 'suspended'}
            className={`w-full py-4 rounded-xl font-mono font-bold text-lg transition-all ${
              agent.status === 'active'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                : agent.status === 'suspended'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
            }`}
          >
            {isActivating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : agent.status === 'suspended' ? (
              'Agent Suspended'
            ) : agent.status === 'active' ? (
              'Pause Agent'
            ) : (
              'Activate Agent'
            )}
          </button>

          {successMessage && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm font-mono text-center">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm font-mono text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Status Explanation */}
        {agent.status === 'inactive' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-400 font-mono font-semibold mb-1">Agent is inactive</p>
                <p className="text-[#888] font-mono text-sm">
                  Click &quot;Activate Agent&quot; above to enable your agent. Once active, your agent will be ready for posting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Limitations Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-yellow-400 font-mono font-semibold mb-1">Beta Notice</p>
              <p className="text-[#888] font-mono text-sm">
                AI agents are in early development. Automatic posting to social platforms (Farcaster, Twitter) is coming soon. For now, agents can be created and prepared for launch.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-[#666] font-mono text-xs mb-1">Posts Today</p>
            <p className="text-2xl font-bold text-white font-mono">{agent.postsToday}/{postsLimit}</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-[#666] font-mono text-xs mb-1">Total Posts</p>
            <p className="text-2xl font-bold text-white font-mono">{agent.totalPosts}</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-[#666] font-mono text-xs mb-1">Engagements</p>
            <p className="text-2xl font-bold text-white font-mono">{agent.totalEngagements}</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-[#666] font-mono text-xs mb-1">Followers Gained</p>
            <p className="text-2xl font-bold text-white font-mono">{agent.totalFollowersGained}</p>
          </div>
        </div>

        {/* Genres */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-6">
          <p className="text-[#666] font-mono text-xs mb-3">Genres</p>
          <div className="flex flex-wrap gap-2">
            {agent.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-mono"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Settings Summary */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-mono font-semibold">Agent Settings</p>
            <Link
              href={`/aicloud/agents/${agent.handle}/settings`}
              className="text-purple-400 hover:text-purple-300 font-mono text-sm"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#888] font-mono text-sm">Posting Frequency</span>
              <span className="text-white font-mono text-sm capitalize">{agent.postingFrequency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#888] font-mono text-sm">Tone</span>
              <span className="text-white font-mono text-sm capitalize">{agent.tone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#888] font-mono text-sm">Peak Hours (UTC)</span>
              <span className="text-white font-mono text-sm">{agent.peakHoursStart}:00 - {agent.peakHoursEnd}:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#888] font-mono text-sm">Auto Features</span>
              <div className="flex gap-2">
                {agent.autoReply && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">Reply</span>
                )}
                {agent.autoLike && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">Like</span>
                )}
                {agent.autoFollow && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">Follow</span>
                )}
                {!agent.autoReply && !agent.autoLike && !agent.autoFollow && (
                  <span className="text-[#666] font-mono text-xs">None enabled</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/aicloud/feed"
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 hover:border-purple-500/50 transition-colors text-center"
          >
            <svg className="w-6 h-6 text-purple-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <p className="text-white font-mono font-semibold text-sm">View Feed</p>
          </Link>
          <Link
            href={`/aicloud/agents/${agent.handle}/settings`}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 hover:border-purple-500/50 transition-colors text-center"
          >
            <svg className="w-6 h-6 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-white font-mono font-semibold text-sm">Settings</p>
          </Link>
        </div>

        {/* Created At */}
        <p className="text-center text-[#666] font-mono text-xs mt-8">
          Created {new Date(agent.createdAt).toLocaleDateString()}
          {agent.activatedAt && ` | Activated ${new Date(agent.activatedAt).toLocaleDateString()}`}
        </p>
      </div>
    </div>
  );
}
