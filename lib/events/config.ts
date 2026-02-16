export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  displayDate: string;
  venue: string;
  imageUrl: string | null;
  isPast: boolean;
  headliners: string[];
  tags: string[];
}

// Static events data - add new events here
export const EVENTS: Event[] = [
  {
    id: '1',
    slug: 'strobe-soundsystem',
    title: 'STROBE SOUNDSYSTEM',
    subtitle: 'Dub to Live Techno & Drum & Bass',
    date: '2025-02-01',
    displayDate: 'February 2025',
    venue: '360 Warehouse',
    imageUrl: null,
    isPast: true,
    headliners: ['SAYTEK LIVE', 'JAH SCOOP', 'ORIGINAL DUBMAN'],
    tags: ['Launch Event', '16 Stacks'],
  },
];

// Helper functions
export function getUpcomingEvents(): Event[] {
  return EVENTS.filter((e) => !e.isPast).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function getPastEvents(): Event[] {
  return EVENTS.filter((e) => e.isPast).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getNextUpcomingEvent(): Event | null {
  const upcoming = getUpcomingEvents();
  return upcoming[0] || null;
}

export function hasUpcomingEvents(): boolean {
  return EVENTS.some((e) => !e.isPast);
}

export function hasAnyEvents(): boolean {
  return EVENTS.length > 0;
}
