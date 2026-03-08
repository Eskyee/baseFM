'use client';

import { useEffect, useState } from 'react';
import type { TradingBalance } from '@/types/trading';

const POLL_INTERVAL = 5000;

interface ExtendedBalance extends TradingBalance {
  amounts?: Record<string, string>;
}

interface BalanceTrackerProps {
  walletAddress?: string;
}

export function BalanceTracker({ walletAddress }: BalanceTrackerProps = {}) {
  const [balance, setBalance] = useState<ExtendedBalance | null>(null);
  const [flash, setFlash] = useState(false);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'configured' | 'unconfigured'>('loading');

  useEffect(() => {
    async function poll() {
      try {
        const url = walletAddress
          ? `/api/trading/balances?wallet=${walletAddress}`
          : '/api/trading/balances';
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.id) {
          setBalance(data);
          setStatus(data.id === 'unconfigured' ? 'unconfigured' : 'configured');
          // Flash effect when balance changes
          if (prevId && data.id !== prevId && data.id !== 'unconfigured') {
            setFlash(true);
            setTimeout(() => setFlash(false), 1500);
          }
          setPrevId(data.id);
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [prevId, walletAddress]);

  // Show ALL assets sorted by value descending (no filtering)
  const sortedBreakdown = balance?.breakdown
    ? Object.entries(balance.breakdown)
        .filter(([, value]) => value > 0)
        .sort(([, a], [, b]) => b - a)
    : [];

  // Format large token amounts nicely
  const formatAmount = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    if (num < 0.0001) {
      return num.toExponential(2);
    }
    return num.toFixed(4);
  };

  return (
    <div className="flex flex-col gap-3 px-4">
      <h2 className="text-xs font-bold tracking-widest uppercase text-[#888] font-mono">
        Portfolio
      </h2>

      <div className={`transition-colors duration-300 ${flash ? 'animate-balance-flash' : ''}`}>
        <p className="text-3xl font-bold text-white font-mono tabular-nums">
          {balance ? `$${balance.totalUsd.toFixed(2)}` : '\u2014'}
        </p>
        {status === 'loading' && (
          <p className="text-xs text-[#555] font-mono mt-1">Loading...</p>
        )}
        {status === 'unconfigured' && (
          <p className="text-xs text-yellow-500 font-mono mt-1">API not configured</p>
        )}
      </div>

      {sortedBreakdown.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#2A2A2A]">
          <h3 className="text-xs text-[#666] font-mono">Assets</h3>
          {sortedBreakdown.map(([token, value]) => {
            const amount = balance?.amounts?.[token];
            return (
              <div key={token} className="flex items-center justify-between text-sm font-mono">
                <div className="flex flex-col">
                  <span className="text-white">{token}</span>
                  {amount && (
                    <span className="text-xs text-[#555]">{formatAmount(amount)}</span>
                  )}
                </div>
                <span className="text-[#888] tabular-nums">${value.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
