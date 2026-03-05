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
    slug: 'strobe-soundsystem-launch',
    title: 'The STROBE Soundsystem Launch',
    subtitle: 'A new London-based audiovisual sound system & party series',
    date: '2026-02-14',
    displayDate: 'Saturday, 14 Feb 2026',
    venue: 'Hackney Bridge, London',
    imageUrl: null,
    isPast: true,
    headliners: ['A Guy Called Gerald', 'Saytek (Live)', 'Jah Scoop', 'Original Dubman'],
    tags: ['Rave', 'Dub', 'House', 'Techno', 'DNB'],
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
