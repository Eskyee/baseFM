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
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#F5F5F5]">Schedule</h1>
          <p className="text-[#888] text-xs mt-0.5">Weekly programming</p>
        </div>

        {/* Day Selector - Pill style */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 hide-scrollbar">
          {DAY_NAMES.map((day, index) => {
            const isToday = index === currentDay;
            const isSelected = index === selectedDay;
            const hasSlots = slotsByDay[index]?.length > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 min-w-[44px] py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-[#1A1A1A] text-[#888]'
                }`}
              >
                <span className="block">{DAY_NAMES_SHORT[index]}</span>
                {isToday && (
                  <span className={`block text-[9px] mt-0.5 ${isSelected ? 'text-blue-200' : 'text-[#666]'}`}>
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
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-[#1A1A1A] rounded-2xl p-3">
                <div className="flex gap-3">
                  <div className="w-14 text-center">
                    <div className="h-5 bg-[#333] rounded mb-1" />
                    <div className="h-3 bg-[#333] rounded" />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-[#333] rounded w-32 mb-1.5" />
                    <div className="h-3 bg-[#333] rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedSlots.length > 0 ? (
          <div className="space-y-2">
            {selectedSlots.map((slot) => {
              const live = isSlotLive(slot);
              const past = isSlotPast(slot);

              return (
                <div
                  key={slot.id}
                  className={`bg-[#1A1A1A] rounded-2xl p-3 transition-all active:scale-[0.98] ${
                    live
                      ? 'ring-2 ring-red-500 bg-red-500/10'
                      : past
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Time */}
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className={`text-sm font-bold ${live ? 'text-red-500' : 'text-[#F5F5F5]'}`}>
                        {slot.startTime.slice(0, 5)}
                      </div>
                      <div className="text-[10px] text-[#666]">
                        {slot.endTime.slice(0, 5)}
                      </div>
                      {live && (
                        <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded">
                          <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>

                    {/* Show Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm ${past ? 'text-[#888]' : 'text-[#F5F5F5]'} truncate`}>
                        {slot.showName}
                      </h3>

                      <div className="flex items-center gap-2 mt-0.5">
                        {slot.dj ? (
                          <span className="text-[#888] text-xs truncate">
                            {slot.dj.name}
                            {slot.dj.isResident && (
                              <span className="ml-1 text-purple-400">•</span>
                            )}
                          </span>
                        ) : slot.djWalletAddress ? (
                          <span className="text-[#888] text-xs">Guest DJ</span>
                        ) : null}

                        {slot.genre && (
                          <span className="px-1.5 py-0.5 bg-[#0A0A0A] text-[#666] text-[10px] rounded flex-shrink-0">
                            {slot.genre}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* DJ Avatar */}
                    {slot.dj && (
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0A0A0A] flex-shrink-0">
                        <Image
                          src={slot.dj.avatarUrl || DEFAULT_AVATAR}
                          alt={slot.dj.name}
                          width={40}
                          height={40}
                          className={slot.dj.avatarUrl ? 'object-cover' : 'object-contain p-1.5'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
              </svg>
            </div>
            <h2 className="text-[#F5F5F5] text-base font-bold mb-1">No Shows</h2>
            <p className="text-[#888] text-xs">Check other days</p>
          </div>
        )}

        {/* Legend */}
        {selectedSlots.length > 0 && (
          <p className="text-center text-[#666] text-[10px] mt-4">
            Local time · Weekly recurring
          </p>
        )}
      </div>
    </div>
  );
}
