'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types/event';

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
        {event.tags && event.tags.length > 0 && (
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
        {event.subtitle && (
          <p className="text-[#8E8E93] text-sm mt-1 line-clamp-1">
            {event.subtitle}
          </p>
        )}

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

        {/* Promoter */}
        {event.promoter && (
          <div className="mt-3 pt-3 border-t border-[#2C2C2E]">
            <p className="text-xs text-purple-400">
              by {event.promoter.name}
              {event.promoter.isVerified && ' '}
            </p>
          </div>
        )}

        {/* Headliners preview */}
        {!event.promoter && event.headliners && event.headliners.length > 0 && (
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
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const [upcomingRes, pastRes] = await Promise.all([
          fetch('/api/events?upcoming=true'),
          fetch('/api/events?past=true'),
        ]);

        if (upcomingRes.ok) {
          const data = await upcomingRes.json();
          setUpcomingEvents(data.events || []);
        }

        if (pastRes.ok) {
          const data = await pastRes.json();
          setPastEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, []);

  const hasEvents = upcomingEvents.length > 0 || pastEvents.length > 0;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mb-2">
              Events
            </h1>
            <p className="text-[#888]">
              baseFM community events and parties
            </p>
          </div>
          <Link
            href="/events/submit"
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit Event
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-[#333]" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-[#333] rounded w-3/4" />
                  <div className="h-4 bg-[#333] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Events */}
        {!isLoading && upcomingEvents.length > 0 && (
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
        {!isLoading && pastEvents.length > 0 && (
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
        {!isLoading && !hasEvents && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#F5F5F5] mb-2">No events yet</h3>
            <p className="text-[#888] text-sm mb-6">
              Be the first to submit an event
            </p>
            <Link
              href="/events/submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all"
            >
              Submit Event
            </Link>
          </div>
        )}

        {/* Browse Collectives CTA */}
        {!isLoading && (
          <div className="mt-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-[#F5F5F5] font-bold text-lg mb-1">Discover Collectives</h3>
                <p className="text-[#888] text-sm">
                  Browse promoters, crews, venues, and labels in the community
                </p>
              </div>
              <Link
                href="/collectives"
                className="flex-shrink-0 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all active:scale-[0.98]"
              >
                Browse Collectives
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
