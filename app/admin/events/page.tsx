'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { Event } from '@/types/event';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export default function AdminEventsPage() {
  const { address, isConnected } = useAccount();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/admin/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isConnected) {
      fetchEvents();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Event Management</h1>
          <p className="text-[#888] mb-8">Connect your admin wallet</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const handleAction = async (eventId: string, action: string, value?: boolean) => {
    setUpdating(eventId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          eventId,
          action,
          value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update');
      }

      // Update local state
      setEvents(events.map(e =>
        e.id === eventId ? data.event : e
      ));

      const actionLabels: Record<string, string> = {
        approve: 'approved',
        reject: 'rejected',
        cancel: 'cancelled',
        pending: 'set to pending',
        setFeatured: value ? 'featured' : 'unfeatured',
      };
      setSuccess(`Event ${actionLabels[action] || 'updated'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    setUpdating(event.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          eventId: event.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      setEvents(events.filter(e => e.id !== event.id));
      setSuccess(`"${event.title}" deleted`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setUpdating(null);
    }
  };

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const pendingCount = events.filter(e => e.status === 'pending').length;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Event Management</h1>
            <p className="text-[#888] text-sm mt-1">
              Review and manage event submissions
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-white text-black'
                  : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-500 text-black text-[10px] rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Events List */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-[#1A1A1A] rounded-lg" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-lg">
            <p className="text-[#888]">
              {filter === 'all' ? 'No events submitted yet' : `No ${filter} events`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className={`bg-[#1A1A1A] rounded-lg p-5 ${
                  event.status === 'rejected' || event.status === 'cancelled' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[event.status]}`} />
                      <span className="text-[#888] text-xs">{STATUS_LABELS[event.status]}</span>
                      {event.isFeatured && (
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded">
                          Featured
                        </span>
                      )}
                      {event.isPast && (
                        <span className="px-2 py-0.5 bg-[#333] text-[#888] text-[10px] font-medium rounded">
                          Past
                        </span>
                      )}
                    </div>

                    <h3 className="text-[#F5F5F5] font-bold text-lg truncate">{event.title}</h3>
                    {event.subtitle && (
                      <p className="text-[#888] text-sm truncate">{event.subtitle}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-[#666]">
                      <span>{event.displayDate}</span>
                      <span>{event.venue}</span>
                      {event.promoter && (
                        <span className="text-purple-400">by {event.promoter.name}</span>
                      )}
                    </div>

                    {event.headliners.length > 0 && (
                      <p className="text-[#666] text-xs mt-2 truncate">
                        {event.headliners.join(' • ')}
                      </p>
                    )}

                    <p className="text-[#555] text-xs mt-2">
                      Submitted {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {event.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(event.id, 'approve')}
                          disabled={updating === event.id}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(event.id, 'reject')}
                          disabled={updating === event.id}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {event.status === 'approved' && (
                      <>
                        <button
                          onClick={() => handleAction(event.id, 'setFeatured', !event.isFeatured)}
                          disabled={updating === event.id}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                            event.isFeatured
                              ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                              : 'bg-[#333] text-[#888] hover:bg-[#444]'
                          }`}
                        >
                          {event.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleAction(event.id, 'cancel')}
                          disabled={updating === event.id}
                          className="px-4 py-2 bg-[#333] text-[#888] rounded text-sm font-medium hover:bg-[#444] transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {(event.status === 'rejected' || event.status === 'cancelled') && (
                      <button
                        onClick={() => handleAction(event.id, 'pending')}
                        disabled={updating === event.id}
                        className="px-4 py-2 bg-[#333] text-[#888] rounded text-sm font-medium hover:bg-[#444] transition-colors disabled:opacity-50"
                      >
                        Restore
                      </button>
                    )}

                    <Link
                      href={`/events/${event.slug}`}
                      className="px-4 py-2 bg-[#333] text-[#888] rounded text-sm font-medium hover:bg-[#444] transition-colors text-center"
                    >
                      View
                    </Link>

                    <button
                      onClick={() => handleDelete(event)}
                      disabled={updating === event.id}
                      className="px-4 py-2 bg-red-900/20 text-red-400 rounded text-sm font-medium hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-[#1A1A1A] rounded-lg">
          <h3 className="text-[#F5F5F5] font-medium mb-2">Event Status Types</h3>
          <ul className="text-[#888] text-sm space-y-1">
            <li><span className="text-yellow-400">Pending</span> — Awaiting admin review</li>
            <li><span className="text-green-400">Approved</span> — Visible on the events page</li>
            <li><span className="text-red-400">Rejected</span> — Not approved for listing</li>
            <li><span className="text-gray-400">Cancelled</span> — Event was cancelled</li>
            <li><span className="text-purple-400">Featured</span> — Shows on homepage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
