'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { CREW_ROLE_LABELS, CREW_ROLE_CATEGORIES, type CrewRole } from '@/lib/db/crew';

interface CrewMember {
  id: string;
  walletAddress: string;
  role: CrewRole;
  name: string | null;
  contact: string | null;
  setTime: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
}

interface EventStats {
  ticketsSold: number;
  ticketsScanned: number;
  revenueUsdc: number;
  currentCapacity: number;
}

export default function PromoterDashboard() {
  const { address, isConnected } = useAccount();
  const [eventId, setEventId] = useState('');
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Add crew form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCrewWallet, setNewCrewWallet] = useState('');
  const [newCrewRole, setNewCrewRole] = useState<CrewRole>('door');
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewContact, setNewCrewContact] = useState('');
  const [adding, setAdding] = useState(false);

  // Notification
  const [notificationType, setNotificationType] = useState('doors_open');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notifyResult, setNotifyResult] = useState<string | null>(null);

  // Load crew for event
  const loadCrew = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/crew?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setCrew(data.crew || []);
      }
    } catch (err) {
      console.error('Error loading crew:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadCrew();
    }
  }, [eventId]);

  // Add crew member
  const handleAddCrew = async () => {
    if (!eventId || !newCrewWallet || !address) return;
    setAdding(true);
    try {
      const res = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          walletAddress: newCrewWallet,
          role: newCrewRole,
          addedBy: address,
          name: newCrewName || null,
          contact: newCrewContact || null,
        }),
      });
      if (res.ok) {
        setNewCrewWallet('');
        setNewCrewName('');
        setNewCrewContact('');
        setShowAddForm(false);
        loadCrew();
      }
    } catch (err) {
      console.error('Error adding crew:', err);
    } finally {
      setAdding(false);
    }
  };

  // Check in crew member
  const handleCheckIn = async (crewId: string) => {
    try {
      const res = await fetch('/api/crew', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crewId, action: 'checkin' }),
      });
      if (res.ok) {
        loadCrew();
      }
    } catch (err) {
      console.error('Error checking in:', err);
    }
  };

  // Remove crew member
  const handleRemove = async (crewId: string) => {
    if (!confirm('Remove this crew member?')) return;
    try {
      const res = await fetch(`/api/crew?crewId=${crewId}`, { method: 'DELETE' });
      if (res.ok) {
        loadCrew();
      }
    } catch (err) {
      console.error('Error removing:', err);
    }
  };

  // Send notification
  const handleNotify = async () => {
    if (!eventId || !address) return;
    setSending(true);
    setNotifyResult(null);
    try {
      const res = await fetch('/api/crew/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          notificationType,
          sentBy: address,
          customMessage: notificationType === 'custom' ? customMessage : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotifyResult(`Sent to ${data.notifiedCount} crew members`);
        setCustomMessage('');
      } else {
        setNotifyResult('Failed to send');
      }
    } catch {
      setNotifyResult('Error sending notification');
    } finally {
      setSending(false);
    }
  };

  // Filter crew by category
  const filteredCrew = selectedCategory
    ? crew.filter((c) =>
        (CREW_ROLE_CATEGORIES as Record<string, string[]>)[selectedCategory]?.includes(c.role)
      )
    : crew;

  // Group crew by role category
  const crewByCategory = Object.entries(CREW_ROLE_CATEGORIES).map(([category, roles]) => ({
    category,
    label: category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    members: crew.filter((c) => roles.includes(c.role)),
  })).filter((g) => g.members.length > 0);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-[#F5F5F5] text-xl font-bold mb-2">Promoter Dashboard</h1>
          <p className="text-[#888] text-sm mb-6">Connect wallet to manage your events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <header>
          <h1 className="text-[#F5F5F5] text-2xl font-bold mb-1">Promoter Dashboard</h1>
          <p className="text-[#888] text-sm">Manage crew, send notifications, track stats</p>
        </header>

        {/* Event Selection */}
        <div className="bg-[#1A1A1A] rounded-xl p-4 space-y-3">
          <label className="text-[#888] text-sm font-medium">Event ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Enter event ID or UUID"
              className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-lg py-2 px-3 text-[#F5F5F5] text-sm focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={loadCrew}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-400 transition-colors"
            >
              Load
            </button>
          </div>
        </div>

        {eventId && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
                <p className="text-[#888] text-xs mb-1">Total Crew</p>
                <p className="text-[#F5F5F5] text-2xl font-bold">{crew.length}</p>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
                <p className="text-[#888] text-xs mb-1">Checked In</p>
                <p className="text-green-400 text-2xl font-bold">
                  {crew.filter((c) => c.checkedIn).length}
                </p>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
                <p className="text-[#888] text-xs mb-1">Artists</p>
                <p className="text-purple-400 text-2xl font-bold">
                  {crew.filter((c) => c.role === 'artist').length}
                </p>
              </div>
              <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
                <p className="text-[#888] text-xs mb-1">Security</p>
                <p className="text-orange-400 text-2xl font-bold">
                  {crew.filter((c) => c.role === 'security').length}
                </p>
              </div>
            </div>

            {/* Send Notification */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-500/20">
              <h2 className="text-[#F5F5F5] font-semibold mb-3">Send Crew Notification</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { value: 'doors_30min', label: '30 Min to Doors' },
                  { value: 'doors_open', label: 'Doors Open' },
                  { value: 'milestone_100', label: '100 Scans' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'custom', label: 'Custom' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNotificationType(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      notificationType === opt.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {notificationType === 'custom' && (
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter custom message..."
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg py-2 px-3 text-[#F5F5F5] text-sm mb-3 focus:outline-none focus:border-purple-500"
                />
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNotify}
                  disabled={sending}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-400 disabled:opacity-50 transition-colors"
                >
                  {sending ? 'Sending...' : 'Send to All Crew'}
                </button>
                {notifyResult && (
                  <span className="text-[#888] text-sm">{notifyResult}</span>
                )}
              </div>
            </div>

            {/* Add Crew */}
            <div className="bg-[#1A1A1A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#F5F5F5] font-semibold">Crew Management</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-400 transition-colors"
                >
                  {showAddForm ? 'Cancel' : '+ Add Crew'}
                </button>
              </div>

              {showAddForm && (
                <div className="bg-[#0A0A0A] rounded-lg p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newCrewWallet}
                      onChange={(e) => setNewCrewWallet(e.target.value)}
                      placeholder="Wallet address (0x...)"
                      className="bg-[#1A1A1A] border border-[#333] rounded-lg py-2 px-3 text-[#F5F5F5] text-sm focus:outline-none focus:border-purple-500"
                    />
                    <select
                      value={newCrewRole}
                      onChange={(e) => setNewCrewRole(e.target.value as CrewRole)}
                      className="bg-[#1A1A1A] border border-[#333] rounded-lg py-2 px-3 text-[#F5F5F5] text-sm focus:outline-none focus:border-purple-500"
                    >
                      {Object.entries(CREW_ROLE_LABELS).map(([role, label]) => (
                        <option key={role} value={role}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newCrewName}
                      onChange={(e) => setNewCrewName(e.target.value)}
                      placeholder="Name (optional)"
                      className="bg-[#1A1A1A] border border-[#333] rounded-lg py-2 px-3 text-[#F5F5F5] text-sm focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      value={newCrewContact}
                      onChange={(e) => setNewCrewContact(e.target.value)}
                      placeholder="Contact (optional)"
                      className="bg-[#1A1A1A] border border-[#333] rounded-lg py-2 px-3 text-[#F5F5F5] text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={handleAddCrew}
                    disabled={!newCrewWallet || adding}
                    className="w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-400 disabled:opacity-50 transition-colors"
                  >
                    {adding ? 'Adding...' : 'Add Crew Member'}
                  </button>
                </div>
              )}

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-purple-500 text-white'
                      : 'bg-[#0A0A0A] text-[#888] hover:text-[#F5F5F5]'
                  }`}
                >
                  All ({crew.length})
                </button>
                {Object.entries(CREW_ROLE_CATEGORIES).map(([category, roles]) => {
                  const count = crew.filter((c) => roles.includes(c.role)).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-purple-500 text-white'
                          : 'bg-[#0A0A0A] text-[#888] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {category.replace(/_/g, ' ')} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Crew List */}
              {loading ? (
                <p className="text-[#888] text-sm text-center py-4">Loading crew...</p>
              ) : filteredCrew.length === 0 ? (
                <p className="text-[#888] text-sm text-center py-4">No crew members yet</p>
              ) : (
                <div className="space-y-2">
                  {filteredCrew.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        member.checkedIn ? 'bg-green-500/10' : 'bg-[#0A0A0A]'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          member.checkedIn ? 'bg-green-500/20' : 'bg-[#1A1A1A]'
                        }`}
                      >
                        {member.checkedIn ? (
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[#888] text-xs font-bold">
                            {member.name?.[0] || member.role[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[#F5F5F5] text-sm font-medium truncate">
                            {member.name || member.walletAddress.slice(0, 8) + '...'}
                          </p>
                          <span className="px-2 py-0.5 bg-[#1A1A1A] text-[#888] text-[10px] rounded-full">
                            {CREW_ROLE_LABELS[member.role]}
                          </span>
                        </div>
                        <p className="text-[#666] text-xs font-mono truncate">
                          {member.walletAddress.slice(0, 10)}...{member.walletAddress.slice(-6)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!member.checkedIn && (
                          <button
                            onClick={() => handleCheckIn(member.id)}
                            className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium hover:bg-green-500/30 transition-colors"
                          >
                            Check In
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(member.id)}
                          className="p-1 text-[#666] hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Link to POS */}
            <div className="flex justify-center">
              <Link
                href="/pos"
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg text-sm hover:text-[#F5F5F5] hover:bg-[#222] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Open POS / Ticket Scanner
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
