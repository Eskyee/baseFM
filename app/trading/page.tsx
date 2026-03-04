'use client';

import { useState } from 'react';
import {
  TradingHeader,
  TradingFeed,
  BalanceTracker,
  RecentTrades,
} from '@/components/trading';

// Agent started at page load
const AGENT_STARTED_AT = new Date();

// TODO: Replace with actual agent wallet from config/env
const AGENT_WALLET = process.env.NEXT_PUBLIC_TRADING_AGENT_WALLET;

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'stats'>('feed');

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col">
      {/* Header */}
      <TradingHeader startedAt={AGENT_STARTED_AT} walletAddress={AGENT_WALLET} />

      {/* Mobile Tab Selector */}
      <div className="md:hidden flex border-b border-[#2A2A2A]">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-3 text-sm font-mono font-medium transition-colors ${
            activeTab === 'feed'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-[#666] hover:text-white'
          }`}
        >
          Live Feed
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 text-sm font-mono font-medium transition-colors ${
            activeTab === 'stats'
              ? 'text-white border-b-2 border-purple-500'
              : 'text-[#666] hover:text-white'
          }`}
        >
          Stats
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Live Feed */}
        <div
          className={`flex-1 flex flex-col border-r border-[#2A2A2A] ${
            activeTab === 'feed' ? 'block' : 'hidden md:flex'
          }`}
        >
          <TradingFeed />
        </div>

        {/* Right Panel - Balance & Trades */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col overflow-y-auto bg-[#111113] ${
            activeTab === 'stats' ? 'block' : 'hidden md:flex'
          }`}
        >
          {/* Balance Section */}
          <div className="py-4 border-b border-[#2A2A2A]">
            <BalanceTracker />
          </div>

          {/* Trades Section */}
          <div className="py-4 flex-1">
            <RecentTrades />
          </div>
        </div>
      </div>
    </div>
  );
}
