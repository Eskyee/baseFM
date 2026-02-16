'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  EVENTS,
  getUpcomingEvents,
  getPastEvents,
  type Event,
} from '@/lib/events/config';

const pastEvents = getPastEvents();
const upcomingEvents = getUpcomingEvents();

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="bg-[#1A1A1A] rounded-xl overflow-hidden group hover:bg-[#222] transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-[16/9]">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black to-black">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-sm font-medium">
            View Event
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {event.isPast ? (
            <span className="px-2.5 py-1 bg-[#2C2C2E] text-[#8E8E93] text-xs font-medium rounded-full">
              Past Event
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-white text-black text-xs font-bold rounded-full">
              Upcoming
            </span>
          )}
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {event.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-black/60 backdrop-blur text-white text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-[#F5F5F5] font-bold text-lg group-hover:text-white transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="text-[#8E8E93] text-sm mt-1 line-clamp-1">
          {event.subtitle}
        </p>

        <div className="flex items-center gap-4 mt-3 text-sm text-[#666]">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{event.displayDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Headliners preview */}
        {event.headliners.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#2C2C2E]">
            <p className="text-xs text-[#666] line-clamp-1">
              {event.headliners.join(' • ')}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-2">
            Events
          </h1>
          <p className="text-[#888]">
            baseFM community events and parties
          </p>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-lg font-bold text-white">Upcoming Events</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[#8E8E93] mb-6">Past Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {EVENTS.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#F5F5F5] mb-2">No events yet</h3>
            <p className="text-[#888] text-sm">
              Check back soon for upcoming events
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
