'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TradingHeader, TradingFeed, BalanceTracker, RecentTrades } from '@/components/trading';

export default function TradingDashboardPage() {
  const [startedAt] = useState(() => new Date());

  // Demo wallet address - in production this would come from the agent
  const walletAddress = '0x04026dc6f2a1000fcb0d673bff24656233240249';

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#09090b]">
      <TradingHeader startedAt={startedAt} walletAddress={walletAddress} />

      <div className="flex flex-1 min-h-0">
        {/* Left panel - Live Feed */}
        <div className="flex-1 border-r border-[#2A2A2A] flex flex-col min-w-0">
          <TradingFeed />
        </div>

        {/* Right panel - Portfolio + Trades */}
        <div className="w-[320px] shrink-0 flex flex-col overflow-y-auto">
          <div className="py-4">
            <BalanceTracker />
          </div>
          <div className="py-4 border-t border-[#2A2A2A]">
            <RecentTrades />
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between px-5 py-2 border-t border-[#2A2A2A] text-xs text-[#555]">
        <div className="flex items-center gap-4 font-mono">
          <Link href="/aicloud" className="hover:text-white transition-colors">
            aicloud
          </Link>
          <Link href="/aicloud/dashboard" className="hover:text-white transition-colors">
            My Agents
          </Link>
        </div>
        <span className="font-mono">Powered by baseFM</span>
      </footer>
    </div>
  );
}
