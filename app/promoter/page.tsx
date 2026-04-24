'use client';

import { useCallback, useEffect, useState } from 'react';
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 text-sm ${props.className || ''}`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-500 text-sm ${props.className || ''}`}
    />
  );
}

export default function PromoterDashboard() {
  const { address, isConnected } = useAccount();
  const [eventId, setEventId] = useState('');
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCrewWallet, setNewCrewWallet] = useState('');
  const [newCrewRole, setNewCrewRole] = useState<CrewRole>('door');
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewContact, setNewCrewContact] = useState('');
  const [adding, setAdding] = useState(false);

  const [notificationType, setNotificationType] = useState('doors_open');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notifyResult, setNotifyResult] = useState<string | null>(null);

  const loadCrew = useCallback(async () => {
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
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      void loadCrew();
    }
  }, [eventId, loadCrew]);

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
        await loadCrew();
      }
    } catch (err) {
      console.error('Error adding crew:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleCheckIn = async (crewId: string) => {
    try {
      const res = await fetch('/api/crew', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crewId, action: 'checkin' }),
      });
      if (res.ok) {
        await loadCrew();
      }
    } catch (err) {
      console.error('Error checking in:', err);
    }
  };

  const handleRemove = async (crewId: string) => {
    if (!confirm('Remove this crew member?')) return;
    try {
      const res = await fetch(`/api/crew?crewId=${crewId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadCrew();
      }
    } catch (err) {
      console.error('Error removing:', err);
    }
  };

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

  const filteredCrew = selectedCategory
    ? crew.filter((c) => (CREW_ROLE_CATEGORIES as Record<string, string[]>)[selectedCategory]?.includes(c.role))
    : crew;

  const categoryCounts = Object.entries(CREW_ROLE_CATEGORIES)
    .map(([category, roles]) => ({
      category,
      count: crew.filter((c) => roles.includes(c.role)).length,
    }))
    .filter((item) => item.count > 0);

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="basefm-kicker text-blue-500">Promoter</span>
              <span className="basefm-kicker text-zinc-500">Crew control</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
                Manage your event.
                <br />
                <span className="text-zinc-700">Connect your wallet.</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
                Connect the promoter wallet to manage crew, send notices, and run a cleaner event-day control surface.
              </p>
            </div>
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
            <span className="basefm-kicker text-blue-500">Promoter</span>
            <span className="basefm-kicker text-zinc-500">Crew and notifications</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              Event control.
              <br />
              <span className="text-zinc-700">Crew, check-in, and broadcast notices.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              Keep the promoter control surface direct: load the event, manage crew, push a notice, then hand off to the POS scanner when doors open.
            </p>
          </div>
        </div>

        <div className="grid gap-px bg-zinc-900 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-black p-6 sm:p-8 space-y-6">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">Operator panel</div>

            <div className="basefm-panel p-4">
              <FieldLabel>Event ID</FieldLabel>
              <div className="flex gap-3">
                <TextInput value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="Enter event ID or UUID" />
                <button onClick={loadCrew} className="basefm-button-primary !px-5">
                  Load
                </button>
              </div>
            </div>

            {eventId ? (
              <>
                <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
                  <div className="bg-black p-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Total crew</div>
                    <div className="text-3xl font-bold text-white">{crew.length}</div>
                  </div>
                  <div className="bg-black p-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Checked in</div>
                    <div className="text-3xl font-bold text-green-400">{crew.filter((c) => c.checkedIn).length}</div>
                  </div>
                </div>

                <div className="basefm-panel p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600">Crew notices</div>
                    {notifyResult ? <span className="text-xs text-zinc-500">{notifyResult}</span> : null}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { value: 'doors_30min', label: '30 min to doors' },
                      { value: 'doors_open', label: 'Doors open' },
                      { value: 'milestone_100', label: '100 scans' },
                      { value: 'emergency', label: 'Emergency' },
                      { value: 'custom', label: 'Custom' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setNotificationType(opt.value)}
                        className={`px-3 py-2 text-[10px] uppercase tracking-widest border transition-colors ${
                          notificationType === opt.value
                            ? 'border-white bg-white text-black'
                            : 'border-zinc-800 text-zinc-500 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {notificationType === 'custom' ? (
                    <TextInput value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Enter custom message..." className="mb-3" />
                  ) : null}

                  <button onClick={handleNotify} disabled={sending} className="basefm-button-secondary w-full">
                    {sending ? 'Sending...' : 'Send to All Crew'}
                  </button>
                </div>

                <div className="basefm-panel p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600">Crew intake</div>
                    <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="basefm-button-secondary !px-4 !py-2">
                      {showAddForm ? 'Cancel' : 'Add Crew'}
                    </button>
                  </div>

                  {showAddForm ? (
                    <div className="space-y-3">
                      <TextInput value={newCrewWallet} onChange={(e) => setNewCrewWallet(e.target.value)} placeholder="Wallet address (0x...)" />
                      <SelectInput value={newCrewRole} onChange={(e) => setNewCrewRole(e.target.value as CrewRole)}>
                        {Object.entries(CREW_ROLE_LABELS).map(([role, label]) => (
                          <option key={role} value={role}>
                            {label}
                          </option>
                        ))}
                      </SelectInput>
                      <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
                        <div className="bg-black p-4">
                          <FieldLabel>Name</FieldLabel>
                          <TextInput value={newCrewName} onChange={(e) => setNewCrewName(e.target.value)} placeholder="Optional" />
                        </div>
                        <div className="bg-black p-4">
                          <FieldLabel>Contact</FieldLabel>
                          <TextInput value={newCrewContact} onChange={(e) => setNewCrewContact(e.target.value)} placeholder="Optional" />
                        </div>
                      </div>
                      <button onClick={handleAddCrew} disabled={!newCrewWallet || adding} className="basefm-button-primary w-full disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500">
                        {adding ? 'Adding...' : 'Add Crew Member'}
                      </button>
                    </div>
                  ) : null}
                </div>

                <Link href="/pos" className="basefm-button-secondary w-full">
                  Open POS / Ticket Scanner
                </Link>
              </>
            ) : (
              <div className="border border-zinc-800 bg-black p-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Load an event first to unlock crew management and notifications.
                </p>
              </div>
            )}
          </div>

          <div className="bg-black p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">Crew list</div>
              {categoryCounts.length > 0 ? <div className="text-xs text-zinc-500">{filteredCrew.length} visible</div> : null}
            </div>

            {eventId ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-2 text-[10px] uppercase tracking-widest border ${!selectedCategory ? 'border-white bg-white text-black' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
                  >
                    All ({crew.length})
                  </button>
                  {categoryCounts.map((item) => (
                    <button
                      key={item.category}
                      onClick={() => setSelectedCategory(item.category)}
                      className={`px-3 py-2 text-[10px] uppercase tracking-widest border ${
                        selectedCategory === item.category ? 'border-white bg-white text-black' : 'border-zinc-800 text-zinc-500 hover:text-white'
                      }`}
                    >
                      {item.category.replace(/_/g, ' ')} ({item.count})
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="text-sm text-zinc-500 py-8">Loading crew...</div>
                ) : filteredCrew.length === 0 ? (
                  <div className="basefm-panel p-8 text-center">
                    <p className="text-sm text-zinc-500">No crew members in this view yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-px bg-zinc-900">
                    {filteredCrew.map((member) => (
                      <div key={member.id} className="bg-black p-4 flex items-center gap-4">
                        <div className={`h-10 w-10 border flex items-center justify-center flex-shrink-0 ${member.checkedIn ? 'border-green-500/30 text-green-400' : 'border-zinc-800 text-zinc-500'}`}>
                          {member.checkedIn ? 'IN' : (member.name?.[0] || member.role[0].toUpperCase())}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm text-white font-medium truncate">{member.name || `${member.walletAddress.slice(0, 8)}...`}</span>
                            <span className="basefm-kicker text-zinc-500">{CREW_ROLE_LABELS[member.role]}</span>
                            {member.checkedIn ? <span className="basefm-kicker text-green-400">Checked in</span> : null}
                          </div>
                          <p className="text-xs text-zinc-500 font-mono truncate">
                            {member.walletAddress.slice(0, 10)}...{member.walletAddress.slice(-6)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!member.checkedIn ? (
                            <button onClick={() => handleCheckIn(member.id)} className="basefm-button-secondary !px-4 !py-2">
                              Check In
                            </button>
                          ) : null}
                          <button onClick={() => handleRemove(member.id)} className="basefm-button-danger !px-4 !py-2">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="basefm-panel p-8 text-center">
                <p className="text-sm text-zinc-500">Load an event to see the live crew roster.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
