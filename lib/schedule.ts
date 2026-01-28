import { Stream } from '@/types/stream';

export interface ScheduleSlot {
  id: string;
  time: string;
  endTime: string;
  show: string;
  dj: string;
  isLive: boolean;
  isTokenGated: boolean;
  streamId?: string;
}

export interface DaySchedule {
  date: string;
  dayName: string;
  slots: ScheduleSlot[];
}

/**
 * Get schedule for a specific day
 */
export async function getSchedule(date?: string): Promise<ScheduleSlot[]> {
  try {
    const params = new URLSearchParams();
    if (date) params.set('date', date);

    const response = await fetch(`/api/streams?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch schedule');

    const data = await response.json();
    const streams: Stream[] = data.streams || [];

    return streams.map((stream) => ({
      id: stream.id,
      time: stream.scheduledStartTime
        ? new Date(stream.scheduledStartTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'TBD',
      endTime: stream.scheduledStartTime
        ? new Date(
            new Date(stream.scheduledStartTime).getTime() + 2 * 60 * 60 * 1000
          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'TBD',
      show: stream.title,
      dj: stream.djName,
      isLive: stream.status === 'LIVE',
      isTokenGated: stream.isGated || false,
      streamId: stream.id,
    }));
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }
}

/**
 * Get schedule for multiple days (week view)
 */
export async function getWeekSchedule(): Promise<DaySchedule[]> {
  const days: DaySchedule[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateStr = date.toISOString().split('T')[0];
    const dayName =
      i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' });

    const slots = await getSchedule(dateStr);

    days.push({
      date: dateStr,
      dayName,
      slots,
    });
  }

  return days;
}

/**
 * Get the current live show
 */
export async function getCurrentShow(): Promise<ScheduleSlot | null> {
  try {
    const response = await fetch('/api/streams/live');
    if (!response.ok) throw new Error('Failed to fetch live streams');

    const data = await response.json();
    const streams: Stream[] = data.streams || [];

    if (streams.length === 0) return null;

    const liveStream = streams[0];
    return {
      id: liveStream.id,
      time: 'Now',
      endTime: '',
      show: liveStream.title,
      dj: liveStream.djName,
      isLive: true,
      isTokenGated: liveStream.isGated || false,
      streamId: liveStream.id,
    };
  } catch (error) {
    console.error('Error fetching current show:', error);
    return null;
  }
}

/**
 * Get upcoming shows (next N shows)
 */
export async function getUpcomingShows(limit = 5): Promise<ScheduleSlot[]> {
  try {
    const response = await fetch(`/api/streams?status=CREATED&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch upcoming shows');

    const data = await response.json();
    const streams: Stream[] = data.streams || [];

    return streams.map((stream) => ({
      id: stream.id,
      time: stream.scheduledStartTime
        ? new Date(stream.scheduledStartTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'TBD',
      endTime: '',
      show: stream.title,
      dj: stream.djName,
      isLive: false,
      isTokenGated: stream.isGated || false,
      streamId: stream.id,
    }));
  } catch (error) {
    console.error('Error fetching upcoming shows:', error);
    return [];
  }
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Check if a time slot is currently active
 */
export function isSlotActive(startTime: string, endTime: string): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  return now >= start && now <= end;
}

/**
 * Check if a time slot is in the past
 */
export function isSlotPast(endTime: string): boolean {
  const now = new Date();
  const end = new Date(endTime);
  return now > end;
}
