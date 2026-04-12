'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ScheduleSlot, DAY_NAMES, DAY_NAMES_SHORT } from '@/types/schedule';

function ScheduleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dayParam = searchParams.get('day');

  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getInitialDay = () => {
    if (dayParam !== null) {
      const parsed = parseInt(dayParam, 10);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 6) {
        return parsed;
      }
    }
    return new Date().getDay();
  };

  const [selectedDay, setSelectedDay] = useState(getInitialDay);

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
    if (day === new Date().getDay()) {
      router.push('/schedule', { scroll: false });
    } else {
      router.push(`/schedule?day=${day}`, { scroll: false });
    }
  };

  useEffect(() => {
    if (dayParam !== null) {
      const parsed = parseInt(dayParam, 10);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 6) {
        setSelectedDay(parsed);
      }
    }
  }, [dayParam]);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch('/api/schedule');
        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }
        const data = await response.json();
        setSlots(data.slots || []);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  const slotsByDay = slots.reduce((accumulator, slot) => {
    if (!accumulator[slot.dayOfWeek]) {
      accumulator[slot.dayOfWeek] = [];
    }
    accumulator[slot.dayOfWeek].push(slot);
    return accumulator;
  }, {} as Record<number, ScheduleSlot[]>);

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);

  const isSlotLive = (slot: ScheduleSlot) =>
    slot.dayOfWeek === currentDay &&
    slot.startTime <= currentTime &&
    slot.endTime > currentTime;

  const isSlotPast = (slot: ScheduleSlot) =>
    slot.dayOfWeek === currentDay && slot.endTime <= currentTime;

  const selectedSlots = slotsByDay[selectedDay] || [];

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Schedule</span>
            <span className="basefm-kicker text-zinc-500">Weekly programming</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Station schedule.
              <br />
              <span className="text-zinc-700">Weekly rhythm, local time.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              Use the weekly programming grid to see what is live now, what is coming up next, and which parts of the week carry the station.
            </p>
          </div>

          <div className="grid gap-px bg-zinc-900 sm:grid-cols-7">
            {DAY_NAMES.map((day, index) => {
              const isToday = index === currentDay;
              const isSelected = index === selectedDay;
              const hasSlots = Boolean(slotsByDay[index]?.length);

              return (
                <button
                  key={day}
                  onClick={() => handleDayChange(index)}
                  className={`bg-black px-4 py-4 text-left transition-colors ${
                    isSelected ? 'bg-zinc-950 border border-zinc-800' : 'hover:bg-zinc-950'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">{DAY_NAMES_SHORT[index]}</div>
                  {isToday ? <div className="mt-2 text-xs text-blue-500 uppercase tracking-widest">Today</div> : null}
                  {!isToday && hasSlots ? <div className="mt-2 h-2 w-2 bg-zinc-500" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          {isLoading ? (
            <div className="grid gap-px bg-zinc-900">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-black p-5 animate-pulse">
                  <div className="h-4 w-24 bg-zinc-900 mb-3" />
                  <div className="h-4 w-40 bg-zinc-900 mb-2" />
                  <div className="h-3 w-20 bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : selectedSlots.length > 0 ? (
            <div className="grid gap-px bg-zinc-900">
              {selectedSlots.map((slot) => {
                const live = isSlotLive(slot);
                const past = isSlotPast(slot);

                return (
                  <div
                    key={slot.id}
                    className={`bg-black p-5 ${past ? 'opacity-50' : ''} ${live ? 'border border-red-500/30 bg-red-500/5' : ''}`}
                  >
                    <div className="grid gap-4 md:grid-cols-[110px_1fr_auto] md:items-start">
                      <div>
                        <div className={`text-lg font-bold ${live ? 'text-red-400' : 'text-white'}`}>
                          {slot.startTime.slice(0, 5)}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                          Until {slot.endTime.slice(0, 5)}
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold uppercase tracking-tight text-white mb-2">{slot.showName}</h2>
                        <div className="flex items-center gap-2 flex-wrap text-sm text-zinc-400">
                          {slot.dj ? <span>{slot.dj.name}</span> : slot.djWalletAddress ? <span>Guest DJ</span> : null}
                          {slot.genre ? <span className="text-zinc-600">· {slot.genre}</span> : null}
                        </div>
                      </div>

                      <div className="flex items-center justify-start md:justify-end">
                        {live ? (
                          <span className="basefm-kicker text-red-400">Live</span>
                        ) : past ? (
                          <span className="text-[10px] uppercase tracking-widest text-zinc-600">Ended</span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Scheduled</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="basefm-panel p-8 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">No shows</div>
              <p className="text-sm text-zinc-400">Nothing is scheduled for this day yet.</p>
            </div>
          )}

          {selectedSlots.length > 0 ? (
            <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-zinc-600">
              Local time · weekly recurring
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function SchedulePageSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="animate-pulse space-y-4 max-w-4xl">
          <div className="h-6 w-32 bg-zinc-900" />
          <div className="h-16 w-96 bg-zinc-900" />
        </div>
      </section>
    </main>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<SchedulePageSkeleton />}>
      <ScheduleContent />
    </Suspense>
  );
}
