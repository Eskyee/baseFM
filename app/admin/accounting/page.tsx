'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';

interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  status: string;
}

interface TicketSale {
  id: string;
  ticketId: string;
  ticketName: string;
  eventId: string;
  eventTitle: string;
  buyerWallet: string;
  quantity: number;
  amountUsdc: number;
  txHash: string;
  promoterWallet: string;
  status: string;
  purchasedAt: string;
}

interface TipRecord {
  id: string;
  fromWallet: string;
  toWallet: string;
  toDjName: string;
  token: string;
  amount: number;
  txHash: string;
  createdAt: string;
}

interface AccountingSummary {
  totalTicketRevenue: number;
  totalTicketsSold: number;
  totalTips: number;
  totalTipCount: number;
  eventBreakdown: {
    eventId: string;
    eventTitle: string;
    revenue: number;
    ticketsSold: number;
    promoterWallet: string;
  }[];
  recentSales: TicketSale[];
  recentTips: TipRecord[];
}

export default function AdminAccountingPage() {
  const { address, isConnected } = useAccount();
  const { adminFetch } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [summary, setSummary] = useState<AccountingSummary | null>(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events?all=true');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };

    if (isConnected) {
      fetchEvents();
    }
  }, [isConnected]);

  // Fetch accounting data
  useEffect(() => {
    const fetchAccountingData = async () => {
      setIsLoading(true);
      try {
        // Fetch ticket purchases
        const ticketsParams = new URLSearchParams();
        if (selectedEvent !== 'all') {
          ticketsParams.set('eventId', selectedEvent);
        }
        ticketsParams.set('dateRange', dateRange);

        const [ticketsRes, tipsRes] = await Promise.all([
          adminFetch(`/api/admin/accounting/tickets?${ticketsParams}`),
          adminFetch(`/api/admin/accounting/tips?dateRange=${dateRange}`),
        ]);

        let ticketData = { sales: [], summary: { totalRevenue: 0, totalSold: 0, eventBreakdown: [] } };
        let tipData = { tips: [], summary: { totalAmount: 0, totalCount: 0 } };

        if (ticketsRes.ok) {
          ticketData = await ticketsRes.json();
        }
        if (tipsRes.ok) {
          tipData = await tipsRes.json();
        }

        setSummary({
          totalTicketRevenue: ticketData.summary?.totalRevenue || 0,
          totalTicketsSold: ticketData.summary?.totalSold || 0,
          totalTips: tipData.summary?.totalAmount || 0,
          totalTipCount: tipData.summary?.totalCount || 0,
          eventBreakdown: ticketData.summary?.eventBreakdown || [],
          recentSales: ticketData.sales || [],
          recentTips: tipData.tips || [],
        });
      } catch (err) {
        console.error('Failed to fetch accounting data:', err);
        // Set empty summary on error
        setSummary({
          totalTicketRevenue: 0,
          totalTicketsSold: 0,
          totalTips: 0,
          totalTipCount: 0,
          eventBreakdown: [],
          recentSales: [],
          recentTips: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      fetchAccountingData();
    }
  }, [isConnected, selectedEvent, dateRange]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Admin Accounting</h1>
          <p className="text-[#888] mb-8">Connect your admin wallet to view financial data</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/admin"
          className="text-[#888] hover:text-[#F5F5F5] mb-6 inline-flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Admin
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Accounting</h1>
            <p className="text-[#888] text-sm">Financial overview and transaction history</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-sm text-[#F5F5F5]"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2 text-sm text-[#F5F5F5]"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-[#888]">Loading accounting data...</div>
        ) : (
          <>
            {/* Currency Notice & Conversion Guide */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold">$</span>
                  </div>
                  <div>
                    <p className="text-[#F5F5F5] font-medium">Default: USDC on Base</p>
                    <p className="text-[#888] text-xs">1 USDC = 1 USD (stablecoin)</p>
                  </div>
                </div>

                {/* Quick GBP Conversion Guide */}
                <div className="flex items-center gap-4 p-3 bg-[#0A0A0A] rounded-lg">
                  <div className="text-center">
                    <p className="text-[#888] text-xs">USDC → GBP</p>
                    <p className="text-[#F5F5F5] text-sm font-medium">~£0.79</p>
                  </div>
                  <div className="h-8 w-px bg-[#333]" />
                  <div className="grid grid-cols-4 gap-3 text-center text-xs">
                    <div>
                      <p className="text-[#888]">$10</p>
                      <p className="text-[#F5F5F5]">£7.90</p>
                    </div>
                    <div>
                      <p className="text-[#888]">$25</p>
                      <p className="text-[#F5F5F5]">£19.75</p>
                    </div>
                    <div>
                      <p className="text-[#888]">$50</p>
                      <p className="text-[#F5F5F5]">£39.50</p>
                    </div>
                    <div>
                      <p className="text-[#888]">$100</p>
                      <p className="text-[#F5F5F5]">£79</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Revenue in GBP */}
              {(summary?.totalTicketRevenue || 0) > 0 && (
                <div className="mt-4 pt-4 border-t border-[#333] flex items-center justify-between">
                  <span className="text-[#888] text-sm">Total ticket revenue in GBP (approx)</span>
                  <span className="text-[#F5F5F5] font-bold">
                    £{((summary?.totalTicketRevenue || 0) * 0.79).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <div className="text-sm text-[#888] mb-1">Ticket Revenue</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(summary?.totalTicketRevenue || 0)}
                </div>
                <div className="text-xs text-[#666] mt-1">USDC on Base</div>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <div className="text-sm text-[#888] mb-1">Tickets Sold</div>
                <div className="text-2xl font-bold text-[#F5F5F5]">
                  {summary?.totalTicketsSold || 0}
                </div>
                <div className="text-xs text-[#666] mt-1">Total</div>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <div className="text-sm text-[#888] mb-1">DJ Tips (est.)</div>
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(summary?.totalTips || 0)}
                </div>
                <div className="text-xs text-[#666] mt-1">USDC equivalent</div>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-5">
                <div className="text-sm text-[#888] mb-1">Tip Count</div>
                <div className="text-2xl font-bold text-[#F5F5F5]">
                  {summary?.totalTipCount || 0}
                </div>
                <div className="text-xs text-[#666] mt-1">Transactions</div>
              </div>
            </div>

            {/* Event Breakdown */}
            {(summary?.eventBreakdown?.length || 0) > 0 && (
              <div className="bg-[#1A1A1A] rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Revenue by Event</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-[#888]">
                        <th className="pb-3">Event</th>
                        <th className="pb-3 text-right">Revenue</th>
                        <th className="pb-3 text-right">Tickets</th>
                        <th className="pb-3 text-right">Promoter</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {summary?.eventBreakdown.map((event) => (
                        <tr key={event.eventId} className="border-t border-[#333]">
                          <td className="py-3 text-[#F5F5F5]">{event.eventTitle}</td>
                          <td className="py-3 text-right text-green-400">
                            {formatCurrency(event.revenue)}
                          </td>
                          <td className="py-3 text-right text-[#888]">{event.ticketsSold}</td>
                          <td className="py-3 text-right">
                            <span className="text-[#666] font-mono text-xs">
                              {event.promoterWallet?.slice(0, 6)}...{event.promoterWallet?.slice(-4)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Ticket Sales */}
              <div className="bg-[#1A1A1A] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Recent Ticket Sales</h2>
                {(summary?.recentSales?.length || 0) === 0 ? (
                  <div className="text-[#888] text-sm text-center py-8">No ticket sales found</div>
                ) : (
                  <div className="space-y-3">
                    {summary?.recentSales.slice(0, 10).map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Identity
                            address={sale.buyerWallet as `0x${string}`}
                            className="!bg-transparent"
                          >
                            <Avatar className="w-8 h-8 rounded-full" />
                          </Identity>
                          <div>
                            <div className="text-[#F5F5F5] text-sm font-medium">
                              {sale.eventTitle || 'Event'}
                            </div>
                            <div className="text-[#666] text-xs">
                              {sale.quantity}x {sale.ticketName || 'Ticket'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-medium">
                            {formatCurrency(sale.amountUsdc)}
                          </div>
                          <div className="text-[#666] text-xs">{formatDate(sale.purchasedAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Tips */}
              <div className="bg-[#1A1A1A] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Recent Tips</h2>
                {(summary?.recentTips?.length || 0) === 0 ? (
                  <div className="text-[#888] text-sm text-center py-8">No tips found</div>
                ) : (
                  <div className="space-y-3">
                    {summary?.recentTips.slice(0, 10).map((tip) => (
                      <div
                        key={tip.id}
                        className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Identity
                            address={tip.fromWallet as `0x${string}`}
                            className="!bg-transparent"
                          >
                            <Avatar className="w-8 h-8 rounded-full" />
                          </Identity>
                          <div>
                            <div className="flex items-center gap-1">
                              <Identity
                                address={tip.fromWallet as `0x${string}`}
                                className="!bg-transparent"
                              >
                                <Name className="text-[#F5F5F5] text-sm" />
                              </Identity>
                              <span className="text-[#666] text-xs">→</span>
                              <span className="text-[#888] text-sm">{tip.toDjName || 'DJ'}</span>
                            </div>
                            <div className="text-[#666] text-xs">{tip.token}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-purple-400 font-medium">
                            {tip.amount} {tip.token}
                          </div>
                          <div className="text-[#666] text-xs">{formatDate(tip.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Export Section */}
            <div className="mt-8 bg-[#1A1A1A] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Export Data</h2>
              <p className="text-[#888] text-sm mb-4">
                Download transaction data for accounting and record-keeping.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    // Export ticket sales as CSV
                    if (!summary?.recentSales.length) return;
                    const csv = [
                      'Date,Event,Ticket,Buyer,Quantity,Amount USDC,Promoter,TX Hash',
                      ...summary.recentSales.map((s) =>
                        [
                          s.purchasedAt,
                          s.eventTitle,
                          s.ticketName,
                          s.buyerWallet,
                          s.quantity,
                          s.amountUsdc,
                          s.promoterWallet,
                          s.txHash,
                        ].join(',')
                      ),
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ticket-sales-${dateRange}.csv`;
                    a.click();
                  }}
                  className="px-4 py-2 bg-[#0A0A0A] border border-[#333] text-[#F5F5F5] rounded-lg text-sm font-medium hover:bg-[#111] transition-colors"
                >
                  Export Ticket Sales (CSV)
                </button>
                <button
                  onClick={() => {
                    // Export tips as CSV
                    if (!summary?.recentTips.length) return;
                    const csv = [
                      'Date,From,To,DJ Name,Token,Amount,TX Hash',
                      ...summary.recentTips.map((t) =>
                        [
                          t.createdAt,
                          t.fromWallet,
                          t.toWallet,
                          t.toDjName,
                          t.token,
                          t.amount,
                          t.txHash,
                        ].join(',')
                      ),
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tips-${dateRange}.csv`;
                    a.click();
                  }}
                  className="px-4 py-2 bg-[#0A0A0A] border border-[#333] text-[#F5F5F5] rounded-lg text-sm font-medium hover:bg-[#111] transition-colors"
                >
                  Export Tips (CSV)
                </button>
              </div>
            </div>

            {/* Note about direct payments */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> All ticket payments are in USDC on Base and go directly to promoter wallets. Tips can be in ETH, USDC, RAVE, or cbBTC and go directly to DJ wallets. baseFM does not hold or process any funds - this page shows onchain transaction records for transparency.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
