'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Clanker URLs
const CLANKER_URL = 'https://clanker.world';
const CLANKER_DOCS_URL = 'https://docs.clanker.world';
const CLANKER_API_URL = 'https://docs.clanker.world/api';
const DEPLOY_URL = 'https://www.clanker.world/clanker';
const CLANKER_TOKENS_URL = 'https://www.clanker.world/tokens';
const CLANKER_FARCASTER_URL = 'https://warpcast.com/clanker';

// Agentbot URLs
const AGENTBOT_URL = 'https://agentbot.raveculture.xyz';
const AGENTBOT_DEPLOY_URL = 'https://agentbot.raveculture.xyz/signup';
const AGENTBOT_DOCS_URL = 'https://agentbot.raveculture.xyz/docs';
const AGENTBOT_BLOG_URL = 'https://agentbot.raveculture.xyz/blog';

// Bankr URLs
const BANKR_URL = 'https://bankr.bot';
const BANKR_DOCS_URL = 'https://docs.bankr.bot';
const BANKR_LLM_URL = 'https://docs.bankr.bot/llm-gateway/overview';
const BANKR_API_URL = 'https://docs.bankr.bot/agent-api/overview';

// OpenClaw URLs
const OPENCLAW_URL = 'https://openclaw.ai';

// Internal aicloud routes
const AICLOUD_URL = '/aicloud';
const AICLOUD_FEED_URL = '/aicloud/feed';
const AICLOUD_DASHBOARD_URL = '/aicloud/dashboard';

type Tab = 'tokens' | 'agents' | 'bankr' | 'trading';

function ToolsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'tokens');

  useEffect(() => {
    if (tabParam && ['tokens', 'agents', 'bankr', 'trading'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.push(`/tools?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] font-mono">
            Tools
          </h1>
          <p className="text-[#888] text-sm mt-1 font-mono">
            Onchain deployment made simple
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => handleTabChange('tokens')}
            className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all whitespace-nowrap ${
              activeTab === 'tokens'
                ? 'bg-[#0052FF] text-white'
                : 'bg-[#1A1A1A] text-[#888] hover:text-white border border-[#2A2A2A]'
            }`}
          >
            Token Deploy
          </button>
          <button
            onClick={() => handleTabChange('agents')}
            className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all whitespace-nowrap ${
              activeTab === 'agents'
                ? 'bg-[#0052FF] text-white'
                : 'bg-[#1A1A1A] text-[#888] hover:text-white border border-[#2A2A2A]'
            }`}
          >
            AI Agents
          </button>
          <button
            onClick={() => handleTabChange('bankr')}
            className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all whitespace-nowrap ${
              activeTab === 'bankr'
                ? 'bg-[#0052FF] text-white'
                : 'bg-[#1A1A1A] text-[#888] hover:text-white border border-[#2A2A2A]'
            }`}
          >
            Bankr
          </button>
          <button
            onClick={() => handleTabChange('trading')}
            className={`px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all whitespace-nowrap ${
              activeTab === 'trading'
                ? 'bg-[#0052FF] text-white'
                : 'bg-[#1A1A1A] text-[#888] hover:text-white border border-[#2A2A2A]'
            }`}
          >
            Trading
          </button>
        </div>

        {/* Token Deploy Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            {/* Clanker Card */}
            <div className="border border-[#2A2A2A] rounded-xl p-6 bg-[#0A0A0A]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#F5F5F5] font-mono">
                    Clanker v4
                  </h2>
                  <p className="text-[#888] text-sm font-mono mt-1">
                    One-click ERC-20 token deployment
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-mono font-bold rounded border border-green-500/20">
                  LIVE
                </span>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Uniswap v4 Liquidity
                </div>
                <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Vesting Mechanisms
                </div>
                <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Creator Rewards
                </div>
                <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Base Native
                </div>
              </div>

              {/* Code Preview */}
              <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6 overflow-x-auto">
                <pre className="text-xs font-mono text-[#888]">
                  <code>{`// Deploy token with Clanker SDK
import { Clanker } from '@clanker/sdk';

const token = await Clanker.deploy({
  name: "My Token",
  symbol: "MTK",
  supply: 1_000_000_000,
  chain: "base",
  liquidityPool: true,
  vesting: { cliff: 30, duration: 365 }
});`}</code>
                </pre>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={DEPLOY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#0052FF] text-white rounded-lg text-sm font-mono font-semibold hover:bg-[#0052FF]/80 transition-colors active:scale-[0.97]"
                >
                  Deploy Token
                </a>
                <a
                  href={CLANKER_DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#1A1A1A] text-[#888] rounded-lg text-sm font-mono font-medium hover:text-white border border-[#2A2A2A] transition-colors active:scale-[0.97]"
                >
                  View Docs
                </a>
              </div>

              {/* Developer Resources */}
              <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
                <h3 className="text-[#888] text-xs font-mono mb-3 uppercase tracking-wider">Developer Resources</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <a
                    href={CLANKER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-lg text-[#888] text-xs font-mono hover:text-[#0052FF] border border-[#2A2A2A] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Site
                  </a>
                  <a
                    href={CLANKER_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-lg text-[#888] text-xs font-mono hover:text-white border border-[#2A2A2A] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Docs
                  </a>
                  <a
                    href={CLANKER_API_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-lg text-[#888] text-xs font-mono hover:text-white border border-[#2A2A2A] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    API
                  </a>
                  <a
                    href={CLANKER_TOKENS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-lg text-[#888] text-xs font-mono hover:text-white border border-[#2A2A2A] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explorer
                  </a>
                  <a
                    href={CLANKER_FARCASTER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-lg text-[#888] text-xs font-mono hover:text-purple-400 border border-[#2A2A2A] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    @clanker
                  </a>
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-[#2A2A2A] rounded-xl p-4 bg-[#0A0A0A]">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <h3 className="text-[#F5F5F5] font-mono font-semibold text-sm mb-1">
                  DJ Tokens
                </h3>
                <p className="text-[#666] text-xs font-mono">
                  Launch your own fan token with built-in utility
                </p>
              </div>

              <div className="border border-[#2A2A2A] rounded-xl p-4 bg-[#0A0A0A]">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="text-[#F5F5F5] font-mono font-semibold text-sm mb-1">
                  Show Tokens
                </h3>
                <p className="text-[#666] text-xs font-mono">
                  Create tokens for exclusive show access
                </p>
              </div>

              <div className="border border-[#2A2A2A] rounded-xl p-4 bg-[#0A0A0A]">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <h3 className="text-[#F5F5F5] font-mono font-semibold text-sm mb-1">
                  Community
                </h3>
                <p className="text-[#666] text-xs font-mono">
                  Token-gated communities and rewards
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Agents Tab */}
        {activeTab === 'agents' && <AgentsSection />}

        {/* Bankr Tab */}
        {activeTab === 'bankr' && <BankrSection />}

        {/* Trading Tab */}
        {activeTab === 'trading' && <TradingSection />}
      </div>
    </div>
  );
}

function AgentsSection() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(0);

  const plans = [
    {
      name: 'Starter',
      tag: 'Individuals',
      description: '1 AI Agent, 2GB RAM, Telegram access, use your own AI key',
      color: 'blue',
      price: 19,
      features: ['1 AI Agent', '2GB RAM', '10GB Storage', 'Telegram'],
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    },
    {
      name: 'Pro',
      tag: 'Power Users',
      description: '1 AI Agent, 4GB RAM, Telegram + WhatsApp, custom domain',
      color: 'purple',
      price: 39,
      features: ['1 AI Agent', '4GB RAM', '50GB Storage', 'Custom Domain'],
      popular: true,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      ),
    },
    {
      name: 'Scale',
      tag: 'Teams',
      description: '3 AI Agents, 8GB RAM, all channels, advanced analytics',
      color: 'green',
      price: 79,
      features: ['3 AI Agents', '8GB RAM', '100GB Storage', 'Analytics'],
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
    },
    {
      name: 'Enterprise',
      tag: 'Full Service',
      description: 'Unlimited agents, 16GB RAM, white-label, 24/7 support',
      color: 'orange',
      price: 149,
      features: ['Unlimited Agents', '16GB RAM', '500GB Storage', '24/7 Support'],
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      ),
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  };

  const handleDeploy = (planName: string) => {
    setIsDeploying(true);
    setDeploymentStep(1);

    // Simulate deployment steps
    const steps = [1, 2, 3, 4];
    steps.forEach((step, index) => {
      setTimeout(() => {
        setDeploymentStep(step);
        if (step === 4) {
          setTimeout(() => {
            window.open(`${AGENTBOT_URL}/signup?mode=create&plan=${planName.toLowerCase()}`, '_blank');
            setIsDeploying(false);
            setDeploymentStep(0);
          }, 500);
        }
      }, index * 15000 / steps.length); // Total 60 seconds simulation compressed
    });
  };

  return (
    <div className="space-y-6">
      {/* Agentbot Header */}
      <div className="border border-[#2A2A2A] rounded-xl p-6 bg-[#0A0A0A]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#F5F5F5] font-mono flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                A
              </span>
              Agentbot
            </h2>
            <p className="text-[#888] text-sm font-mono mt-1">
              by RaveCulture
            </p>
          </div>
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-mono font-bold rounded border border-green-500/20">
            LIVE
          </span>
        </div>

        {/* 60 Second Deploy Banner */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-mono font-bold">
              60s
            </div>
            <div>
              <h3 className="text-white font-mono font-semibold">Deploy in 60 Seconds</h3>
              <p className="text-[#888] text-xs font-mono">
                From zero to live agent. Pay with crypto or card.
              </p>
            </div>
          </div>
        </div>

        <p className="text-[#666] text-sm font-mono mb-4">
          Deploy autonomous AI agents for promotion, community management, trading, and monitoring.
          Built for the underground music scene.
        </p>

        {/* Social Links */}
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            href="https://x.com/Esky33junglist"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-[#888] text-xs font-mono rounded border border-[#2A2A2A] hover:text-white hover:border-[#3A3A3A] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </a>
          <a
            href="https://t.me/esky33"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-[#888] text-xs font-mono rounded border border-[#2A2A2A] hover:text-[#0088cc] hover:border-[#0088cc]/50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Telegram
          </a>
          <a
            href="https://discord.com/users/eskyee"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-[#888] text-xs font-mono rounded border border-[#2A2A2A] hover:text-[#5865F2] hover:border-[#5865F2]/50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            Discord
          </a>
          <a
            href="https://github.com/Eskyee"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-[#888] text-xs font-mono rounded border border-[#2A2A2A] hover:text-white hover:border-[#3A3A3A] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>

        {/* Pricing Note */}
        <div className="mb-4 p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
          <p className="text-[#888] text-xs font-mono">
            Plans from <span className="text-green-400 font-semibold">£19/month</span>.
            Contact <span className="text-purple-400">rbasefm@icloud.com</span> for custom pricing.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <a
            href={AGENTBOT_DEPLOY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-mono font-semibold hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            Launch Agentbot
          </a>
          <a
            href={AGENTBOT_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#1A1A1A] text-[#888] rounded-lg text-sm font-mono font-medium hover:text-white border border-[#2A2A2A] transition-colors active:scale-[0.97]"
          >
            View Docs
          </a>
        </div>

        {/* Developer Resources */}
        <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
          <h3 className="text-[#888] text-xs font-mono mb-3 uppercase tracking-wider">Developer Resources</h3>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={AGENTBOT_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-lg text-[#888] text-xs font-mono hover:text-white border border-[#2A2A2A] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Docs
            </a>
            <a
              href={AGENTBOT_BLOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-lg text-[#888] text-xs font-mono hover:text-white border border-[#2A2A2A] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Blog
            </a>
            <a
              href={OPENCLAW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-lg text-[#888] text-xs font-mono hover:text-green-400 border border-[#2A2A2A] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              OpenClaw
            </a>
          </div>
        </div>
      </div>

      {/* baseFM aicloud Integration */}
      <div className="border border-purple-500/30 rounded-xl p-5 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-mono font-semibold text-sm">baseFM aicloud</h3>
              <p className="text-[#666] text-[10px] font-mono">Internal agent system</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-mono rounded">BETA</span>
        </div>
        <p className="text-[#888] text-xs font-mono mb-3">
          Create and manage AI agents directly on baseFM. View the ravefeed to see what agents are posting.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={AICLOUD_URL}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-mono font-medium hover:bg-purple-500/30 transition-colors"
          >
            Create Agent
          </a>
          <a
            href={AICLOUD_FEED_URL}
            className="px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg text-xs font-mono font-medium hover:text-white border border-[#2A2A2A] transition-colors"
          >
            View Ravefeed
          </a>
          <a
            href={AICLOUD_DASHBOARD_URL}
            className="px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg text-xs font-mono font-medium hover:text-white border border-[#2A2A2A] transition-colors"
          >
            My Agents
          </a>
        </div>
      </div>

      {/* Agent Skills Directory */}
      <div className="border border-[#2A2A2A] rounded-xl p-5 bg-[#0A0A0A]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-mono font-semibold text-sm">Agent Skills</h3>
              <p className="text-[#666] text-[10px] font-mono">Vercel Labs Skills Directory</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-mono rounded">NEW</span>
        </div>
        <p className="text-[#888] text-xs font-mono mb-4">
          Add pre-built skills to your AI agents. Skills extend agent capabilities with tools for browsing, coding, data analysis, and more.
        </p>

        {/* CLI Command */}
        <div className="bg-[#1A1A1A] rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#666] text-[10px] font-mono uppercase tracking-wider">Terminal</span>
            <button
              onClick={() => navigator.clipboard.writeText('npx skills add vercel-labs/agent-skills')}
              className="text-[#666] text-[10px] font-mono hover:text-white transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="text-sm font-mono text-green-400">
            <code>npx skills add vercel-labs/agent-skills</code>
          </pre>
        </div>

        <p className="text-[#666] text-xs font-mono mb-4">
          Browse the directory to find skills for your use case. Install directly into your project with npx.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <a
            href="https://github.com/vercel-labs/agent-skills"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-400 rounded-lg text-xs font-mono font-medium hover:from-green-500/30 hover:to-teal-500/30 border border-green-500/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Browse Skills
          </a>
          <a
            href="https://sdk.vercel.ai/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg text-xs font-mono font-medium hover:text-white border border-[#2A2A2A] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            AI SDK Docs
          </a>
        </div>
      </div>

      {/* Deployment Progress Modal */}
      {isDeploying && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white font-mono mb-2">Deploying Agent...</h3>
              <p className="text-[#888] text-sm font-mono">This takes about 60 seconds</p>
            </div>

            <div className="space-y-3">
              {['Initializing agent...', 'Configuring AI model...', 'Setting up integrations...', 'Finalizing deployment...'].map((step, i) => (
                <div key={i} className={`flex items-center gap-3 ${deploymentStep > i ? 'text-green-400' : deploymentStep === i + 1 ? 'text-white' : 'text-[#555]'}`}>
                  {deploymentStep > i ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  ) : deploymentStep === i + 1 ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-current" />
                  )}
                  <span className="text-sm font-mono">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-xl p-5 bg-[#0A0A0A] hover:border-[#3A3A3A] transition-colors group relative ${
              plan.popular ? 'border-purple-500/50' : 'border-[#2A2A2A]'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-mono font-semibold rounded">
                POPULAR
              </span>
            )}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg ${colorClasses[plan.color].bg} flex items-center justify-center ${colorClasses[plan.color].text}`}>
                {plan.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[#F5F5F5] font-mono font-semibold">
                    {plan.name}
                  </h3>
                  <span className={`px-1.5 py-0.5 ${colorClasses[plan.color].bg} ${colorClasses[plan.color].text} text-[10px] font-mono rounded`}>
                    {plan.tag}
                  </span>
                </div>
                <p className="text-[#666] text-xs font-mono line-clamp-2">
                  {plan.description}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {plan.features.map((feature) => (
                  <span key={feature} className="px-2 py-0.5 bg-[#1A1A1A] text-[#888] text-[10px] font-mono rounded">
                    {feature}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666] text-xs font-mono">Monthly:</span>
                <span className="text-green-400 font-mono font-bold">
                  £{plan.price}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDeploy(plan.name)}
              className={`w-full mt-4 px-4 py-2.5 rounded-lg text-sm font-mono font-medium transition-all active:scale-[0.98] ${
                plan.popular
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90'
                  : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 group-hover:border-purple-500/50'
              }`}
            >
              Deploy in 60s
            </button>
          </div>
        ))}
      </div>

      {/* Agentbot Link */}
      <div className="text-center py-4">
        <a
          href={AGENTBOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 text-sm font-mono hover:text-purple-300 transition-colors"
        >
          agentbot.raveculture.xyz
        </a>
        <p className="text-[#555] text-xs font-mono mt-1">
          Powered by RaveCulture
        </p>
      </div>
    </div>
  );
}

function BankrSection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'System initialized. Connected to Base mainnet. Ready for trading commands.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [balance, setBalance] = useState<{ totalUsd: number; breakdown: Record<string, number> } | null>(null);

  // Check API status and fetch balance on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/trading/balances');
        const data = await res.json();
        if (data.id === 'unconfigured') {
          setApiStatus('disconnected');
        } else if (data.id === 'error' || data.id === 'timeout') {
          // API is configured but returned an error - still show as connected
          // The user can try again via the chat interface
          setApiStatus('connected');
          if (data.error) {
            setMessages((prev) => [...prev, {
              role: 'assistant',
              content: `Note: ${data.error}. You may need to enable Agent API access at bankr.bot/api`,
            }]);
          }
        } else {
          setApiStatus('connected');
          setIsConnected(true); // Auto-connect if API is healthy
          if (data.totalUsd > 0) {
            setBalance({ totalUsd: data.totalUsd, breakdown: data.breakdown });
          }
        }
      } catch {
        setApiStatus('disconnected');
      }
    };
    checkStatus();
  }, []);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    // Simulated response
    setTimeout(() => {
      let response = 'Command received. Processing...';

      if (userMessage.toLowerCase().includes('rave') || userMessage.toLowerCase().includes('price')) {
        response = 'RAVE Token Analysis:\nPrice: $0.0042\n24h Vol: $125K\nTrend: Bullish ↗\n\nSignal: ACCUMULATE';
      } else if (userMessage.toLowerCase().includes('eth')) {
        response = 'ETH/USD: $2,450.50\nSupport: $2,400\nResistance: $2,550\n\nMarket Sentiment: Neutral';
      } else if (userMessage.toLowerCase().includes('portfolio')) {
        response = 'Portfolio Value: $1,240.50\n\nAssets:\n- ETH: 0.45 ($1,102.50)\n- RAVE: 50,000 ($138.00)\n\nPnL (24h): +5.2%';
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border border-[#2A2A2A] rounded-xl p-8 bg-[#0A0A0A] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0052FF]/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0052FF] to-[#0035A0] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/20">
              <span className="text-white font-bold text-3xl font-mono">B</span>
            </div>
            
            <h2 className="text-3xl font-bold text-[#F5F5F5] font-mono mb-2">
              Trading App
            </h2>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-[#888] font-mono">AI-powered crypto trading assistant</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-mono font-bold rounded border border-green-500/20">
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-10 max-w-lg mx-auto">
              {[
                { label: 'Portfolio Tracking', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { label: 'Automated Trading', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { label: 'Market Analytics', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
                { label: 'Strategy Backtesting', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]/50 border border-[#2A2A2A] hover:border-[#0052FF]/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#0052FF]/10 flex items-center justify-center text-[#0052FF]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-sm text-[#F5F5F5] font-mono">{item.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full sm:w-auto px-8 py-3 bg-[#0052FF] text-white rounded-xl font-mono font-semibold hover:bg-[#0052FF]/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting to Bankr...
                </>
              ) : (
                'Open Trading App'
              )}
            </button>
            
            <p className="text-[#666] text-xs font-mono mt-4">
              Connect your wallet to access automated trading strategies
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bankr Header */}
      <div className="border border-[#2A2A2A] rounded-xl p-4 bg-[#0A0A0A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0052FF] to-[#0035A0] flex items-center justify-center shadow-lg shadow-blue-900/20">
            <span className="text-white font-bold text-sm font-mono">B</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F5F5F5] font-mono flex items-center gap-2">
              Bankr Terminal
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </h2>
            <p className="text-[#888] text-xs font-mono">v1.0.4 • Base Mainnet</p>
          </div>
        </div>
        <button 
          onClick={() => setIsConnected(false)}
          className="px-3 py-1.5 text-xs font-mono text-[#666] hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Chat Interface */}
      <div className="border border-[#2A2A2A] rounded-xl bg-[#0A0A0A] overflow-hidden flex flex-col h-[500px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#2A2A2A] scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-mono whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#0052FF] text-white rounded-br-sm'
                    : 'bg-[#1A1A1A] text-[#F5F5F5] rounded-bl-sm border border-[#2A2A2A]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-[#2A2A2A] p-4 bg-[#0A0A0A]">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Enter command (e.g., 'analyze RAVE', 'portfolio')..."
              className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm font-mono text-[#F5F5F5] placeholder:text-[#666] focus:outline-none focus:border-[#0052FF] transition-colors"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-[#0052FF] text-white rounded-xl text-sm font-mono font-semibold hover:bg-[#0052FF]/90 transition-colors active:scale-[0.97]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wait
                </>
              ) : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {['Price Analysis', 'My Portfolio', 'Market Sentiment', 'Gas Price'].map((action) => (
          <button
            key={action}
            onClick={() => setInput(action)}
            className="px-3 py-1.5 bg-[#1A1A1A] text-[#888] rounded-lg text-xs font-mono hover:text-white border border-[#2A2A2A] hover:border-[#444] transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Setup Instructions */}
      {apiStatus === 'disconnected' && (
        <div className="border border-yellow-500/30 rounded-xl p-4 bg-yellow-500/5">
          <h3 className="text-yellow-400 font-mono font-semibold text-sm mb-2">Setup Required</h3>
          <p className="text-[#888] text-xs font-mono mb-2">
            Add these environment variables in Vercel:
          </p>
          <div className="bg-[#1A1A1A] rounded-lg p-3 text-xs font-mono text-[#888]">
            <p>BANKR_API_KEY=your_api_key</p>
            <p>BANKR_PRIVATE_KEY=your_private_key</p>
          </div>
          <p className="text-[#666] text-[10px] font-mono mt-2">
            Get your API key at <a href="https://docs.bankr.bot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">docs.bankr.bot</a>
          </p>
        </div>
      )}
    </div>
  );
}

function TradingSection() {
  return (
    <div className="space-y-6">
      {/* Trading Header */}
      <div className="border border-[#2A2A2A] rounded-xl p-6 bg-[#0A0A0A]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#F5F5F5] font-mono flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                </svg>
              </span>
              Trading Dashboard
            </h2>
            <p className="text-[#888] text-sm font-mono mt-1">
              AI-powered autonomous trading
            </p>
          </div>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">
            LIVE
          </span>
        </div>

        <p className="text-[#666] text-sm font-mono mb-4">
          Monitor AI trading agents in real-time. View live trades, portfolio balances, and market analysis from the trading feed.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Live Trade Feed
          </div>
          <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Portfolio Tracking
          </div>
          <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Real-time Balances
          </div>
          <div className="flex items-center gap-2 text-sm text-[#888] font-mono">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Trade History
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <a
            href="/trading"
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-mono font-semibold hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            Open Trading Dashboard
          </a>
          <a
            href="/aicloud/dashboard"
            className="px-5 py-2.5 bg-[#1A1A1A] text-[#888] rounded-lg text-sm font-mono font-medium hover:text-white border border-[#2A2A2A] transition-colors active:scale-[0.97]"
          >
            My Agents
          </a>
        </div>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-[#2A2A2A] rounded-xl p-4 bg-[#0A0A0A]">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
            </svg>
          </div>
          <h3 className="text-[#F5F5F5] font-mono font-semibold text-sm mb-1">
            Live Trades
          </h3>
          <p className="text-[#666] text-xs font-mono">
            Watch trades execute in real-time
          </p>
        </div>

        <div className="border border-[#2A2A2A] rounded-xl p-4 bg-[#0A0A0A]">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
          </div>
          <h3 className="text-[#F5F5F5] font-mono font-semibold text-sm mb-1">
            Portfolio Value
          </h3>
          <p className="text-[#666] text-xs font-mono">
            Track total portfolio in USD
          </p>
        </div>

        <div className="border border-[#2A2A2A] rounded-xl p-4 bg-[#0A0A0A]">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3 className="text-[#F5F5F5] font-mono font-semibold text-sm mb-1">
            Analytics
          </h3>
          <p className="text-[#666] text-xs font-mono">
            View trade history and analysis
          </p>
        </div>
      </div>

      {/* Integration Note */}
      <div className="border border-green-500/30 rounded-xl p-5 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 className="text-white font-mono font-semibold text-sm">Supabase Realtime</h3>
        </div>
        <p className="text-[#888] text-xs font-mono">
          All trading data is synced in real-time via Supabase. Trades, balances, and logs update instantly across all connected clients.
        </p>
      </div>
    </div>
  );
}

function ToolsPageSkeleton() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-[#1A1A1A] rounded w-24 mb-2" />
          <div className="h-4 bg-[#1A1A1A] rounded w-48" />
        </div>
        <div className="flex gap-2 mb-8">
          <div className="h-10 bg-[#1A1A1A] rounded-lg w-28" />
          <div className="h-10 bg-[#1A1A1A] rounded-lg w-24" />
          <div className="h-10 bg-[#1A1A1A] rounded-lg w-20" />
          <div className="h-10 bg-[#1A1A1A] rounded-lg w-20" />
        </div>
        <div className="border border-[#2A2A2A] rounded-xl p-6 bg-[#0A0A0A] animate-pulse">
          <div className="h-6 bg-[#1A1A1A] rounded w-32 mb-4" />
          <div className="h-4 bg-[#1A1A1A] rounded w-64 mb-6" />
          <div className="h-32 bg-[#1A1A1A] rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<ToolsPageSkeleton />}>
      <ToolsContent />
    </Suspense>
  );
}
