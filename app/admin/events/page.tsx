'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import type { Event } from '@/types/event';

// ============================================================
// Admin Events Page
// Wallet-gated — only ADMIN_WALLETS can access
//
// UX Copy:
//   ✅ Access, Pass, Entry, Confirmed
//   ❌ NFT, Token, Mint, Blockchain, Gas, Transaction
// ============================================================

type EventFormData = {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  maxSupply: number;
  nftType: 'ERC721' | 'ERC1155';
  nftContract: string;
  artistAddress: string;
};

const DEFAULT_FORM: EventFormData = {
  name: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  maxSupply: 100,
  nftType: 'ERC1155',
  nftContract: '',
  artistAddress: '',
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-[#333] text-[#888]',
    active: 'bg-green-500/20 text-green-400',
    ended: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[status] ?? colors.draft}`}>
      {status}
    </span>
  );
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminEventsPage() {
  const { address, isConnected } = useAccount();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EventFormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const checkAdmin = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/admin/check?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      }
    } catch {
      setIsAdmin(false);
    }
  }, [address]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events/admin-list');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      checkAdmin();
      fetchEvents();
    }
  }, [isConnected, address, checkAdmin, fetchEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const startTimestamp = Math.floor(
        new Date(`${form.startDate}T${form.startTime}`).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(`${form.endDate}T${form.endTime}`).getTime() / 1000
      );

      if (endTimestamp <= startTimestamp) {
        setResult({ error: 'End time must be after start time' });
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/events/admin-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          name: form.name.trim(),
          startTime: startTimestamp,
          endTime: endTimestamp,
          maxSupply: form.maxSupply,
          nftType: form.nftType,
          nftContract: form.nftContract.trim() || undefined,
          artistAddress: form.artistAddress.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || 'Failed to create event' });
        return;
      }

      setResult({ success: true, message: 'Event created' });
      setForm(DEFAULT_FORM);
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setResult({ error: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/events/admin-list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          eventId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        fetchEvents();
        setResult({ success: true, message: `Event ${newStatus}` });
      } else {
        const data = await res.json();
        setResult({ error: data.error || 'Failed to update event' });
      }
    } catch {
      setResult({ error: 'Failed to update event' });
    }
  };

  // ---- Not connected ----
  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Event Management</h1>
          <p className="text-[#888] mb-8">Connect your admin wallet to manage events</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  // ---- Not admin ----
  if (!isAdmin && !isLoading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Access Denied</h1>
          <p className="text-[#888] mb-4">This wallet is not authorized for admin access.</p>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5] mb-1">Events</h1>
            <p className="text-[#888] text-sm">{events.length} events</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            {showForm ? 'Cancel' : '+ New Event'}
          </button>
        </div>

        {/* Results */}
        {result?.success && (
          <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {result.message}
          </div>
        )}
        {result?.error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {result.error}
          </div>
        )}

        {/* Create Event Form */}
        {showForm && (
          <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Create Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-[#888] mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none"
                  placeholder="Berlin Warehouse Session"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#888] mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888] mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#888] mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Supply & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#888] mb-1">Max Passes</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10000}
                    value={form.maxSupply}
                    onChange={(e) => setForm({ ...form, maxSupply: parseInt(e.target.value) || 100 })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#888] mb-1">Pass Type</label>
                  <select
                    value={form.nftType}
                    onChange={(e) => setForm({ ...form, nftType: e.target.value as 'ERC721' | 'ERC1155' })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ERC1155">Standard (Multi-pass)</option>
                    <option value="ERC721">Unique (Single-pass)</option>
                  </select>
                </div>
              </div>

              {/* Optional: Contract & Artist */}
              <div>
                <label className="block text-sm text-[#888] mb-1">Contract Address (optional)</label>
                <input
                  type="text"
                  value={form.nftContract}
                  onChange={(e) => setForm({ ...form, nftContract: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block text-sm text-[#888] mb-1">Artist Wallet (optional)</label>
                <input
                  type="text"
                  value={form.artistAddress}
                  onChange={(e) => setForm({ ...form, artistAddress: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none font-mono"
                  placeholder="0x..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="bg-[#1A1A1A] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">All Events</h2>

          {isLoading ? (
            <div className="text-center py-8 text-[#888]">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-[#888]">No events yet. Create your first one above.</div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-4 bg-[#0A0A0A] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[#F5F5F5] font-medium">{event.name}</h3>
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      {event.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(event.id, 'active')}
                          className="px-3 py-1.5 text-xs font-medium rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      {event.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(event.id, 'ended')}
                          className="px-3 py-1.5 text-xs font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          End
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#666]">
                    <span>{formatDate(event.startTime)} — {formatDate(event.endTime)}</span>
                    <span>{event.minted} / {event.maxSupply} passes issued</span>
                    <span className="text-[#555]">{event.nftType === 'ERC1155' ? 'Multi-pass' : 'Unique pass'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
