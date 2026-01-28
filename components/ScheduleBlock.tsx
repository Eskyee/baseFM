'use client';

import Link from 'next/link';

interface ScheduleBlockProps {
  id: string;
  title: string;
  djName: string;
  startTime: string;
  endTime: string;
  isLive?: boolean;
  isTokenGated?: boolean;
  isPast?: boolean;
  isCurrent?: boolean;
}

export function ScheduleBlock({
  id,
  title,
  djName,
  startTime,
  endTime,
  isLive = false,
  isTokenGated = false,
  isPast = false,
  isCurrent = false,
}: ScheduleBlockProps) {
  return (
    <Link
      href={`/stream/${id}`}
      className={`time-slot block p-4 rounded-lg transition-subtle hover:bg-[#1A1A1A] ${
        isCurrent ? 'active' : ''
      } ${isPast ? 'past' : ''}`}
    >
      <div className="schedule-grid">
        {/* Time Column */}
        <div className="text-[#888] text-sm">
          <div>{startTime}</div>
          <div className="text-xs text-[#666]">{endTime}</div>
        </div>

        {/* Content Column */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[#F5F5F5] font-medium truncate">{title}</h3>
            {isLive && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded flex-shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Live
              </span>
            )}
            {isTokenGated && (
              <span className="px-1.5 py-0.5 bg-[#F59E0B] text-black text-[10px] font-bold uppercase rounded flex-shrink-0">
                Token
              </span>
            )}
          </div>
          <p className="text-[#888] text-sm truncate">{djName}</p>
        </div>
      </div>
    </Link>
  );
}

// Schedule Day Selector component
interface DaySelectorProps {
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
}

export function DaySelector({ days, selectedDay, onSelectDay }: DaySelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-2">
      {days.map((day) => (
        <button
          key={day}
          onClick={() => onSelectDay(day)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedDay === day
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5]'
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
}
