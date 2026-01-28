'use client';

import { useState, useMemo } from 'react';
import { useStreams } from '@/hooks/useStreams';
import { ScheduleBlock, DaySelector } from '@/components/ScheduleBlock';

// Generate days of the week
function getDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({
      label: dayName,
      date: date.toISOString().split('T')[0],
    });
  }
  return days;
}

export default function SchedulePage() {
  const days = useMemo(() => getDays(), []);
  const [selectedDay, setSelectedDay] = useState(days[0].label);

  const { streams, isLoading } = useStreams({
    limit: 50,
  });

  // Filter and sort streams for selected day
  const scheduleItems = useMemo(() => {
    const selectedDayData = days.find(d => d.label === selectedDay);
    if (!selectedDayData) return [];

    const now = new Date();

    return streams
      .filter(stream => {
        if (!stream.scheduledStartTime) return selectedDay === 'Today';
        const streamDate = new Date(stream.scheduledStartTime).toISOString().split('T')[0];
        return streamDate === selectedDayData.date;
      })
      .map(stream => {
        const startTime = stream.scheduledStartTime ? new Date(stream.scheduledStartTime) : now;
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 2); // Assume 2 hour slots

        const isPast = endTime < now;
        const isCurrent = stream.status === 'LIVE' || (startTime <= now && endTime >= now);

        return {
          ...stream,
          startTimeFormatted: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTimeFormatted: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isPast,
          isCurrent,
          sortTime: startTime.getTime(),
        };
      })
      .sort((a, b) => a.sortTime - b.sortTime);
  }, [streams, selectedDay, days]);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#F5F5F5] text-2xl font-bold mb-2">Schedule</h1>
          <p className="text-[#888] text-sm">Upcoming shows and broadcasts</p>
        </div>

        {/* Day Selector */}
        <div className="mb-6">
          <DaySelector
            days={days.map(d => d.label)}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </div>

        {/* Schedule List */}
        <div className="space-y-2">
          {isLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="animate-pulse p-4 rounded-lg bg-[#1A1A1A]"
                >
                  <div className="schedule-grid">
                    <div>
                      <div className="h-4 bg-[#333] rounded w-12 mb-2" />
                      <div className="h-3 bg-[#333] rounded w-10" />
                    </div>
                    <div>
                      <div className="h-5 bg-[#333] rounded w-48 mb-2" />
                      <div className="h-4 bg-[#333] rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : scheduleItems.length > 0 ? (
            scheduleItems.map((item) => (
              <ScheduleBlock
                key={item.id}
                id={item.id}
                title={item.title}
                djName={item.djName}
                startTime={item.startTimeFormatted}
                endTime={item.endTimeFormatted}
                isLive={item.status === 'LIVE'}
                isTokenGated={item.isGated}
                isPast={item.isPast}
                isCurrent={item.isCurrent}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
                </svg>
              </div>
              <h3 className="text-[#F5F5F5] font-medium mb-2">No shows scheduled</h3>
              <p className="text-[#888] text-sm">
                {selectedDay === 'Today'
                  ? 'Check back later or view other days'
                  : 'No shows scheduled for this day'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
