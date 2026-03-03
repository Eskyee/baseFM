'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Advanced Guide Page
 *
 * Technical deep-dive for developers, DJs, and power users.
 * Covers: tech stack, smart contracts, API routes, streaming setup,
 * token economics, and development workflow.
 */

export default function AdvancedGuidePage() {
  const [activeTab, setActiveTab] = useState<'stack' | 'contracts' | 'streaming' | 'api' | 'dev'>('stack');

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
            <span className="text-3xl">🤓</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-2">
            Advanced Guide
          </h1>
          <p className="text-[#888]">
            Technical deep-dive for developers and power users
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {[
            { id: 'stack', label: 'Tech Stack', icon: '🏗️' },
            { id: 'contracts', label: 'Smart Contracts', icon: '📜' },
            { id: 'streaming', label: 'Streaming', icon: '📡' },
            { id: 'api', label: 'API Reference', icon: '🔌' },
            { id: 'dev', label: 'Development', icon: '💻' },
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
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">

          {/* Tech Stack Tab */}
          {activeTab === 'stack' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-purple-400">▸</span>
                  Full Stack Overview
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[#666] border-b border-[#333]">
                        <th className="pb-3 pr-4">Layer</th>
                        <th className="pb-3 pr-4">Technology</th>
                        <th className="pb-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#888]">
                      <tr className="border-b border-[#222]">
                        <td className="py-3 pr-4 text-[#F5F5F5]">Framework</td>
                        <td className="py-3 pr-4 font-mono text-purple-400">Next.js 14</td>
                        <td className="py-3">App Router, TypeScript, @/* path alias</td>
                      </tr>
                      <tr className="border-b border-[#222]">
                        <td className="py-3 pr-4 text-[#F5F5F5]">Styling</td>
                        <td className="py-3 pr-4 font-mono text-purple-400">Tailwind CSS</td>
                        <td className="py-3">base-blue: #0052FF, base-dark: #0A0B0D</td>
                      </tr>
                      <tr className="border-b border-[#222]">
                        <td className="py-3 pr-4 text-[#F5F5F5]">Chain</td>
                        <td className="py-3 pr-4 font-mono text-purple-400">Base (8453)</td>
                        <td className="py-3">Coinbase L2, low fees</td>
                      </tr>
                      <tr className="border-b border-[#222]">
                        <td className="py-3 pr-4 text-[#F5F5F5]">Wallet</td>
                        <td className="py-3 pr-4 font-mono text-purple-400">wagmi v2 + OnchainKit</td>
                        <td className="py-3">Coinbase Smart Wallet only</td>
                      </tr>
                      <tr className="border-b border-[#222]">
                        <td className="py-3 pr-4 text-[#F5F5F5]">Streaming</td>
                        <td className="py-3 pr-4 font-mono text-purple-400">Mux</td>
                        <td className="py-3">RTMP in, HLS out, webhooks</td>
                      </tr>
                      <tr className="border-b border-[#222]">
                        <td className="py-3 pr-4 text-[#F5F5F5]">Database</td>
                        <td className="py-3 pr-4 font-mono text-purple-400">Supabase</td>
                        <td className="py-3">Postgres + Realtime + RLS</td>
                      </tr>
                      <tr className="border-b border-[#222]">
                        <td className="py-3 pr-4 text-[#F5F5F5]">Images</td>
                        <td className="py-3 pr-4 font-mono text-purple-400">Cloudinary</td>
                        <td className="py-3">CDN + transforms</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 text-[#F5F5F5]">Hosting</td>
                        <td className="py-3 pr-4 font-mono text-purple-400">Vercel</td>
                        <td className="py-3">Auto-deploy from main</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-purple-400">▸</span>
                  Project Structure
                </h2>
                <div className="bg-[#0A0A0A] rounded-2xl p-5 font-mono text-sm overflow-x-auto">
                  <pre className="text-[#888]">
{`app/                      # Next.js pages (App Router)
├── page.tsx              # Homepage
├── wallet/               # Wallet management
├── community/            # Token-gated community
├── dashboard/            # DJ dashboard
│   ├── create/           # Create stream
│   ├── profile/          # Edit profile
│   └── stream/[id]/      # Stream control
├── stream/[id]/          # Live viewer
├── events/               # Event listings
│   └── [slug]/           # Event detail
├── guide/                # User guides
│   ├── beginner/         # Beginner guide
│   └── advanced/         # This page
└── api/                  # 50+ API routes

components/               # React components
├── Navbar.tsx            # Fixed nav (PWA safe-area)
├── PersistentPlayer.tsx  # Bottom audio player
├── LiveChat.tsx          # Realtime chat
├── TipButton.tsx         # Multi-token tipping
└── providers/
    └── OnchainProvider.tsx

lib/                      # Server utilities
├── db/                   # Supabase CRUD
├── token/                # RAVE config
├── streaming/mux.ts      # Mux API
└── viem/client.ts        # Viem public client

supabase/                 # 13 schema files
public/
└── sw.js                 # Service worker (v4)`}
                  </pre>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-purple-400">▸</span>
                  Database Schema (Supabase)
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: 'streams', desc: 'Live streams + Mux data' },
                    { name: 'djs', desc: 'DJ profiles + slugs' },
                    { name: 'chat_messages', desc: 'Realtime enabled' },
                    { name: 'direct_messages', desc: 'Wallet-to-wallet DMs' },
                    { name: 'members', desc: 'Community members' },
                    { name: 'schedule', desc: 'Weekly time slots' },
                    { name: 'tickets', desc: 'Event ticket tiers' },
                    { name: 'ticket_purchases', desc: 'USDC payment records' },
                    { name: 'crew', desc: '35+ production roles' },
                    { name: 'tips', desc: 'Tip records + tx hash' },
                    { name: 'moderation', desc: 'Bans, timeouts' },
                    { name: 'notifications', desc: 'Push subscriptions' },
                    { name: 'shop_orders', desc: 'Shopify integration' },
                  ].map((table) => (
                    <div key={table.name} className="bg-[#1A1A1A] rounded-xl p-3">
                      <code className="text-purple-400 text-sm">{table.name}</code>
                      <p className="text-[#666] text-xs mt-1">{table.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Smart Contracts Tab */}
          {activeTab === 'contracts' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-green-400">▸</span>
                  RAVE Token (ERC-20)
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Contract</span>
                      <code className="text-purple-400 font-mono text-xs sm:text-sm break-all">
                        0xdf3c79a5759eeedb844e7481309a75037b8e86f5
                      </code>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Chain</span>
                      <span className="text-[#F5F5F5]">Base (8453)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Symbol</span>
                      <span className="text-purple-400 font-mono">RAVE</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Name</span>
                      <span className="text-[#F5F5F5]">RaveCulture</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Decimals</span>
                      <span className="text-[#F5F5F5] font-mono">18</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">DJ Access</span>
                      <span className="text-green-400">5,000 RAVE</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666]">Premium Tier</span>
                      <span className="text-yellow-400">1,000,000,000 RAVE</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#333]">
                    <Link
                      href="https://basescan.org/token/0xdf3c79a5759eeedb844e7481309a75037b8e86f5"
                      target="_blank"
                      className="text-blue-400 text-sm hover:underline flex items-center gap-1"
                    >
                      View on BaseScan
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-green-400">▸</span>
                  USDC (Payments)
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Contract</span>
                      <code className="text-green-400 font-mono text-xs sm:text-sm break-all">
                        0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
                      </code>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Chain</span>
                      <span className="text-[#F5F5F5]">Base (8453)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Decimals</span>
                      <span className="text-[#F5F5F5] font-mono">6</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666]">Usage</span>
                      <span className="text-[#F5F5F5]">Ticket purchases, Tips</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-400 text-xs font-medium mb-1">Important: 6 decimals</p>
                    <p className="text-[#888] text-xs">
                      $25 USDC = <code className="text-yellow-400">25000000</code> (use <code>parseUnits(&apos;25&apos;, 6)</code> from viem)
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-green-400">▸</span>
                  Supported Tip Tokens
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { symbol: 'ETH', name: 'Ethereum', decimals: 18, color: 'text-blue-400' },
                    { symbol: 'USDC', name: 'USD Coin', decimals: 6, color: 'text-green-400' },
                    { symbol: 'RAVE', name: 'RaveCulture', decimals: 18, color: 'text-purple-400' },
                    { symbol: 'cbBTC', name: 'Coinbase BTC', decimals: 8, color: 'text-orange-400' },
                  ].map((token) => (
                    <div key={token.symbol} className="bg-[#1A1A1A] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-mono font-bold ${token.color}`}>{token.symbol}</span>
                        <span className="text-[#666] text-xs">{token.decimals} decimals</span>
                      </div>
                      <p className="text-[#888] text-sm">{token.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-green-400">▸</span>
                  Token Gate Logic
                </h2>
                <div className="bg-[#0A0A0A] rounded-2xl p-5 font-mono text-sm overflow-x-auto">
                  <pre className="text-[#888]">
{`// lib/token/tokenGate.ts
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const RAVE_ADDRESS = '0xdf3c79a5759eeedb844e7481309a75037b8e86f5';
const DJ_THRESHOLD = 5000n * 10n ** 18n;  // 5,000 RAVE
const PREMIUM_THRESHOLD = 1000000000n * 10n ** 18n;  // 1B RAVE

export async function checkTokenGate(
  walletAddress: string,
  threshold: bigint = DJ_THRESHOLD
): Promise<boolean> {
  const client = createPublicClient({
    chain: base,
    transport: http(),
  });

  const balance = await client.readContract({
    address: RAVE_ADDRESS,
    abi: [{ /* balanceOf ABI */ }],
    functionName: 'balanceOf',
    args: [walletAddress],
  });

  return balance >= threshold;
}`}
                  </pre>
                </div>
              </section>
            </>
          )}

          {/* Streaming Tab */}
          {activeTab === 'streaming' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-blue-400">▸</span>
                  Streaming Architecture
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="font-mono text-sm text-[#888] space-y-2">
                    <p className="text-[#F5F5F5]">Flow:</p>
                    <div className="pl-4 border-l-2 border-blue-500 space-y-1">
                      <p>1. DJ creates stream → <code className="text-blue-400">POST /api/streams</code></p>
                      <p>2. Setup Mux → <code className="text-blue-400">POST /api/streams/[id]/setup-mux</code></p>
                      <p>3. Receive RTMP URL + Stream Key</p>
                      <p>4. DJ connects OBS/Larix → Mux RTMP endpoint</p>
                      <p>5. Mux webhook → <code className="text-green-400">stream.active</code></p>
                      <p>6. Listeners receive HLS via Mux playback URL</p>
                      <p>7. DJ stops → <code className="text-red-400">POST /api/streams/[id]/stop</code></p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-blue-400">▸</span>
                  OBS Studio Configuration
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5 space-y-4">
                  <div className="grid gap-3 text-sm">
                    <div className="bg-[#0A0A0A] rounded-xl p-4">
                      <p className="text-[#F5F5F5] font-medium mb-2">Stream Settings</p>
                      <div className="space-y-1 font-mono text-xs">
                        <p><span className="text-[#666]">Service:</span> <span className="text-purple-400">Custom...</span></p>
                        <p><span className="text-[#666]">Server:</span> <span className="text-blue-400">rtmp://global-live.mux.com:5222/app</span></p>
                        <p><span className="text-[#666]">Stream Key:</span> <span className="text-green-400">[from dashboard]</span></p>
                      </div>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-xl p-4">
                      <p className="text-[#F5F5F5] font-medium mb-2">Output Settings</p>
                      <div className="space-y-1 font-mono text-xs">
                        <p><span className="text-[#666]">Audio Bitrate:</span> <span className="text-yellow-400">256-320 kbps</span></p>
                        <p><span className="text-[#666]">Audio Encoder:</span> <span className="text-purple-400">AAC</span></p>
                        <p><span className="text-[#666]">Sample Rate:</span> <span className="text-purple-400">44.1 kHz</span></p>
                        <p><span className="text-[#666]">Channels:</span> <span className="text-purple-400">Stereo</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-blue-400">▸</span>
                  Larix Broadcaster (Mobile)
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs">
                    <p className="text-[#F5F5F5] mb-2">Connection URL Format:</p>
                    <code className="text-blue-400 break-all">
                      rtmp://global-live.mux.com:5222/app/[STREAM_KEY]
                    </code>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-[#888] text-xs">
                      <strong className="text-yellow-400">Tip:</strong> Larix combines server + key into one URL. Copy the full RTMP URL from dashboard.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-blue-400">▸</span>
                  Mux Webhook Events
                </h2>
                <div className="bg-[#0A0A0A] rounded-2xl p-5 font-mono text-sm overflow-x-auto">
                  <pre className="text-[#888]">
{`// /api/webhooks/mux
// Handles Mux streaming events

POST /api/webhooks/mux
Content-Type: application/json
Mux-Signature: [webhook_secret]

{
  "type": "video.live_stream.active",
  "data": {
    "id": "stream_id",
    "status": "active",
    "playback_ids": [{ "id": "playback_id" }]
  }
}

// Events we handle:
// - video.live_stream.active   → Stream started
// - video.live_stream.idle     → Stream ended
// - video.asset.ready          → Recording available`}
                  </pre>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-blue-400">▸</span>
                  Recommended Audio Settings
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { setting: 'Audio Bitrate', value: '256-320 kbps', note: 'Higher = better quality' },
                    { setting: 'Sample Rate', value: '44.1 kHz', note: 'Standard CD quality' },
                    { setting: 'Channels', value: 'Stereo', note: '2 channels' },
                    { setting: 'Codec', value: 'AAC', note: 'Most compatible' },
                  ].map((item) => (
                    <div key={item.setting} className="bg-[#1A1A1A] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#F5F5F5] font-medium">{item.setting}</span>
                        <code className="text-green-400 font-mono text-sm">{item.value}</code>
                      </div>
                      <p className="text-[#666] text-xs">{item.note}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* API Reference Tab */}
          {activeTab === 'api' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-orange-400">▸</span>
                  Core API Routes
                </h2>
                <div className="space-y-3">
                  {[
                    { method: 'GET', path: '/api/streams', desc: 'List all streams' },
                    { method: 'POST', path: '/api/streams', desc: 'Create new stream' },
                    { method: 'GET', path: '/api/streams/live', desc: 'Get all live streams' },
                    { method: 'POST', path: '/api/streams/[id]/setup-mux', desc: 'Generate RTMP credentials' },
                    { method: 'POST', path: '/api/streams/[id]/start', desc: 'Mark stream as started' },
                    { method: 'POST', path: '/api/streams/[id]/stop', desc: 'End stream' },
                  ].map((route) => (
                    <div key={route.path} className="bg-[#1A1A1A] rounded-xl p-3 flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        route.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                        route.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {route.method}
                      </span>
                      <code className="text-[#888] font-mono text-sm flex-1">{route.path}</code>
                      <span className="text-[#666] text-xs hidden sm:block">{route.desc}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-orange-400">▸</span>
                  Community & Social
                </h2>
                <div className="space-y-3">
                  {[
                    { method: 'GET', path: '/api/community', desc: 'List community members' },
                    { method: 'POST', path: '/api/community', desc: 'Join community' },
                    { method: 'GET', path: '/api/chat', desc: 'Get chat messages' },
                    { method: 'POST', path: '/api/chat', desc: 'Send message (10/min limit)' },
                    { method: 'GET', path: '/api/connections', desc: 'Get follows' },
                    { method: 'POST', path: '/api/connections', desc: 'Follow/unfollow' },
                  ].map((route) => (
                    <div key={route.path} className="bg-[#1A1A1A] rounded-xl p-3 flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        route.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {route.method}
                      </span>
                      <code className="text-[#888] font-mono text-sm flex-1">{route.path}</code>
                      <span className="text-[#666] text-xs hidden sm:block">{route.desc}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-orange-400">▸</span>
                  Events & Tickets
                </h2>
                <div className="space-y-3">
                  {[
                    { method: 'GET', path: '/api/events', desc: 'List events' },
                    { method: 'POST', path: '/api/events', desc: 'Submit event' },
                    { method: 'GET', path: '/api/tickets?eventId=xxx', desc: 'Get ticket tiers' },
                    { method: 'POST', path: '/api/tickets', desc: 'Create ticket tier' },
                    { method: 'POST', path: '/api/tickets/purchase', desc: 'Record USDC purchase' },
                    { method: 'GET', path: '/api/tickets/purchase?wallet=xxx&eventId=xxx', desc: 'Check ownership' },
                  ].map((route) => (
                    <div key={route.path} className="bg-[#1A1A1A] rounded-xl p-3 flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        route.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {route.method}
                      </span>
                      <code className="text-[#888] font-mono text-sm flex-1">{route.path}</code>
                      <span className="text-[#666] text-xs hidden sm:block">{route.desc}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-orange-400">▸</span>
                  Ticket Purchase Flow
                </h2>
                <div className="bg-[#0A0A0A] rounded-2xl p-5 font-mono text-sm overflow-x-auto">
                  <pre className="text-[#888]">
{`// 1. User selects ticket tier
const tier = await fetch('/api/tickets?eventId=xxx').then(r => r.json());

// 2. Execute USDC transfer (wagmi)
const { writeContract } = useWriteContract();
await writeContract({
  address: USDC_ADDRESS,
  abi: erc20Abi,
  functionName: 'transfer',
  args: [promoterWallet, parseUnits(price, 6)], // USDC has 6 decimals
});

// 3. Record purchase after tx confirmation
await fetch('/api/tickets/purchase', {
  method: 'POST',
  body: JSON.stringify({
    eventId,
    tierId,
    wallet: userAddress,
    txHash: receipt.transactionHash,
    quantity: 1,
  }),
});

// Payment goes directly to promoter wallet - no middleman`}
                  </pre>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-orange-400">▸</span>
                  Webhooks
                </h2>
                <div className="space-y-3">
                  {[
                    { method: 'POST', path: '/api/webhooks/mux', desc: 'Mux stream events' },
                    { method: 'POST', path: '/api/webhooks/shopify', desc: 'Shopify orders → perks' },
                    { method: 'POST', path: '/api/webhooks/farcaster', desc: 'Farcaster frames' },
                  ].map((route) => (
                    <div key={route.path} className="bg-[#1A1A1A] rounded-xl p-3 flex items-center gap-3">
                      <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-400">
                        {route.method}
                      </span>
                      <code className="text-[#888] font-mono text-sm flex-1">{route.path}</code>
                      <span className="text-[#666] text-xs hidden sm:block">{route.desc}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Development Tab */}
          {activeTab === 'dev' && (
            <>
              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-cyan-400">▸</span>
                  Environment Variables
                </h2>
                <div className="bg-[#0A0A0A] rounded-2xl p-5 font-mono text-sm overflow-x-auto">
                  <pre className="text-[#888]">
{`# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mux Streaming (required)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=

# Base Network
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# OnchainKit (optional)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=

# Push Notifications (optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://basefm.space
ADMIN_WALLET_ADDRESS=  # Comma-separated`}
                  </pre>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-cyan-400">▸</span>
                  Development Commands
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { cmd: 'npm run dev', desc: 'Local dev server (port 3000)' },
                    { cmd: 'npm run build', desc: 'Production build' },
                    { cmd: 'npm run lint', desc: 'ESLint check' },
                    { cmd: 'npm run test:run', desc: 'Run tests once (Vitest)' },
                    { cmd: 'npm run test', desc: 'Watch mode tests' },
                  ].map((item) => (
                    <div key={item.cmd} className="bg-[#1A1A1A] rounded-xl p-4">
                      <code className="text-green-400 font-mono text-sm">{item.cmd}</code>
                      <p className="text-[#666] text-xs mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-cyan-400">▸</span>
                  Git Workflow
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="font-mono text-sm text-[#888] space-y-2">
                    <div className="pl-4 border-l-2 border-cyan-500 space-y-1">
                      <p>1. Work on feature branch: <code className="text-cyan-400">claude/feature-name</code></p>
                      <p>2. Push triggers auto-PR workflow</p>
                      <p>3. CI runs: Lint → Tests → Build</p>
                      <p>4. Vercel auto-deploys preview URL</p>
                      <p>5. Owner reviews on iPhone</p>
                      <p>6. Squash-merge to <code className="text-green-400">main</code></p>
                      <p>7. Vercel deploys to production</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-xs">
                      <strong>Never</strong> push directly to main. Delete AI branches after PR merge.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-cyan-400">▸</span>
                  Testing Infrastructure
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Framework</span>
                      <span className="text-[#F5F5F5]">Vitest + jsdom</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Coverage</span>
                      <span className="text-[#F5F5F5]">V8 provider</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Test Count</span>
                      <span className="text-green-400">55+ unit tests</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666]">Setup</span>
                      <code className="text-purple-400 font-mono">vitest.setup.tsx</code>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-cyan-400">▸</span>
                  PWA / Service Worker
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-5 space-y-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">Cache Version</span>
                      <code className="text-purple-400 font-mono">v4</code>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#222]">
                      <span className="text-[#666]">File</span>
                      <code className="text-[#888] font-mono">public/sw.js</code>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#666]">Update Hook</span>
                      <code className="text-[#888] font-mono">useServiceWorker()</code>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-400 text-xs">
                      <strong>Bump CACHE_VERSION</strong> after big UI changes to force cache refresh
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="text-cyan-400">▸</span>
                  Key Patterns
                </h2>
                <div className="space-y-3">
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] font-medium mb-2">Navbar must be fixed (not sticky)</p>
                    <p className="text-[#888] text-sm">Sticky positioning breaks iOS PWA. Use <code className="text-purple-400">fixed</code> + spacer div.</p>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] font-medium mb-2">Safe area handling</p>
                    <p className="text-[#888] text-sm">Use <code className="text-purple-400">env(safe-area-inset-top)</code> for notch/dynamic island.</p>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] font-medium mb-2">Wallet display on mobile</p>
                    <p className="text-[#888] text-sm">Show avatar only, no address text (prevents overflow).</p>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-xl p-4">
                    <p className="text-[#F5F5F5] font-medium mb-2">Supabase Realtime tables</p>
                    <p className="text-[#888] text-sm">Enabled on: <code className="text-green-400">chat_messages</code>, <code className="text-green-400">streams</code>, <code className="text-green-400">direct_messages</code></p>
                  </div>
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
              ← Beginner Guide
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
              href="https://github.com/Eskyee/baseFM"
              target="_blank"
              className="text-[#888] text-sm hover:text-[#F5F5F5] transition-colors flex items-center gap-1"
            >
              GitHub
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
