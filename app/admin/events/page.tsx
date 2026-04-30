'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Link from 'next/link';
import type { Event } from '@/types/event';

type EventFormData = {
  name: string;
  description: string;
  location: string;
  venue: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  maxSupply: number;
  nftType: 'ERC721' | 'ERC1155';
  nftContract: string;
  artistAddress: string;
  coverImageUrl: string;
  tags: string;
};

const DEFAULT_FORM: EventFormData = {
  name: '',
  description: '',
  location: '',
  venue: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  maxSupply: 100,
  nftType: 'ERC1155',
  nftContract: '',
  artistAddress: '',
  coverImageUrl: '',
  tags: '',
};

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    draft: 'text-zinc-500 border-zinc-800',
    active: 'text-green-400 border-green-500/30',
    ended: 'text-red-400 border-red-500/30',
  };

  return (
    <span className={`basefm-kicker ${tones[status] ?? tones.draft}`}>
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

function adminHeaders(walletAddress?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (walletAddress) {
    headers['x-wallet-address'] = walletAddress;
  }
  return headers;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-black border border-zinc-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500 ${props.className || ''}`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-black border border-zinc-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500 ${props.className || ''}`}
    />
  );
}

export default function AdminEventsPage() {
  const { address, isConnected } = useAccount();
  const { adminFetch, signIn, isAuthenticated, isSigningIn } = useAdminAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EventFormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormData>(DEFAULT_FORM);
  const [isUpdating, setIsUpdating] = useState(false);

  const checkAdmin = useCallback(async () => {
    if (!address) return;
    try {
      const res = await adminFetch(`/api/admin/check?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      }
    } catch {
      setIsAdmin(false);
    }
  }, [address, adminFetch]);

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
    if (isConnected && isAuthenticated && address) {
      void checkAdmin();
      void fetchEvents();
    }
  }, [isConnected, isAuthenticated, address, checkAdmin, fetchEvents]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setShowForm(false);
  };

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
        headers: adminHeaders(address),
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
      await fetchEvents();
    } catch {
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
        await fetchEvents();
        setResult({ success: true, message: `Event ${newStatus}` });
      } else {
        const data = await res.json();
        setResult({ error: data.error || 'Failed to update event' });
      }
    } catch {
      setResult({ error: 'Failed to update event' });
    }
  };

  const startEditing = (event: Event) => {
    setEditingId(event.id);
    const startDate = new Date(event.startTime * 1000);
    const endDate = new Date(event.endTime * 1000);
    setEditForm({
      name: event.name,
      description: event.description || '',
      location: event.location || '',
      venue: event.venue || '',
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: endDate.toTimeString().slice(0, 5),
      maxSupply: event.maxSupply,
      nftType: event.nftType,
      nftContract: event.nftContract || '',
      artistAddress: event.artistAddress || '',
      coverImageUrl: event.coverImageUrl || '',
      tags: event.tags?.join(', ') || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(DEFAULT_FORM);
  };

  const handleUpdate = async (eventId: string) => {
    setIsUpdating(true);
    setResult(null);
    try {
      const startTimestamp = Math.floor(
        new Date(`${editForm.startDate}T${editForm.startTime}`).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(`${editForm.endDate}T${editForm.endTime}`).getTime() / 1000
      );

      if (endTimestamp <= startTimestamp) {
        setResult({ error: 'End time must be after start time' });
        setIsUpdating(false);
        return;
      }

      const updates: Record<string, unknown> = {
        name: editForm.name.trim(),
        start_time: startTimestamp,
        end_time: endTimestamp,
        max_supply: editForm.maxSupply,
        nft_type: editForm.nftType,
      };

      if (editForm.description) updates.description = editForm.description.trim();
      if (editForm.location) updates.location = editForm.location.trim();
      if (editForm.venue) updates.venue = editForm.venue.trim();
      if (editForm.nftContract) updates.nft_contract = editForm.nftContract.trim();
      if (editForm.artistAddress) updates.artist_address = editForm.artistAddress.trim();
      if (editForm.coverImageUrl) updates.cover_image_url = editForm.coverImageUrl.trim();
      if (editForm.tags) updates.tags = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);

      const res = await fetch('/api/events/admin-list', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, eventId, updates }),
      });

      if (res.ok) {
        setResult({ success: true, message: 'Event updated' });
        setEditingId(null);
        setEditForm(DEFAULT_FORM);
        await fetchEvents();
      } else {
        const data = await res.json();
        setResult({ error: data.error || 'Failed to update event' });
      }
    } catch {
      setResult({ error: 'Failed to update event' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="basefm-kicker text-blue-500">Admin</span>
              <span className="basefm-kicker text-zinc-500">Events</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
                Manage events.
                <br />
                <span className="text-zinc-700">Connect first.</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
                Connect the admin wallet to create events, activate listings, and close out finished nights.
              </p>
            </div>
            <WalletConnect />
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="basefm-panel p-8 text-center">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Admin only</div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">Sign in to manage events</h1>
            <p className="max-w-md mx-auto text-sm text-zinc-400 leading-relaxed mb-6">
              Sign a message to verify your admin wallet.
            </p>
            <button
              onClick={signIn}
              disabled={isSigningIn}
              className="basefm-button-primary"
            >
              {isSigningIn ? 'Check your wallet...' : 'Sign in as admin'}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!isAdmin && !isLoading) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="basefm-panel p-8 max-w-xl">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Admin</div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Access denied.</h1>
            <p className="text-sm text-zinc-500 mb-6">This wallet is not authorized for admin event management.</p>
            <Link href="/" className="basefm-button-primary">
              Go Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8 mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Admin</span>
            <span className="basefm-kicker text-zinc-500">Events control</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              Event operations.
              <br />
              <span className="text-zinc-700">Create, activate, end.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              This is the admin-side event register. Use it to shape the event calendar and keep access windows accurate.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="text-sm text-zinc-500">{events.length} events tracked</div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={showForm ? 'basefm-button-secondary' : 'basefm-button-primary'}
          >
            {showForm ? 'Cancel' : 'New Event'}
          </button>
        </div>

        {result?.success ? (
          <div className="border border-green-500/30 bg-green-500/10 p-4 mb-6 text-sm text-green-300">
            {result.message}
          </div>
        ) : null}
        {result?.error ? (
          <div className="border border-red-500/30 bg-red-500/10 p-4 mb-6 text-sm text-red-300">
            {result.error}
          </div>
        ) : null}

        {showForm ? (
          <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.05fr_0.95fr] mb-8">
            <div className="bg-black p-6 sm:p-8 space-y-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">Create event</div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <FieldLabel>Event name</FieldLabel>
                  <TextInput
                    type="text"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Berlin Warehouse Session"
                  />
                </div>

                <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
                  <div className="bg-black p-4">
                    <FieldLabel>Start date</FieldLabel>
                    <TextInput type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="bg-black p-4">
                    <FieldLabel>Start time</FieldLabel>
                    <TextInput type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                  </div>
                  <div className="bg-black p-4">
                    <FieldLabel>End date</FieldLabel>
                    <TextInput type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                  <div className="bg-black p-4">
                    <FieldLabel>End time</FieldLabel>
                    <TextInput type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
                  <div className="bg-black p-4">
                    <FieldLabel>Max passes</FieldLabel>
                    <TextInput
                      type="number"
                      required
                      min={1}
                      max={10000}
                      value={form.maxSupply}
                      onChange={(e) => setForm({ ...form, maxSupply: parseInt(e.target.value, 10) || 100 })}
                    />
                  </div>
                  <div className="bg-black p-4">
                    <FieldLabel>Pass type</FieldLabel>
                    <SelectInput
                      value={form.nftType}
                      onChange={(e) => setForm({ ...form, nftType: e.target.value as 'ERC721' | 'ERC1155' })}
                    >
                      <option value="ERC1155">Standard (Multi-pass)</option>
                      <option value="ERC721">Unique (Single-pass)</option>
                    </SelectInput>
                  </div>
                </div>

                <div>
                  <FieldLabel>Contract address</FieldLabel>
                  <TextInput
                    type="text"
                    value={form.nftContract}
                    onChange={(e) => setForm({ ...form, nftContract: e.target.value })}
                    placeholder="0x..."
                    className="font-mono"
                  />
                </div>

                <div>
                  <FieldLabel>Artist wallet</FieldLabel>
                  <TextInput
                    type="text"
                    value={form.artistAddress}
                    onChange={(e) => setForm({ ...form, artistAddress: e.target.value })}
                    placeholder="0x..."
                    className="font-mono"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" disabled={isSubmitting} className="basefm-button-primary disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500">
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                  </button>
                  <button type="button" onClick={resetForm} className="basefm-button-secondary">
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-black p-6 sm:p-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Operator notes</div>
              <div className="grid gap-px bg-zinc-900">
                {[
                  ['Lifecycle', 'Draft events can be activated when they are ready for entry flow and listing.'],
                  ['Pass supply', 'Use a practical cap so issued passes reflect the real event capacity.'],
                  ['Timing', 'Start and end timestamps drive event visibility and access windows.'],
                  ['Cleanup', 'Ended events should be closed cleanly so old access does not linger.'],
                ].map(([title, body]) => (
                  <div key={title} className="bg-black p-4">
                    <div className="text-sm font-bold uppercase tracking-wider text-white mb-2">{title}</div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="basefm-panel p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">All events</div>
            <div className="text-xs text-zinc-500">{isLoading ? 'Loading...' : `${events.length} total`}</div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-zinc-500">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">No events yet. Create the first one above.</div>
          ) : (
            <div className="grid gap-px bg-zinc-900">
              {events.map((event) => (
                <div key={event.id} className="bg-black p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-white font-medium">{event.name}</h3>
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editingId === event.id ? cancelEditing() : startEditing(event)}
                        className="basefm-button-secondary !px-4 !py-2"
                      >
                        {editingId === event.id ? 'Cancel' : 'Edit'}
                      </button>
                      {event.status === 'draft' ? (
                        <button
                          onClick={() => handleStatusChange(event.id, 'active')}
                          className="basefm-button-secondary !px-4 !py-2"
                        >
                          Activate
                        </button>
                      ) : null}
                      {event.status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(event.id, 'ended')}
                          className="basefm-button-danger !px-4 !py-2"
                        >
                          End
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                    <span>{formatDate(event.startTime)} — {formatDate(event.endTime)}</span>
                    <span>{event.minted} / {event.maxSupply} passes issued</span>
                    <span>{event.nftType === 'ERC1155' ? 'Multi-pass' : 'Unique pass'}</span>
                  </div>

                  {editingId === event.id ? (
                    <div className="mt-4 pt-4 border-t border-zinc-900 grid gap-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">Name</label>
                          <TextInput
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">Venue</label>
                          <TextInput
                            value={editForm.venue}
                            onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                            placeholder="Venue name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">Description</label>
                        <TextInput
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Event description"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">Location</label>
                          <TextInput
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">Cover Image URL</label>
                          <TextInput
                            value={editForm.coverImageUrl}
                            onChange={(e) => setEditForm({ ...editForm, coverImageUrl: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">Start</label>
                          <div className="flex gap-2">
                            <TextInput type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
                            <TextInput type="time" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">End</label>
                          <div className="flex gap-2">
                            <TextInput type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} />
                            <TextInput type="time" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">Max Supply</label>
                          <TextInput
                            type="number"
                            value={editForm.maxSupply}
                            onChange={(e) => setEditForm({ ...editForm, maxSupply: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">NFT Type</label>
                          <SelectInput
                            value={editForm.nftType}
                            onChange={(e) => setEditForm({ ...editForm, nftType: e.target.value as 'ERC721' | 'ERC1155' })}
                          >
                            <option value="ERC1155">Multi-pass (ERC-1155)</option>
                            <option value="ERC721">Unique pass (ERC-721)</option>
                          </SelectInput>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1 block">Tags</label>
                          <TextInput
                            value={editForm.tags}
                            onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                            placeholder="jungle, dub, rave"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleUpdate(event.id)}
                          disabled={isUpdating}
                          className="basefm-button-primary !px-4 !py-2 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={cancelEditing} className="basefm-button-secondary !px-4 !py-2">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
