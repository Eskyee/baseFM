'use client';

import { useEffect, useState, useRef } from 'react';
import type { TradingLog, TradingLogType } from '@/types/trading';

const POLL_INTERVAL = 2000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getLogColor(type: TradingLogType): string {
  switch (type) {
    case 'trade':
      return 'text-green-400';
    case 'response':
      return 'text-blue-400';
    case 'analysis':
      return 'text-purple-400';
    case 'error':
      return 'text-red-400';
    case 'balance_update':
      return 'text-yellow-400';
    case 'scanning':
      return 'text-cyan-400';
    case 'system':
      return 'text-[#888]';
    default:
      return 'text-[#888]';
  }
}

function getLogIcon(type: TradingLogType): string {
  switch (type) {
    case 'trade':
      return '\u2192'; // arrow right
    case 'response':
      return '\u25C6'; // diamond
    case 'analysis':
      return '\u25CB'; // circle
    case 'error':
      return '\u2717'; // x mark
    case 'balance_update':
      return '\u25B2'; // triangle up
    case 'scanning':
      return '\u2318'; // command
    case 'system':
      return '\u25AA'; // square
    default:
      return '\u25AA';
  }
}

export function TradingFeed() {
  const [logs, setLogs] = useState<TradingLog[]>([]);
  const [latestTimestamp, setLatestTimestamp] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    async function poll() {
      try {
        const url = latestTimestamp
          ? `/api/trading/logs?after=${encodeURIComponent(latestTimestamp)}`
          : '/api/trading/logs';

        const res = await fetch(url);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setLogs((prev) => {
            const combined = [...prev, ...data];
            return combined.slice(-200); // Keep last 200 logs
          });
          setLatestTimestamp(data[data.length - 1].createdAt);
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [latestTimestamp]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Detect manual scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    setAutoScroll(isNearBottom);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#2A2A2A]">
        <h2 className="text-xs font-bold tracking-widest uppercase text-[#888] font-mono">
          Live Agent Feed
        </h2>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
      >
        {logs.length === 0 && (
          <p className="text-[#555] text-sm font-mono py-4 text-center">
            Waiting for agent activity...
          </p>
        )}

        {logs.map((log, index) => (
          <div
            key={log.id || index}
            className="flex items-start gap-3 text-sm font-mono animate-fade-in"
          >
            <span className="text-[#555] tabular-nums shrink-0">
              {formatTime(log.createdAt)}
            </span>
            <span className={`shrink-0 ${getLogColor(log.type)}`}>
              {getLogIcon(log.type)}
            </span>
            <span className={`${getLogColor(log.type)} break-all`}>{log.content}</span>
          </div>
        ))}

        {/* Blinking cursor */}
        <div className="flex items-center gap-3 text-sm font-mono">
          <span className="text-[#555] tabular-nums shrink-0">
            {formatTime(new Date().toISOString())}
          </span>
          <span className="w-2 h-4 bg-green-400 animate-blink" />
        </div>
      </div>
    </div>
  );
}
