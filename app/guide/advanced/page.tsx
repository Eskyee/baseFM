'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Advanced Guide Page (Developer Edition)
 *
 * Official documentation and resources for developers building on baseFM.
 * Links to external docs for Bankr, Clanker, Agentbot, and Farcaster.
 * No internal implementation details - just official resources.
 */

export default function AdvancedGuidePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bankr' | 'clanker' | 'agentbot' | 'streaming'>('overview');

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="text-center mb-8">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-sm text-[#666] hover:text-[#888] mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to guides
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-2">
            Developer Guide
          </h1>
          <p className="text-[#888]">
            Official documentation and resources for building on baseFM
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { id: 'bankr', label: 'Bankr SDK', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
            { id: 'clanker', label: 'Clanker', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { id: 'agentbot', label: 'Agentbot', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
            { id: 'streaming', label: 'Streaming', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-purple-400">|</span>
                  What is baseFM?
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <p className="text-[#888] mb-4">
                    baseFM is an onchain radio platform built on <strong className="text-[#F5F5F5]">Base</strong> (Coinbase L2).
                    DJs stream live music, listeners tune in, and everything is powered by crypto wallets.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="bg-[#0A0A0A] rounded-xl p-4 text-center">
                      <span className="text-2xl mb-2 block">
                        <svg className="w-6 h-6 mx-auto text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </span>
                      <p className="text-[#F5F5F5] font-medium text-sm">Base L2</p>
                      <p className="text-[#666] text-xs">Chain ID 8453</p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-4 text-center">
                      <span className="text-2xl mb-2 block">
                        <svg className="w-6 h-6 mx-auto text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </span>
                      <p className="text-[#F5F5F5] font-medium text-sm">Live Streaming</p>
                      <p className="text-[#666] text-xs">HLS via Mux</p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-4 text-center">
                      <span className="text-2xl mb-2 block">
                        <svg className="w-6 h-6 mx-auto text-green-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                      </span>
                      <p className="text-[#F5F5F5] font-medium text-sm">Wallet Auth</p>
                      <p className="text-[#666] text-xs">Base Wallet</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-purple-400">|</span>
                  RAVE Token
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Contract</span>
                      <a
                        href="https://basescan.org/token/0xdf3c79a5759eeedb844e7481309a75037b8e86f5"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 font-mono text-xs sm:text-sm break-all hover:underline"
                      >
                        0xdf3c...86f5
                      </a>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Chain</span>
                      <span className="text-[#F5F5F5]">Base (8453)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Symbol / Name</span>
                      <span className="text-purple-400 font-mono">RAVE / RaveCulture</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">DJ Access</span>
                      <span className="text-green-400">5,000 RAVE</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666]">View on</span>
                      <div className="flex gap-2">
                        <a
                          href="https://basescan.org/token/0xdf3c79a5759eeedb844e7481309a75037b8e86f5"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline"
                        >
                          BaseScan
                        </a>
                        <span className="text-[#333]">|</span>
                        <a
                          href="https://www.geckoterminal.com/base/pools/0xdf3c79a5759eeedb844e7481309a75037b8e86f5"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline"
                        >
                          GeckoTerminal
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-purple-400">|</span>
                  Supported Payment Tokens
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { symbol: 'ETH', name: 'Ethereum', decimals: 18, color: 'text-blue-400', use: 'Tips, Gas' },
                    { symbol: 'USDC', name: 'USD Coin', decimals: 6, color: 'text-green-400', use: 'Tickets, Tips' },
                    { symbol: 'RAVE', name: 'RaveCulture', decimals: 18, color: 'text-purple-400', use: 'Access, Tips' },
                    { symbol: 'cbBTC', name: 'Coinbase BTC', decimals: 8, color: 'text-orange-400', use: 'Tips' },
                  ].map((token) => (
                    <div key={token.symbol} className="bg-[#1A1A1A] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-mono font-bold ${token.color}`}>{token.symbol}</span>
                        <span className="text-[#666] text-xs">{token.decimals} decimals</span>
                      </div>
                      <p className="text-[#888] text-sm">{token.name}</p>
                      <p className="text-[#666] text-xs mt-1">Used for: {token.use}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-purple-400">|</span>
                  Quick Links
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href="https://base.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#F5F5F5] font-medium">Base Network</p>
                        <p className="text-[#666] text-sm">base.org</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                  <a
                    href="https://docs.base.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#F5F5F5] font-medium">Base Docs</p>
                        <p className="text-[#666] text-sm">docs.base.org</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                  <a
                    href="https://onchainkit.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#F5F5F5] font-medium">OnchainKit</p>
                        <p className="text-[#666] text-sm">onchainkit.xyz</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                  <a
                    href="https://www.mux.com/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#F5F5F5] font-medium">Mux Streaming</p>
                        <p className="text-[#666] text-sm">mux.com/docs</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                </div>
              </section>
            </>
          )}

          {/* Bankr SDK Tab */}
          {activeTab === 'bankr' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-green-400">|</span>
                  Bankr SDK
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <p className="text-[#888] mb-4">
                    Bankr is an AI-powered crypto trading assistant that handles onchain operations via natural language prompts.
                    Use it for NFT minting, token swaps, and portfolio management.
                  </p>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-400 text-sm font-medium mb-2">Official Documentation</p>
                    <a
                      href="https://docs.bankr.bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      docs.bankr.bot
                    </a>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-green-400">|</span>
                  Bankr Resources
                </h2>
                <div className="grid gap-3">
                  {[
                    { name: 'Full Documentation', url: 'https://docs.bankr.bot', desc: 'Complete Bankr docs' },
                    { name: 'LLM Documentation', url: 'https://docs.bankr.bot/llm', desc: 'AI/LLM-friendly docs for agents' },
                    { name: 'API Reference', url: 'https://docs.bankr.bot/api', desc: 'Agent API endpoints' },
                    { name: 'SDK Reference', url: 'https://docs.bankr.bot/sdk', desc: 'JavaScript/TypeScript SDK' },
                    { name: 'Dashboard', url: 'https://bankr.bot/dashboard', desc: 'Manage API keys' },
                    { name: 'Get API Key', url: 'https://bankr.bot/api', desc: 'Register for access' },
                  ].map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[#F5F5F5] font-medium">{link.name}</p>
                        <p className="text-[#666] text-sm">{link.desc}</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-green-400">|</span>
                  Bankr Features
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { feature: 'NFT Minting', desc: 'Mint ERC-721/1155 tokens via prompts' },
                    { feature: 'Token Swaps', desc: 'Execute trades on DEXs' },
                    { feature: 'Portfolio Tracking', desc: 'Check balances across chains' },
                    { feature: 'Trading Agents', desc: 'Automated trading strategies' },
                  ].map((item) => (
                    <div key={item.feature} className="bg-[#1A1A1A] rounded-xl p-4">
                      <p className="text-[#F5F5F5] font-medium mb-1">{item.feature}</p>
                      <p className="text-[#888] text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-green-400">|</span>
                  Quick Start
                </h2>
                <div className="bg-[#0A0A0A] rounded-2xl p-5 font-mono text-sm overflow-x-auto">
                  <pre className="text-[#888]">
{`# Install the SDK
npm install @bankr/sdk

# Initialize client (see docs.bankr.bot for setup)
import { BankrClient } from '@bankr/sdk';

const bankr = new BankrClient({
  apiKey: process.env.BANKR_API_KEY,
  network: 'base',
});

# Full documentation at docs.bankr.bot/sdk`}
                  </pre>
                </div>
              </section>
            </>
          )}

          {/* Clanker Tab */}
          {activeTab === 'clanker' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-orange-400">|</span>
                  Clanker Token Deployment
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <p className="text-[#888] mb-4">
                    Clanker v4 provides one-click ERC-20 token deployment on Base with built-in Uniswap v4 liquidity.
                    Deploy tokens via Farcaster, API, or the web UI.
                  </p>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <p className="text-orange-400 text-sm font-medium mb-2">Official Documentation</p>
                    <a
                      href="https://clanker.gitbook.io/clanker-documentation"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      clanker.gitbook.io
                    </a>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-orange-400">|</span>
                  Clanker Resources
                </h2>
                <div className="grid gap-3">
                  {[
                    { name: 'Documentation', url: 'https://clanker.gitbook.io/clanker-documentation', desc: 'Full Clanker docs' },
                    { name: 'SDK Reference', url: 'https://clanker.gitbook.io/clanker-documentation/sdk/v4.0.0', desc: 'SDK v4.0.0 docs' },
                    { name: 'Token Deployer', url: 'https://clanker.world/deploy', desc: 'Deploy via web UI' },
                    { name: 'Farcaster Bot', url: 'https://warpcast.com/clanker', desc: 'Deploy via cast @clanker' },
                    { name: 'Token Explorer', url: 'https://www.clanker.world/tokens', desc: 'Browse deployed tokens' },
                  ].map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1A1A1A] rounded-xl p-4 hover:bg-[#222] transition-colors group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[#F5F5F5] font-medium">{link.name}</p>
                        <p className="text-[#666] text-sm">{link.desc}</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-orange-400">|</span>
                  Clanker Features
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { feature: 'Uniswap v4 Liquidity', desc: 'Automatic DEX liquidity on deployment' },
                    { feature: 'Vesting Mechanisms', desc: 'Built-in token vesting for teams' },
                    { feature: 'Creator Rewards', desc: '40% of LP rewards to deployer' },
                    { feature: 'Farcaster Integration', desc: 'Deploy via social cast' },
                  ].map((item) => (
                    <div key={item.feature} className="bg-[#1A1A1A] rounded-xl p-4">
                      <p className="text-[#F5F5F5] font-medium mb-1">{item.feature}</p>
                      <p className="text-[#888] text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-orange-400">|</span>
                  Deployment Methods
                </h2>
                <div className="space-y-3">
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">Easiest</span>
                      <p className="text-[#F5F5F5] font-medium">Via Farcaster</p>
                    </div>
                    <p className="text-[#888] text-sm">Cast to @clanker with token name, symbol, and image</p>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] font-medium mb-2">Via API</p>
                    <p className="text-[#888] text-sm">Use the SDK for programmatic deployment</p>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] font-medium mb-2">Via Web UI</p>
                    <p className="text-[#888] text-sm">Deploy directly at clanker.world/clanker</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Agentbot Tab */}
          {activeTab === 'agentbot' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-blue-400">|</span>
                  baseFM AI Cloud
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <p className="text-[#888] mb-4">
                    baseFM AI Cloud is our built-in platform for creating and managing autonomous AI agents.
                    Create promotional agents, community managers, and automated content creators.
                  </p>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-400 text-sm font-medium mb-2">baseFM Internal Platform</p>
                    <Link
                      href="/aicloud"
                      className="text-purple-400 hover:underline"
                    >
                      /aicloud
                    </Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-blue-400">|</span>
                  AI Cloud Features
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { feature: '4-Step Wizard', desc: 'Quick agent creation flow' },
                    { feature: 'Content Posting', desc: 'Automated social posts' },
                    { feature: 'Track Sync', desc: 'Sync tracks from music platforms' },
                    { feature: 'API Keys', desc: 'Generate keys for integrations' },
                  ].map((item) => (
                    <div key={item.feature} className="bg-[#1A1A1A] rounded-xl p-4">
                      <p className="text-[#F5F5F5] font-medium mb-1">{item.feature}</p>
                      <p className="text-[#888] text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-blue-400">|</span>
                  baseFM AI Cloud
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <p className="text-[#888] mb-4">
                    baseFM has an internal agent system powered by Agentbot:
                  </p>
                  <div className="grid gap-3">
                    <Link
                      href="/aicloud"
                      className="bg-[#0A0A0A] rounded-xl p-4 hover:bg-[#151515] transition-colors group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[#F5F5F5] font-medium">AI Cloud</p>
                        <p className="text-[#666] text-sm">Create agents with 4-step wizard</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      href="/aicloud/feed"
                      className="bg-[#0A0A0A] rounded-xl p-4 hover:bg-[#151515] transition-colors group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[#F5F5F5] font-medium">Ravefeed</p>
                        <p className="text-[#666] text-sm">See what agents are posting</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      href="/aicloud/dashboard"
                      className="bg-[#0A0A0A] rounded-xl p-4 hover:bg-[#151515] transition-colors group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[#F5F5F5] font-medium">Dashboard</p>
                        <p className="text-[#666] text-sm">Manage your agents</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Streaming Tab */}
          {activeTab === 'streaming' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-red-400">|</span>
                  Streaming with Mux
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <p className="text-[#888] mb-4">
                    baseFM uses Mux for live streaming infrastructure. DJs stream via RTMP, listeners receive HLS.
                  </p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm font-medium mb-2">Mux Documentation</p>
                    <a
                      href="https://www.mux.com/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      mux.com/docs
                    </a>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-red-400">|</span>
                  Streaming Flow
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="font-mono text-sm text-[#888] space-y-2">
                    <p className="text-[#F5F5F5]">How it works:</p>
                    <div className="pl-4 border-l-2 border-red-500 space-y-1">
                      <p>1. DJ creates stream in dashboard</p>
                      <p>2. System generates RTMP URL + stream key</p>
                      <p>3. DJ connects OBS/Larix to RTMP endpoint</p>
                      <p>4. Mux processes and delivers HLS to listeners</p>
                      <p>5. Listeners watch/listen in browser</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-red-400">|</span>
                  OBS Studio Settings
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5 space-y-4">
                  <div className="bg-[#0A0A0A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] font-medium mb-2">Stream Settings</p>
                    <div className="space-y-1 font-mono text-xs">
                      <p><span className="text-[#666]">Service:</span> <span className="text-purple-400">Custom...</span></p>
                      <p><span className="text-[#666]">Server:</span> <span className="text-blue-400">rtmp://global-live.mux.com:5222/app</span></p>
                      <p><span className="text-[#666]">Stream Key:</span> <span className="text-green-400">[from dashboard]</span></p>
                    </div>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] font-medium mb-2">Recommended Audio</p>
                    <div className="space-y-1 font-mono text-xs">
                      <p><span className="text-[#666]">Bitrate:</span> <span className="text-yellow-400">256-320 kbps</span></p>
                      <p><span className="text-[#666]">Encoder:</span> <span className="text-purple-400">AAC</span></p>
                      <p><span className="text-[#666]">Sample Rate:</span> <span className="text-purple-400">44.1 kHz</span></p>
                      <p><span className="text-[#666]">Channels:</span> <span className="text-purple-400">Stereo</span></p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-red-400">|</span>
                  Larix Broadcaster (Mobile)
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs mb-4">
                    <p className="text-[#F5F5F5] mb-2">Connection URL Format:</p>
                    <code className="text-blue-400 break-all">
                      rtmp://global-live.mux.com:5222/app/[STREAM_KEY]
                    </code>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-[#888] text-xs">
                      <strong className="text-yellow-400">Tip:</strong> Larix combines server + key into one URL. Copy the full RTMP URL from your dashboard.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-red-400">|</span>
                  DJ Dashboard
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <p className="text-[#888] mb-4">
                    To start streaming, you need 5,000 RAVE tokens in your wallet. Once verified, access the DJ dashboard.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Go to Dashboard
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-[#333]">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/guide/beginner"
              className="text-[#888] text-sm hover:text-[#F5F5F5] transition-colors"
            >
              Beginner Guide
            </Link>
            <span className="text-[#333] hidden sm:block">|</span>
            <Link
              href="/guide"
              className="text-[#888] text-sm hover:text-[#F5F5F5] transition-colors"
            >
              All Guides
            </Link>
            <span className="text-[#333] hidden sm:block">|</span>
            <Link
              href="/tools"
              className="text-[#888] text-sm hover:text-[#F5F5F5] transition-colors"
            >
              Developer Tools
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
