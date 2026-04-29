'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { ScheduleSlot, DAY_NAMES } from '@/types/schedule';
import { DJ } from '@/types/dj';

const GENRE_OPTIONS = [
  'House', 'Techno', 'Drum & Bass', 'Trance', 'Dubstep',
  'Hip Hop', 'R&B', 'Lo-Fi', 'Ambient', 'Disco',
  'Garage', 'Jungle', 'Breakbeat', 'Electro', 'Mixed', 'Other',
];

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

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-black border border-zinc-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500 resize-none ${props.className || ''}`}
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

export default function AdminSchedulePage() {
  const { address, isConnected } = useAccount();
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [djs, setDJs] = useState<DJ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);

  const [formData, setFormData] = useState({
    dayOfWeek: 0,
    startTime: '12:00',
    endTime: '14:00',
    showName: '',
    description: '',
    genre: '',
    djId: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [slotsRes, djsRes] = await Promise.all([
          fetch('/api/schedule'),
          fetch('/api/djs'),
        ]);

        if (slotsRes.ok) {
          const data = await slotsRes.json();
          setSlots(data.slots || []);
        }

        if (djsRes.ok) {
          const data = await djsRes.json();
          setDJs(data.djs || []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isConnected) {
      void fetchData();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="basefm-kicker text-blue-500">Admin</span>
              <span className="basefm-kicker text-zinc-500">Schedule</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
                Manage schedule.
                <br />
                <span className="text-zinc-700">Connect first.</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
                Connect the admin wallet to shape the weekly programming grid and keep the station timetable coherent.
              </p>
            </div>
            <WalletConnect />
          </div>
        </section>
      </main>
    );
  }

  const resetForm = () => {
    setShowForm(false);
    setEditingSlot(null);
    setFormData({
      dayOfWeek: 0,
      startTime: '12:00',
      endTime: '14:00',
      showName: '',
      description: '',
      genre: '',
      djId: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingSlot ? `/api/schedule/${editingSlot.id}` : '/api/schedule';
      const method = editingSlot ? 'PATCH' : 'POST';
      const selectedDJ = djs.find((d) => d.id === formData.djId);

      const res = await fetch(url, {
        method,
        headers: adminHeaders(address),
        body: JSON.stringify({
          walletAddress: address,
          ...formData,
          djWalletAddress: selectedDJ?.walletAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess(editingSlot ? 'Slot updated!' : 'Slot created!');

      const slotsRes = await fetch('/api/schedule');
      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setSlots(slotsData.slots || []);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime.slice(0, 5),
      endTime: slot.endTime.slice(0, 5),
      showName: slot.showName,
      description: slot.description || '',
      genre: slot.genre || '',
      djId: slot.djId || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Delete this schedule slot?')) return;

    try {
      const res = await fetch(`/api/schedule/${slotId}`, {
        method: 'DELETE',
        headers: adminHeaders(address),
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setSlots(slots.filter((s) => s.id !== slotId));
      setSuccess('Slot deleted!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, ScheduleSlot[]>);

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8 mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Admin</span>
            <span className="basefm-kicker text-zinc-500">Weekly programming</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              Schedule control.
              <br />
              <span className="text-zinc-700">Keep the station grid tight.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              This is the weekly programming surface for admins. Add new slots, assign DJs, and keep the broadcast week coherent.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="text-sm text-zinc-500">{slots.length} slots loaded</div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingSlot(null);
              setFormData({
                dayOfWeek: 0,
                startTime: '12:00',
                endTime: '14:00',
                showName: '',
                description: '',
                genre: '',
                djId: '',
              });
            }}
            className="basefm-button-primary"
          >
            Add Slot
          </button>
        </div>

        {error ? (
          <div className="border border-red-500/30 bg-red-500/10 p-4 mb-6 text-sm text-red-300">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="border border-green-500/30 bg-green-500/10 p-4 mb-6 text-sm text-green-300">
            {success}
          </div>
        ) : null}

        {showForm ? (
          <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1fr_1fr] mb-8">
            <div className="bg-black p-6 sm:p-8 space-y-4">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600">
                {editingSlot ? 'Edit slot' : 'New schedule slot'}
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
                  <div className="bg-black p-4">
                    <FieldLabel>Day</FieldLabel>
                    <SelectInput
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value, 10) })}
                    >
                      {DAY_NAMES.map((day, i) => (
                        <option key={day} value={i}>
                          {day}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="bg-black p-4">
                    <FieldLabel>Genre</FieldLabel>
                    <SelectInput
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    >
                      <option value="">Select genre</option>
                      {GENRE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="bg-black p-4">
                    <FieldLabel>Start time</FieldLabel>
                    <TextInput
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="bg-black p-4">
                    <FieldLabel>End time</FieldLabel>
                    <TextInput
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Show name</FieldLabel>
                  <TextInput
                    type="text"
                    value={formData.showName}
                    onChange={(e) => setFormData({ ...formData, showName: e.target.value })}
                    required
                    placeholder="The Morning Show"
                  />
                </div>

                <div>
                  <FieldLabel>Resident DJ</FieldLabel>
                  <SelectInput
                    value={formData.djId}
                    onChange={(e) => setFormData({ ...formData, djId: e.target.value })}
                  >
                    <option value="">TBD / Guest DJ</option>
                    {djs.map((dj) => (
                      <option key={dj.id} value={dj.id}>
                        {dj.name} {dj.isResident && '(Resident)'}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <TextArea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Show description..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={isSaving} className="basefm-button-primary disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500">
                    {isSaving ? 'Saving...' : editingSlot ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={resetForm} className="basefm-button-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-black p-6 sm:p-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Programming notes</div>
              <div className="grid gap-px bg-zinc-900">
                {[
                  ['Grid discipline', 'Use tight start and end times so the station transitions cleanly between shows.'],
                  ['DJ assignment', 'Attach a DJ when known, but leave guest slots flexible when the lineup is still moving.'],
                  ['Genre signal', 'Keep the genre metadata accurate so the schedule page stays useful.'],
                  ['Edits', 'Update or delete stale slots quickly so the listener view does not drift from the real week.'],
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

        {isLoading ? (
          <div className="grid gap-px bg-zinc-900">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-black" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="basefm-panel p-8 text-center">
            <p className="text-zinc-500">No schedule slots yet. Add the first show above.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {DAY_NAMES.map((day, dayIndex) => {
              const daySlots = slotsByDay[dayIndex] || [];
              if (daySlots.length === 0) return null;

              return (
                <div key={day}>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">{day}</div>
                  <div className="grid gap-px bg-zinc-900">
                    {daySlots
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <div key={slot.id} className="bg-black p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="text-zinc-500 text-sm w-24 flex-shrink-0">
                              {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-white font-medium">{slot.showName}</h4>
                              <p className="text-zinc-500 text-sm">
                                {slot.dj?.name || 'TBD'}
                                {slot.genre ? ` · ${slot.genre}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(slot)} className="basefm-button-secondary !px-4 !py-2">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(slot.id)} className="basefm-button-danger !px-4 !py-2">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
