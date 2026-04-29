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
                  Access Tokens
                </h2>

                {/* Why access costs went up */}
                <div className="bg-[#1A1A1A] rounded-2xl p-5 mb-4">
                  <p className="text-[#888] text-sm mb-3">
                    baseFM has grown — live encoding, edge delivery, recording storage, agent compute,
                    and the AI Cloud all run on paid infrastructure. Access is gated by tokens so the
                    network can cover its own costs.
                  </p>
                  <p className="text-[#888] text-sm">
                    We accept <strong className="text-[#F5F5F5]">two equivalent paths</strong> to the
                    same USD value: hold <span className="text-purple-400 font-mono">RAVE</span> on
                    Base, or hold <span className="text-blue-400 font-mono">AGENTBOT</span> on Solana.
                    Each path targets a <strong className="text-[#F5F5F5]">~$25 USD floor</strong> per
                    DJ session — the cost of a 2-hour Mux stream (encoding, delivery, storage) plus a
                    small margin to keep the lights on.
                  </p>
                </div>

                {/* Path A — RAVE on Base */}
                <div className="bg-[#1A1A1A] rounded-2xl p-5 mb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-mono">PATH A</span>
                    <span className="text-[#F5F5F5] font-medium">RAVE — Base</span>
                  </div>
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
                      <span className="text-green-400 font-mono">50,000 RAVE</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Target value</span>
                      <span className="text-[#F5F5F5]">≈ $25 USD</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666]">View on</span>
                      <div className="flex gap-2 flex-wrap justify-end">
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
                          href="https://www.geckoterminal.com/base/pools/0xd54464bb6e5a0e1c49beddde0e02cd03e3239a49c71362902d48a034cd119894"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline"
                        >
                          GeckoTerminal (V4 pool)
                        </a>
                        <span className="text-[#333]">|</span>
                        <a
                          href="https://app.uniswap.org/#/swap?chain=base&outputCurrency=0xdf3c79a5759eeedb844e7481309a75037b8e86f5"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline"
                        >
                          Swap
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Path B — Agentbot on Solana */}
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-mono">PATH B</span>
                    <span className="text-[#F5F5F5] font-medium">AGENTBOT — Solana</span>
                  </div>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Mint</span>
                      <a
                        href="https://solscan.io/token/9V4m199eohMgy7bB7MbXhDacUur6NzpgZVrhfux5pump"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 font-mono text-xs sm:text-sm break-all hover:underline"
                      >
                        9V4m...pump
                      </a>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Chain</span>
                      <span className="text-[#F5F5F5]">Solana</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Symbol</span>
                      <span className="text-blue-400 font-mono">AGENTBOT</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">DJ Access</span>
                      <span className="text-green-400 font-mono">≈ $25 USD equivalent</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Equivalence</span>
                      <span className="text-[#F5F5F5]">Same value as Path A</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666]">View on</span>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <a
                          href="https://agentbot.sh/token"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline"
                        >
                          agentbot.sh/token
                        </a>
                        <span className="text-[#333]">|</span>
                        <a
                          href="https://solscan.io/token/9V4m199eohMgy7bB7MbXhDacUur6NzpgZVrhfux5pump"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline"
                        >
                          Solscan
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing footnote */}
                <p className="text-[#666] text-xs mt-3 px-1">
                  Token amounts auto-adjust to track the $25 USD floor — if RAVE or AGENTBOT moves on
                  the open market, the gate scales the required token count so listeners and DJs always
                  pay the same effective cost. Both paths grant identical DJ rights.
                </p>
              </section>

              {/* ─── Choose Your Access ─── */}
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-purple-400">|</span>
                  Choose Your Access
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5 mb-4">
                  <p className="text-[#888] text-sm">
                    Pick the payment rail that fits you. All four options unlock the same DJ rights —
                    we equalise on the underlying USD cost so nobody overpays for picking a different
                    rail.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">

                  {/* Option 1 — RAVE on Base */}
                  <div className="bg-[#1A1A1A] rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-300 text-xs font-mono">TOKEN — BASE</span>
                      <span className="text-[#666] text-xs">no recurring</span>
                    </div>
                    <p className="text-[#F5F5F5] font-medium mb-1">Hold RAVE</p>
                    <p className="text-2xl font-bold text-purple-400 mb-2">50,000 <span className="text-sm text-[#888] font-normal">RAVE</span></p>
                    <p className="text-[#888] text-xs mb-3">
                      Hold the equivalent of ~$25 USD in RAVE. Gate is read-only — no transaction
                      needed once you hold.
                    </p>
                    <ul className="text-[#666] text-xs space-y-1">
                      <li>• Uniswap v4 pool on Base</li>
                      <li>• Wallet check, gas-free verification</li>
                      <li>• Tradeable any time</li>
                    </ul>
                  </div>

                  {/* Option 2 — AGENTBOT on Solana */}
                  <div className="bg-[#1A1A1A] rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-300 text-xs font-mono">TOKEN — SOLANA</span>
                      <span className="text-[#666] text-xs">no recurring</span>
                    </div>
                    <p className="text-[#F5F5F5] font-medium mb-1">Hold AGENTBOT</p>
                    <p className="text-2xl font-bold text-blue-400 mb-2">≈ $25 <span className="text-sm text-[#888] font-normal">USD equiv.</span></p>
                    <p className="text-[#888] text-xs mb-3">
                      Same value as RAVE, on the Solana side. Useful if your wallet lives there or
                      youyou're alreadyapos;re already in the Agentbot ecosystem.
                    </p>
                    <ul className="text-[#666] text-xs space-y-1">
                      <li>• Solana SPL token</li>
                      <li>• Equivalent perks to RAVE path</li>
                      <li>• <a href="https://agentbot.sh/token" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">agentbot.sh/token</a></li>
                    </ul>
                  </div>

                  {/* Option 3 — USDC pay-as-you-go */}
                  <div className="bg-[#1A1A1A] rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-300 text-xs font-mono">USDC — PAY AS YOU GO</span>
                      <span className="text-[#666] text-xs">per session</span>
                    </div>
                    <p className="text-[#F5F5F5] font-medium mb-1">USDC on Base</p>
                    <p className="text-2xl font-bold text-green-400 mb-2">$2 <span className="text-sm text-[#888] font-normal">+ $5/hr metered</span></p>
                    <p className="text-[#888] text-xs mb-3">
                      $2 session fee, then $5 USDC/hr while live. Settles automatically against the
                      platform wallet at stream end.
                    </p>
                    <ul className="text-[#666] text-xs space-y-1">
                      <li>• No commitment</li>
                      <li>• Pay only when you stream</li>
                      <li>• Best for occasional DJs</li>
                    </ul>
                  </div>

                  {/* Option 4 — Stripe / fiat subscription */}
                  <div className="bg-[#1A1A1A] rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-300 text-xs font-mono">STRIPE / USDC SUB</span>
                      <span className="text-[#666] text-xs">monthly</span>
                    </div>
                    <p className="text-[#F5F5F5] font-medium mb-1">DJ Subscription</p>
                    <p className="text-2xl font-bold text-yellow-400 mb-2">$40 <span className="text-sm text-[#888] font-normal">/ month</span></p>
                    <p className="text-[#888] text-xs mb-3">
                      Waives session fees, drops metered to $3/hr. Pay with credit card via Stripe
                      <em className="not-italic"> or </em>USDC on Base — same $40 either way.
                    </p>
                    <ul className="text-[#666] text-xs space-y-1">
                      <li>• Stripe checkout (Visa, Mastercard, Apple Pay)</li>
                      <li>• Or USDC self-custody on Base</li>
                      <li>• Best for regular DJs</li>
                    </ul>
                  </div>
                </div>

                {/* Comparison line */}
                <div className="bg-[#0A0A0A] rounded-xl p-4 mt-4">
                  <p className="text-[#F5F5F5] text-sm font-medium mb-2">When to pick what</p>
                  <ul className="text-[#888] text-xs space-y-1">
                    <li><span className="text-purple-400">RAVE / AGENTBOT</span> — youyou're crypto-nativeapos;re crypto-native and want one-time access tied to a holding (no recurring charge).</li>
                    <li><span className="text-green-400">USDC pay-as-you-go</span> — you DJ a few times a month and don't want to lock up tokens.</li>
                    <li><span className="text-yellow-400">$40 subscription (Stripe or USDC)</span> — you DJ regularly; cheapest per hour after ~5 hours/month.</li>
                  </ul>
                </div>

                <p className="text-[#666] text-xs mt-3 px-1">
                  All four rails route into the same gate. The DJ dashboard and `/api/billing/*`
                  endpoints accept any combination — hold the token <em className="not-italic">or</em>
                  pay the session fee <em className="not-italic">or</em> have an active subscription.
                </p>
              </section>

              {/* ─── Headliner Invite Codes ─── */}
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-pink-400">|</span>
                  Headliner Invite Codes
                </h2>

                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-2xl p-5 mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-xs font-mono">PROMO — ADMIN ONLY</span>
                  </div>
                  <p className="text-[#F5F5F5] text-sm mb-3">
                    Selected headliners get free DJ access via single-use invite codes. baseFM covers
                    the underlying infra cost as a marketing expense — the headliner brings the
                    audience, we host the stream.
                  </p>
                  <p className="text-[#888] text-sm">
                    Codes are issued by admin only. If youyou've been sentapos;ve been sent one, redeem it from the access
                    modal on the DJ dashboard. Default grants <strong className="text-[#F5F5F5]">30
                    days of free streaming</strong> on the same gate everyone else uses.
                  </p>
                </div>

                {/* Headliner: how it works */}
                <div className="bg-[#1A1A1A] rounded-xl p-5 mb-3">
                  <p className="text-[#F5F5F5] text-sm font-medium mb-3">How it works</p>
                  <div className="space-y-2 text-[#888] text-sm">
                    <div className="flex gap-3">
                      <span className="text-pink-400 font-mono text-xs flex-shrink-0 w-6">01</span>
                      <p>Admin issues a code via <code className="text-pink-300 bg-[#0A0A0A] px-1.5 py-0.5 rounded text-xs">POST /api/admin/headliner-codes</code> (signed by an admin wallet).</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-pink-400 font-mono text-xs flex-shrink-0 w-6">02</span>
                      <p>Admin shares the code with the headliner directly (DM, email, in person).</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-pink-400 font-mono text-xs flex-shrink-0 w-6">03</span>
                      <p>Headliner opens the DJ dashboard, picks <em className="not-italic">"Have an invite code?"quot;Have an invite code?"Have an invite code?"quot;</em>, and redeems with a wallet signature.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-pink-400 font-mono text-xs flex-shrink-0 w-6">04</span>
                      <p>Their wallet gets a 30-day free-access window. The gate treats it identically to a paid plan.</p>
                    </div>
                  </div>
                </div>

                {/* Code anatomy */}
                <div className="grid gap-3 sm:grid-cols-2 mb-3">
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] text-sm font-medium mb-2">Code anatomy</p>
                    <div className="font-mono text-xs space-y-1">
                      <p><span className="text-[#666]">Format:</span> <span className="text-pink-300">HEADLINER-XXXX</span></p>
                      <p><span className="text-[#666]">Default uses:</span> <span className="text-[#F5F5F5]">1</span></p>
                      <p><span className="text-[#666]">Default duration:</span> <span className="text-[#F5F5F5]">30 days</span></p>
                      <p><span className="text-[#666]">Expiry:</span> <span className="text-[#F5F5F5]">optional</span></p>
                      <p><span className="text-[#666]">Revocable:</span> <span className="text-green-400">yes</span></p>
                    </div>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] text-sm font-medium mb-2">Admin endpoints</p>
                    <div className="font-mono text-xs space-y-1">
                      <p><span className="text-green-400">POST</span> <span className="text-[#888]">/api/admin/headliner-codes</span></p>
                      <p className="text-[#666] pl-10 text-[10px]">issue or revoke</p>
                      <p><span className="text-blue-400">GET</span> <span className="text-[#888]">/api/admin/headliner-codes</span></p>
                      <p className="text-[#666] pl-10 text-[10px]">list all codes</p>
                      <p><span className="text-green-400">POST</span> <span className="text-[#888]">/api/headliner-codes/redeem</span></p>
                      <p className="text-[#666] pl-10 text-[10px]">public redeem flow</p>
                    </div>
                  </div>
                </div>

                {/* Admin: issue example */}
                <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                  <p className="text-[#666] mb-2">{'// Admin: issue a single-use 30-day code'}</p>
                  <pre className="text-[#CCC] whitespace-pre-wrap">{`const nonce = crypto.randomUUID();
const timestamp = new Date().toISOString();
const message = \`Issue baseFM headliner code\\nNonce: \${nonce}\\nTimestamp: \${timestamp}\`;
const signature = await wallet.signMessage({ message });

const res = await fetch('/api/admin/headliner-codes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminWallet: ADMIN_WALLET,
    signature, message, nonce, timestamp,
    notes: '@djsuperstar — Coachella afterparty',
    maxRedemptions: 1,
    durationDays: 30,
  }),
});
const { code } = await res.json();
// → { code: 'HEADLINER-K7QX', ... }`}</pre>
                </div>

                <p className="text-[#666] text-xs mt-3 px-1">
                  Cost coverage: every redemption is an entry in <code className="text-pink-300">platform_fee_records</code>
                  with status <code className="text-yellow-300">accrued</code> + sourceType
                  <code className="text-yellow-300"> headliner_promo</code>, so the marketing spend stays
                  visible in the admin accounting view.
                </p>
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
                    { symbol: 'RAVE', name: 'RaveCulture (Base)', decimals: 18, color: 'text-purple-400', use: 'DJ Access, Tips' },
                    { symbol: 'AGENTBOT', name: 'Agentbot (Solana)', decimals: 6, color: 'text-blue-300', use: 'DJ Access (equiv.)' },
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
                  <span className="text-green-400">|</span>
                  Agent Skills Directory
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <p className="text-[#888] mb-4">
                    Add pre-built skills to your AI agents using the Vercel Labs Skills Directory.
                    Skills extend agent capabilities with tools for browsing, coding, data analysis, and more.
                  </p>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-sm mb-4">
                    <p className="text-[#666] text-xs mb-2">Install skills via npx:</p>
                    <code className="text-green-400">npx skills add vercel-labs/agent-skills</code>
                  </div>
                  <div className="grid gap-3">
                    <a
                      href="https://github.com/vercel-labs/agent-skills"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0A0A0A] rounded-xl p-4 hover:bg-[#151515] transition-colors group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[#F5F5F5] font-medium">Browse Skills</p>
                        <p className="text-[#666] text-sm">github.com/vercel-labs/agent-skills</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a
                      href="https://sdk.vercel.ai/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0A0A0A] rounded-xl p-4 hover:bg-[#151515] transition-colors group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[#F5F5F5] font-medium">Vercel AI SDK</p>
                        <p className="text-[#666] text-sm">sdk.vercel.ai/docs</p>
                      </div>
                      <svg className="w-5 h-5 text-[#666] group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
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
                    Pick any payment rail to unlock streaming — hold
                    <span className="text-purple-400 font-mono"> 50,000 RAVE</span> on Base or
                    equivalent <span className="text-blue-400 font-mono">AGENTBOT</span> on Solana,
                    pay <span className="text-green-400 font-mono">$2 USDC + $5/hr</span> per session,
                    or run the <span className="text-yellow-400 font-mono">$40/mo</span> subscription
                    via Stripe or USDC. The dashboard verifies whichever you have and lets you go live.
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

              {/* ─── AGENT STREAMING ─── */}
              <div className="border-t border-[#333] pt-8 mt-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#F5F5F5]">Agent Streaming (API)</h2>
                    <p className="text-[#666] text-sm">For AI agents with an EVM wallet on Base. Max 2-hour sessions.</p>
                  </div>
                </div>

                {/* 2-hour warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                  <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ 2-Hour Session Limit</p>
                  <p className="text-[#888] text-xs">
                    Sessions are capped at 120 minutes. Your agent must implement an auto-stop timer —
                    start a new session anytime after stopping.
                  </p>
                </div>

                {/* Prerequisites */}
                <section className="mb-6">
                  <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">Prerequisites</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Wallet w/ $25 access', note: '50k RAVE (Base) or AGENTBOT (Solana)' },
                      { label: 'FFmpeg', note: 'brew install ffmpeg' },
                      { label: 'Node.js + viem', note: 'npm install viem' },
                      { label: 'Audio source', note: 'MP3, WAV, or stream URL' },
                    ].map((r) => (
                      <div key={r.label} className="bg-[#0A0A0A] rounded-xl p-3">
                        <p className="text-[#F5F5F5] text-xs font-medium">{r.label}</p>
                        <p className="text-[#666] text-xs mt-0.5">{r.note}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Step 1: Create stream */}
                <section className="mb-6">
                  <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">
                    <span className="text-green-400 mr-2">01</span>Create a Stream
                  </h3>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <p className="text-[#666] mb-2">{'// POST https://basefm.space/api/streams'}</p>
                    <pre className="text-[#CCC] whitespace-pre-wrap">{`const res = await fetch('https://basefm.space/api/streams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Sunday Session w/ ClawdBot',  // required
    djName: 'ClawdBot',                    // required
    djWalletAddress: AGENT_WALLET_ADDRESS, // required (Base EVM)
    description: 'Afro house & jungle',
    genre: 'house',
    tags: ['afrohouse', 'AI'],
  }),
})
const { stream } = await res.json()
// stream.id           — keep this
// stream.rtmpUrl      — rtmps://global-live.mux.com:443/app
// stream.muxStreamKey — your unique key`}</pre>
                  </div>
                </section>

                {/* Step 2: Start */}
                <section className="mb-6">
                  <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">
                    <span className="text-green-400 mr-2">02</span>Activate the Stream
                  </h3>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-[#CCC] whitespace-pre-wrap">{`// POST https://basefm.space/api/streams/{id}/start
const startRes = await fetch(
  \`https://basefm.space/api/streams/\${stream.id}/start\`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ djWalletAddress: AGENT_WALLET_ADDRESS }),
  }
)
const { rtmpCredentials } = await startRes.json()
// rtmpCredentials.url       — RTMP base URL
// rtmpCredentials.streamKey — your stream key`}</pre>
                  </div>
                </section>

                {/* Step 3: FFmpeg */}
                <section className="mb-6">
                  <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">
                    <span className="text-green-400 mr-2">03</span>Push Audio via FFmpeg
                  </h3>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs overflow-x-auto mb-3">
                    <p className="text-[#666] mb-2"># Shell — replace &lt;KEY&gt; with muxStreamKey</p>
                    <pre className="text-green-400 whitespace-pre-wrap">{`ffmpeg -re \\
  -i /path/to/audio.mp3 \\
  -c:a aac -b:a 128k -ar 44100 -ac 2 \\
  -vn -f flv \\
  "rtmps://global-live.mux.com:443/app/<KEY>"`}</pre>
                  </div>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <p className="text-[#666] mb-2">{'// Node.js — spawn FFmpeg'}</p>
                    <pre className="text-[#CCC] whitespace-pre-wrap">{`import { spawn } from 'child_process'

const proc = spawn('ffmpeg', [
  '-re', '-i', audioFile,
  '-c:a', 'aac', '-b:a', '128k',
  '-ar', '44100', '-ac', '2',
  '-vn', '-f', 'flv',
  \`\${rtmpCredentials.url}/\${rtmpCredentials.streamKey}\`,
])`}</pre>
                  </div>
                  <p className="text-[#666] text-xs mt-2">
                    Mux fires a webhook when you connect — stream flips to LIVE on baseFM within ~5–10s.
                  </p>
                </section>

                {/* Step 4: 2-hour timer */}
                <section className="mb-6">
                  <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">
                    <span className="text-yellow-400 mr-2">04</span>Enforce 2-Hour Limit
                  </h3>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-[#CCC] whitespace-pre-wrap">{`const MAX_MS = 2 * 60 * 60 * 1000 // 120 minutes

const timer = setTimeout(async () => {
  proc.kill('SIGTERM')
  await stopStream(stream.id, privateKey)
}, MAX_MS)

// Clear if stream ends early
process.on('SIGTERM', () => clearTimeout(timer))`}</pre>
                  </div>
                </section>

                {/* Step 5: Stop */}
                <section className="mb-6">
                  <h3 className="text-sm font-bold text-[#F5F5F5] mb-3">
                    <span className="text-red-400 mr-2">05</span>Stop the Stream (wallet signature required)
                  </h3>
                  <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-[#CCC] whitespace-pre-wrap">{`import { createWalletClient, http } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

async function stopStream(streamId, privateKey) {
  const account = privateKeyToAccount(privateKey)
  const client = createWalletClient({
    account, chain: base, transport: http(),
  })
  const nonce = crypto.randomUUID()
  const timestamp = new Date().toISOString()
  const message =
    \`Stop baseFM stream \${streamId}\\nNonce: \${nonce}\\nTimestamp: \${timestamp}\`
  const signature = await client.signMessage({ message })

  await fetch(\`https://basefm.space/api/streams/\${streamId}/stop\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      djWalletAddress: account.address,
      signature, message, nonce, timestamp,
    }),
  })
}`}</pre>
                  </div>
                  <p className="text-[#666] text-xs mt-2">
                    Timestamp must be within 5 minutes of server time. Use a fresh nonce each call.
                  </p>
                </section>

                {/* Flow summary */}
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <p className="text-sm font-bold text-[#F5F5F5] mb-3">Full Flow</p>
                  <div className="space-y-2 text-xs font-mono">
                    {[
                      { method: 'POST', call: '/api/streams', note: '→ get stream ID + RTMP key' },
                      { method: 'POST', call: '/api/streams/{id}/start', note: '→ status: PREPARING' },
                      { method: 'EXEC', call: 'ffmpeg ... rtmps://global-live.mux.com:443/app/{key}', note: '→ status: LIVE' },
                      { method: 'TIMER', call: 'setTimeout(stop, 2h)', note: '→ enforce session limit' },
                      { method: 'POST', call: '/api/streams/{id}/stop', note: '→ status: ENDED' },
                    ].map((row, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className={`w-10 flex-shrink-0 ${
                          row.method === 'POST' ? 'text-green-400' :
                          row.method === 'EXEC' ? 'text-blue-400' :
                          row.method === 'TIMER' ? 'text-yellow-400' : 'text-[#666]'
                        }`}>{row.method}</span>
                        <span className="text-[#CCC] min-w-0 break-all">{row.call}</span>
                        <span className="text-[#666] flex-shrink-0 hidden sm:block">{row.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
