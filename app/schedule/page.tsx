'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ScheduleSlot, DAY_NAMES, DAY_NAMES_SHORT } from '@/types/schedule';

const DEFAULT_AVATAR = '/logo.png';

export default function SchedulePage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch('/api/schedule');
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots || []);
        }
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  // Group slots by day
  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, ScheduleSlot[]>);

  // Get current time info
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);

  // Check if a slot is currently live
  const isSlotLive = (slot: ScheduleSlot) => {
    return (
      slot.dayOfWeek === currentDay &&
      slot.startTime <= currentTime &&
      slot.endTime > currentTime
    );
  };

  // Check if a slot is in the past (today only)
  const isSlotPast = (slot: ScheduleSlot) => {
    if (slot.dayOfWeek !== currentDay) return false;
    return slot.endTime <= currentTime;
  };

  const selectedSlots = slotsByDay[selectedDay] || [];

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">Schedule</h1>
          <p className="text-[#888] text-sm mt-1">Weekly programming on baseFM</p>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
          {DAY_NAMES.map((day, index) => {
            const isToday = index === currentDay;
            const isSelected = index === selectedDay;
            const hasSlots = slotsByDay[index]?.length > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5] hover:bg-[#222]'
                }`}
              >
                <span className="block">{DAY_NAMES_SHORT[index]}</span>
                {isToday && (
                  <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-blue-200' : 'text-[#666]'}`}>
                    Today
                  </span>
                )}
                {hasSlots && !isToday && (
                  <span className={`block w-1 h-1 rounded-full mx-auto mt-1 ${isSelected ? 'bg-white' : 'bg-[#3B82F6]'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Schedule Grid */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-[#1A1A1A] rounded-xl p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-[#333] rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-[#333] rounded w-48 mb-2" />
                    <div className="h-4 bg-[#333] rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedSlots.length > 0 ? (
          <div className="space-y-3">
            {selectedSlots.map((slot) => {
              const live = isSlotLive(slot);
              const past = isSlotPast(slot);

              return (
                <div
                  key={slot.id}
                  className={`bg-[#1A1A1A] rounded-xl p-4 transition-all ${
                    live
                      ? 'ring-2 ring-red-500 bg-red-500/10'
                      : past
                      ? 'opacity-50'
                      : 'hover:bg-[#222]'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Time */}
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className={`text-lg font-bold ${live ? 'text-red-500' : 'text-[#F5F5F5]'}`}>
                        {slot.startTime.slice(0, 5)}
                      </div>
                      <div className="text-xs text-[#666]">
                        {slot.endTime.slice(0, 5)}
                      </div>
                      {live && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>

                    {/* Show Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className={`font-semibold text-lg ${past ? 'text-[#888]' : 'text-[#F5F5F5]'}`}>
                            {slot.showName}
                          </h3>

                          {slot.dj ? (
                            <Link
                              href={`/djs/${slot.dj.slug}`}
                              className="text-[#888] text-sm hover:text-[#3B82F6] transition-colors"
                            >
                              with {slot.dj.name}
                              {slot.dj.isResident && (
                                <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded">
                                  Resident
                                </span>
                              )}
                            </Link>
                          ) : slot.djWalletAddress ? (
                            <span className="text-[#888] text-sm">
                              with Guest DJ
                            </span>
                          ) : null}

                          {slot.genre && (
                            <div className="mt-2">
                              <span className="px-2 py-1 bg-[#0A0A0A] text-[#888] text-xs rounded">
                                {slot.genre}
                              </span>
                            </div>
                          )}

                          {slot.description && (
                            <p className="text-[#666] text-sm mt-2 line-clamp-2">
                              {slot.description}
                            </p>
                          )}
                        </div>

                        {/* DJ Avatar */}
                        {slot.dj && (
                          <Link
                            href={`/djs/${slot.dj.slug}`}
                            className="flex-shrink-0"
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0A0A0A]">
                              <Image
                                src={slot.dj.avatarUrl || DEFAULT_AVATAR}
                                alt={slot.dj.name}
                                width={48}
                                height={48}
                                className={slot.dj.avatarUrl ? 'object-cover' : 'object-contain p-2'}
                              />
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
              </svg>
            </div>
            <h2 className="text-[#F5F5F5] text-xl font-bold mb-2">No Shows on {DAY_NAMES[selectedDay]}</h2>
            <p className="text-[#888] text-sm">Check back later or browse other days</p>
          </div>
        )}

        {/* Legend */}
        {selectedSlots.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#1A1A1A]">
            <p className="text-[#666] text-xs">
              All times shown in your local timezone. Shows are recurring weekly unless otherwise noted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
