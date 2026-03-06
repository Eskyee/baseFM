'use client';

import { useEffect, useState } from 'react';
import type { Trade } from '@/types/trading';

const POLL_INTERVAL = 5000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function RecentTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch('/api/trading/trades');
        const data = await res.json();
        if (Array.isArray(data)) {
          setTrades(data);
        }
      } catch (err) {
        console.error('Failed to fetch trades:', err);
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const completedTrades = trades.filter((t) => t.status !== 'pending');
  const wins = completedTrades.filter((t) => t.status === 'completed').length;
  const total = completedTrades.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 px-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#888] font-mono">Trades</span>
        <span className="text-white font-mono tabular-nums">{trades.length}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#888] font-mono">Win Rate</span>
        <span className="text-white font-mono tabular-nums">{winRate}%</span>
      </div>

      <div className="h-px bg-[#2A2A2A]" />

      <div>
        <h3 className="text-xs font-bold tracking-widest uppercase text-[#888] mb-2 font-mono">
          Recent Trades
        </h3>
        {trades.length === 0 && (
          <p className="text-xs text-[#555] font-mono">No trades yet</p>
        )}
        <div className="space-y-1.5">
          {trades.slice(0, 6).map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between text-[13px] animate-fade-in font-mono"
            >
              <div className="flex items-center gap-2">
                <span
                  className={
                    trade.status === 'completed'
                      ? 'text-green-400'
                      : trade.status === 'failed'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }
                >
                  {trade.status === 'completed'
                    ? '\u2713'
                    : trade.status === 'failed'
                    ? '\u2717'
                    : '\u25CC'}
                </span>
                <span className="text-white">
                  {trade.tokenIn === 'USDC' ? '+' : '-'}
                  {trade.tokenOut}
                </span>
              </div>
              <span className="text-[#555] tabular-nums text-xs">
                {formatTime(trade.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
