'use client';

import { useEffect, useState } from 'react';

interface TradingHeaderProps {
  startedAt: Date;
  walletAddress?: string;
}

export function TradingHeader({ startedAt, walletAddress }: TradingHeaderProps) {
  const [uptime, setUptime] = useState('00:00');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setUptime(
        h > 0
          ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'Not connected';

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] bg-[#111113]/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold tracking-wider uppercase text-white font-mono">
            Trading Agent
          </span>
        </div>
        <span className="text-xs text-green-400 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 font-mono">
          Live
        </span>
        <span className="text-xs text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 font-mono">
          Base Network
        </span>
        {walletAddress && (
          <button
            onClick={copyAddress}
            className="flex items-center gap-1.5 text-xs text-[#888] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] hover:border-purple-500/40 hover:text-white transition-colors cursor-pointer"
            title="Copy wallet address"
          >
            <span>Agent: {truncatedAddress}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={copied ? 'text-green-400' : ''}
            >
              {copied ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-[#888] font-mono tabular-nums">{uptime}</span>
      </div>
    </header>
  );
}
