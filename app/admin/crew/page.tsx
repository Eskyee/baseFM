'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import {
  type CrewRole,
  CREW_ROLE_LABELS,
  CREW_ROLE_CATEGORIES,
} from '@/lib/db/crew';

interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  status: string;
}

interface CrewMember {
  id: string;
  eventId: string;
  walletAddress: string;
  role: CrewRole;
  name: string | null;
  contact: string | null;
  setTime: string | null;
  setDurationMinutes: number | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  notes: string | null;
  addedBy: string;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  management: 'Management',
  front_of_house: 'Front of House',
  security_safety: 'Security & Safety',
  audio: 'Audio',
  visual: 'Visual',
  stage_build: 'Stage & Build',
  talent: 'Talent',
  hospitality: 'Hospitality',
  operations: 'Operations',
  media: 'Media',
  misc: 'Other',
};

export default function AdminCrewPage() {
  const { address, isConnected } = useAccount();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCrew, setIsLoadingCrew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add crew member form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCrewWallet, setNewCrewWallet] = useState('');
  const [newCrewRole, setNewCrewRole] = useState<CrewRole>('door');
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewContact, setNewCrewContact] = useState('');
  const [newCrewNotes, setNewCrewNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit crew member
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);
  const [editRole, setEditRole] = useState<CrewRole>('door');
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch all events
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
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      fetchEvents();
    }
  }, [isConnected]);

  // Fetch crew for selected event
  const fetchCrew = useCallback(async () => {
    if (!selectedEvent) return;

    setIsLoadingCrew(true);
    try {
      const res = await fetch(`/api/crew?eventId=${selectedEvent}`);
      if (res.ok) {
        const data = await res.json();
        setCrew(data.crew || []);
      }
    } catch (err) {
      console.error('Failed to fetch crew:', err);
    } finally {
      setIsLoadingCrew(false);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent) {
      fetchCrew();
    } else {
      setCrew([]);
    }
  }, [selectedEvent, fetchCrew]);

  // Add crew member
  const handleAddCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !newCrewWallet || !address) return;

    setIsAdding(true);
    setError(null);

    try {
      const res = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent,
          walletAddress: newCrewWallet,
          role: newCrewRole,
          addedBy: address,
          name: newCrewName || undefined,
          contact: newCrewContact || undefined,
          notes: newCrewNotes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add crew member');
      }

      setSuccess('Crew member added successfully');
      setNewCrewWallet('');
      setNewCrewName('');
      setNewCrewContact('');
      setNewCrewNotes('');
      setNewCrewRole('door');
      setShowAddForm(false);
      fetchCrew();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add crew member');
    } finally {
      setIsAdding(false);
    }
  };

  // Remove crew member
  const handleRemoveCrew = async (crewId: string) => {
    if (!confirm('Remove this crew member?')) return;

    setError(null);
    try {
      const res = await fetch(`/api/crew?crewId=${crewId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove crew member');
      }

      setSuccess('Crew member removed');
      fetchCrew();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove crew member');
    }
  };

  // Check in crew member
  const handleCheckIn = async (crewId: string) => {
    setError(null);
    try {
      const res = await fetch('/api/crew', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crewId, action: 'checkin' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to check in crew member');
      }

      setSuccess('Crew member checked in');
      fetchCrew();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    }
  };

  // Start editing crew member
  const startEdit = (member: CrewMember) => {
    setEditingCrew(member);
    setEditRole(member.role);
    setEditName(member.name || '');
    setEditContact(member.contact || '');
    setEditNotes(member.notes || '');
  };

  // Save crew edit (would need API update endpoint)
  const handleSaveEdit = async () => {
    if (!editingCrew) return;
    // For now, remove and re-add (since we don't have an update endpoint)
    setIsEditing(true);
    setError(null);

    try {
      // Remove old
      await fetch(`/api/crew?crewId=${editingCrew.id}`, { method: 'DELETE' });

      // Add new
      const res = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: editingCrew.eventId,
          walletAddress: editingCrew.walletAddress,
          role: editRole,
          addedBy: address,
          name: editName || undefined,
          contact: editContact || undefined,
          notes: editNotes || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update crew member');
      }

      setSuccess('Crew member updated');
      setEditingCrew(null);
      fetchCrew();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsEditing(false);
    }
  };

  // Filter crew
  const filteredCrew = crew.filter((member) => {
    // Category filter
    if (filterCategory !== 'all') {
      const categoryRoles = CREW_ROLE_CATEGORIES[filterCategory as keyof typeof CREW_ROLE_CATEGORIES];
      if (!categoryRoles?.includes(member.role)) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = member.name?.toLowerCase().includes(query);
      const matchesWallet = member.walletAddress.toLowerCase().includes(query);
      const matchesRole = CREW_ROLE_LABELS[member.role].toLowerCase().includes(query);
      if (!matchesName && !matchesWallet && !matchesRole) return false;
    }

    return true;
  });

  // Stats
  const stats = {
    total: crew.length,
    checkedIn: crew.filter((c) => c.checkedIn).length,
    categories: Object.keys(CREW_ROLE_CATEGORIES).reduce((acc, cat) => {
      const roles = CREW_ROLE_CATEGORIES[cat as keyof typeof CREW_ROLE_CATEGORIES];
      acc[cat] = crew.filter((c) => roles.includes(c.role)).length;
      return acc;
    }, {} as Record<string, number>),
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
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Admin Crew Management</h1>
          <p className="text-[#888] mb-8">Connect your admin wallet to access crew controls</p>
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

        <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Crew Management</h1>
        <p className="text-[#888] text-sm mb-6">Manage crew members across all events</p>

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

        {/* Event Selection */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Select Event</h2>
          {isLoading ? (
            <div className="text-[#888]">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-[#888]">No events found</div>
          ) : (
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-[#F5F5F5]"
            >
              <option value="">Choose an event...</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {new Date(event.date).toLocaleDateString()} ({event.status})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Crew Stats */}
        {selectedEvent && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#F5F5F5]">{stats.total}</div>
              <div className="text-xs text-[#888]">Total Crew</div>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.checkedIn}</div>
              <div className="text-xs text-[#888]">Checked In</div>
            </div>
            {Object.entries(stats.categories).slice(0, 4).map(([cat, count]) => (
              <div key={cat} className="bg-[#1A1A1A] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-[#F5F5F5]">{count}</div>
                <div className="text-xs text-[#888] truncate">{CATEGORY_LABELS[cat]}</div>
              </div>
            ))}
          </div>
        )}

        {/* Crew Management */}
        {selectedEvent && (
          <div className="bg-[#1A1A1A] rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-[#F5F5F5]">Crew Members</h2>

              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search crew..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2 text-sm text-[#F5F5F5]"
                />

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-2 text-sm text-[#F5F5F5]"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  + Add Crew
                </button>
              </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
              <form onSubmit={handleAddCrew} className="bg-[#0A0A0A] rounded-lg p-4 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-[#888] mb-1">Wallet Address *</label>
                    <input
                      type="text"
                      value={newCrewWallet}
                      onChange={(e) => setNewCrewWallet(e.target.value)}
                      placeholder="0x..."
                      required
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#888] mb-1">Role *</label>
                    <select
                      value={newCrewRole}
                      onChange={(e) => setNewCrewRole(e.target.value as CrewRole)}
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]"
                    >
                      {Object.entries(CREW_ROLE_CATEGORIES).map(([category, roles]) => (
                        <optgroup key={category} label={CATEGORY_LABELS[category]}>
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {CREW_ROLE_LABELS[role as CrewRole]}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#888] mb-1">Name</label>
                    <input
                      type="text"
                      value={newCrewName}
                      onChange={(e) => setNewCrewName(e.target.value)}
                      placeholder="Display name"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#888] mb-1">Contact</label>
                    <input
                      type="text"
                      value={newCrewContact}
                      onChange={(e) => setNewCrewContact(e.target.value)}
                      placeholder="Phone/Telegram"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[#888] mb-1">Notes</label>
                    <input
                      type="text"
                      value={newCrewNotes}
                      onChange={(e) => setNewCrewNotes(e.target.value)}
                      placeholder="Internal notes"
                      className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-sm text-[#888] hover:text-[#F5F5F5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {isAdding ? 'Adding...' : 'Add Crew Member'}
                  </button>
                </div>
              </form>
            )}

            {/* Edit Form Modal */}
            {editingCrew && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Edit Crew Member</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#888] mb-1">Role</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as CrewRole)}
                        className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]"
                      >
                        {Object.entries(CREW_ROLE_CATEGORIES).map(([category, roles]) => (
                          <optgroup key={category} label={CATEGORY_LABELS[category]}>
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {CREW_ROLE_LABELS[role as CrewRole]}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#888] mb-1">Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#888] mb-1">Contact</label>
                      <input
                        type="text"
                        value={editContact}
                        onChange={(e) => setEditContact(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#888] mb-1">Notes</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#F5F5F5]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setEditingCrew(null)}
                      className="px-4 py-2 text-sm text-[#888] hover:text-[#F5F5F5]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isEditing}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {isEditing ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Crew List */}
            {isLoadingCrew ? (
              <div className="text-center py-8 text-[#888]">Loading crew...</div>
            ) : filteredCrew.length === 0 ? (
              <div className="text-center py-8 text-[#888]">
                {crew.length === 0 ? 'No crew members yet' : 'No crew members match your filter'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCrew.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      member.checkedIn ? 'bg-green-900/10 border border-green-900/30' : 'bg-[#0A0A0A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Identity
                        address={member.walletAddress as `0x${string}`}
                        className="!bg-transparent"
                      >
                        <Avatar className="w-10 h-10 rounded-full" />
                      </Identity>
                      <div>
                        <div className="flex items-center gap-2">
                          {member.name ? (
                            <span className="text-[#F5F5F5] font-medium">{member.name}</span>
                          ) : (
                            <Identity
                              address={member.walletAddress as `0x${string}`}
                              className="!bg-transparent"
                            >
                              <Name className="text-[#F5F5F5] font-medium" />
                            </Identity>
                          )}
                          <span className="px-2 py-0.5 bg-[#333] text-[#888] text-xs rounded">
                            {CREW_ROLE_LABELS[member.role]}
                          </span>
                          {member.checkedIn && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                              Checked In
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#666] mt-1">
                          <span className="font-mono">{member.walletAddress.slice(0, 6)}...{member.walletAddress.slice(-4)}</span>
                          {member.contact && <span className="ml-2">• {member.contact}</span>}
                        </div>
                        {member.notes && (
                          <div className="text-xs text-[#888] mt-1 italic">{member.notes}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!member.checkedIn && (
                        <button
                          onClick={() => handleCheckIn(member.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(member)}
                        className="px-3 py-1.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveCrew(member.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
