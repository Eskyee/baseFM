'use client';

import { useState, useEffect, useCallback } from 'react';
import { ErrorState } from './ui/ErrorState';

interface Transaction {
  id: string;
  type: 'tip_sent' | 'tip_received' | 'ticket_purchase';
  amount: string;
  token: string;
  txHash: string;
  timestamp: string;
  counterparty?: string;
  description?: string;
}

interface TransactionHistoryProps {
  walletAddress: string;
}

export function TransactionHistory({ walletAddress }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions?wallet=${walletAddress}`);
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions();
    }
  }, [walletAddress, fetchTransactions]);

  const formatAmount = (amount: string, token: string) => {
    const num = parseFloat(amount);
    if (token === 'USDC') return `$${num.toFixed(2)}`;
    if (token === 'ETH') return `${num.toFixed(4)} ETH`;
    return `${num.toLocaleString()} ${token}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'tip_sent':
        return (
          <div className="w-8 h-8 rounded-full bg-orange-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        );
      case 'tip_received':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'ticket_purchase':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        );
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'tip_sent': return 'Tip Sent';
      case 'tip_received': return 'Tip Received';
      case 'ticket_purchase': return 'Ticket Purchase';
    }
  };

  if (isLoading) {
    return (
      <section className="bg-[#1A1A1A] rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-[#F5F5F5] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#252525] skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#252525] rounded w-24 skeleton" />
                <div className="h-3 bg-[#252525] rounded w-16 skeleton" />
              </div>
              <div className="h-4 bg-[#252525] rounded w-16 skeleton" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#1A1A1A] rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-[#F5F5F5] mb-4">Recent Activity</h3>
        <ErrorState
          compact
          message={error}
          onRetry={fetchTransactions}
        />
      </section>
    );
  }

  if (transactions.length === 0) {
    return (
      <section className="bg-[#1A1A1A] rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-[#F5F5F5] mb-4">Recent Activity</h3>
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-[#888] text-sm">No transactions yet</p>
          <p className="text-[#666] text-xs mt-1">Tips and purchases will appear here</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#1A1A1A] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F5F5F5]">Recent Activity</h3>
        <button
          onClick={fetchTransactions}
          className="p-1.5 hover:bg-[#252525] rounded-lg transition-colors"
          aria-label="Refresh"
        >
          <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        {transactions.slice(0, 5).map(tx => (
          <a
            key={tx.id}
            href={`https://basescan.org/tx/${tx.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-[#252525] transition-colors"
          >
            {getTypeIcon(tx.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#F5F5F5] font-medium">{getTypeLabel(tx.type)}</p>
              <p className="text-xs text-[#666] truncate">
                {tx.description || formatDate(tx.timestamp)}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium tabular-nums ${
                tx.type === 'tip_received' ? 'text-green-400' : 'text-[#F5F5F5]'
              }`}>
                {tx.type === 'tip_received' ? '+' : '-'}{formatAmount(tx.amount, tx.token)}
              </p>
              <p className="text-[10px] text-[#666]">{formatDate(tx.timestamp)}</p>
            </div>
          </a>
        ))}
      </div>
      {transactions.length > 5 && (
        <a
          href={`https://basescan.org/address/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-[#888] hover:text-[#F5F5F5] mt-4 py-2 transition-colors"
        >
          View all on BaseScan
        </a>
      )}
    </section>
  );
}
