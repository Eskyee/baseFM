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
  'Garage', 'Jungle', 'Breakbeat', 'Electro', 'Mixed', 'Other'
];

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
      fetchData();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Schedule Manager</h1>
          <p className="text-[#888] mb-8">Connect your admin wallet</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingSlot
        ? `/api/schedule/${editingSlot.id}`
        : '/api/schedule';

      const method = editingSlot ? 'PATCH' : 'POST';

      const selectedDJ = djs.find(d => d.id === formData.djId);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
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

      // Refresh slots
      const slotsRes = await fetch('/api/schedule');
      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setSlots(slotsData.slots || []);
      }

      // Reset form
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setSlots(slots.filter(s => s.id !== slotId));
      setSuccess('Slot deleted!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  // Group slots by day
  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, ScheduleSlot[]>);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            <h1 className="text-2xl font-bold text-[#F5F5F5]">Schedule Manager</h1>
            <p className="text-[#888] text-sm mt-1">Manage weekly programming</p>
          </div>
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
            className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            + Add Slot
          </button>
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

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-[#1A1A1A] rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">
              {editingSlot ? 'Edit Slot' : 'New Schedule Slot'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888] mb-2">Day</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] text-sm"
                  >
                    {DAY_NAMES.map((day, i) => (
                      <option key={day} value={i}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888] mb-2">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] text-sm"
                  >
                    <option value="">Select genre</option>
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888] mb-2">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888] mb-2">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">Show Name *</label>
                <input
                  type="text"
                  value={formData.showName}
                  onChange={(e) => setFormData({ ...formData, showName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] text-sm"
                  placeholder="The Morning Show"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">Resident DJ</label>
                <select
                  value={formData.djId}
                  onChange={(e) => setFormData({ ...formData, djId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] text-sm"
                >
                  <option value="">TBD / Guest DJ</option>
                  {djs.map((dj) => (
                    <option key={dj.id} value={dj.id}>
                      {dj.name} {dj.isResident && '(Resident)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#888] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-lg text-[#F5F5F5] text-sm resize-none"
                  placeholder="Show description..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingSlot ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSlot(null);
                  }}
                  className="px-6 py-2 bg-[#333] text-[#F5F5F5] rounded-lg hover:bg-[#444] transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Schedule List */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#1A1A1A] rounded-lg" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-16 bg-[#1A1A1A] rounded-lg">
            <p className="text-[#888]">No schedule slots yet. Add your first show!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {DAY_NAMES.map((day, dayIndex) => {
              const daySlots = slotsByDay[dayIndex] || [];
              if (daySlots.length === 0) return null;

              return (
                <div key={day}>
                  <h3 className="text-[#F5F5F5] font-semibold mb-3">{day}</h3>
                  <div className="space-y-2">
                    {daySlots
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className="bg-[#1A1A1A] rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-[#888] text-sm w-24">
                              {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                            </div>
                            <div>
                              <h4 className="text-[#F5F5F5] font-medium">{slot.showName}</h4>
                              <p className="text-[#888] text-sm">
                                {slot.dj?.name || 'TBD'}
                                {slot.genre && ` · ${slot.genre}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(slot)}
                              className="px-3 py-1.5 bg-[#333] text-[#F5F5F5] rounded text-sm hover:bg-[#444]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded text-sm hover:bg-red-600/30"
                            >
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
      </div>
    </div>
  );
}
