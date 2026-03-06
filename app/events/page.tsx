'use client';

import Link from 'next/link';
import { EVENTS, getPastEvents } from '@/lib/events/config';
import type { Event } from '@/lib/events/config';

// ============================================================
// Event Listing Page — public, no wallet required
//
// Shows upcoming and past events. Cultural platform feel.
// CTA: "View Event" (never "Mint" or "Buy Token")
// ============================================================

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function EventsPage() {
  const upcoming = EVENTS.filter((e) => !e.isPast);
  const past = getPastEvents();

  const isLoading = false;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-5 bg-[#1A1A1A] rounded w-32" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 bg-[#1A1A1A] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-10">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[#F5F5F5] text-xl font-bold">Events</h1>
            <p className="text-[#888] text-sm">Discover what&apos;s happening</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/events/submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-medium transition-all hover:opacity-90 active:scale-[0.97]"
            >
              + Submit Event
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-[#1A1A1A] text-[#F5F5F5] rounded-full text-sm font-medium transition-colors active:scale-[0.97]"
            >
              Home
            </Link>
          </div>
        </header>

        {/* Upcoming Events */}
        <section>
          <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-4">
            Upcoming
          </h2>

          {upcoming.length === 0 ? (
            <div className="rounded-2xl bg-[#1A1A1A] p-6 text-center">
              <p className="text-[#888] text-sm">
                No upcoming events right now. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block bg-[#1A1A1A] rounded-2xl overflow-hidden group active:scale-[0.98] transition-transform"
                >
                  <div className="p-5">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase rounded-full">
                        In Person
                      </span>
                      {event.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 bg-[#2C2C2E] text-[#888] text-[10px] font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-[#F5F5F5] font-bold text-lg leading-tight mb-1">
                      {event.title}
                    </h3>

                    {/* Subtitle */}
                    {event.subtitle && (
                      <p className="text-[#888] text-sm mb-3 line-clamp-2">
                        {event.subtitle}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-[#888]">
                      {/* Date */}
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {event.displayDate}
                      </span>

                      {/* Location */}
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.venue}
                      </span>
                    </div>

                    {/* Headliners */}
                    {event.headliners && event.headliners.length > 0 && (
                      <p className="text-[#666] text-xs mt-2">
                        {event.headliners.join(' · ')}
                      </p>
                    )}

                    {/* CTA */}
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-full text-sm font-semibold transition-all">
                        View Event
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        {past.length > 0 && (
          <section>
            <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-4">
              Past Events
            </h2>
            <div className="space-y-3">
              {past.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block bg-[#1A1A1A] rounded-2xl overflow-hidden opacity-70 active:scale-[0.98] transition-transform"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#2C2C2E] text-[#888] text-[10px] font-medium rounded-full">
                          Ended
                        </span>
                      </div>
                      <h3 className="text-[#F5F5F5] font-semibold text-base truncate">
                        {event.title}
                      </h3>
                      <p className="text-[#666] text-xs mt-1">
                        {event.displayDate} · {event.venue}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-[#666] flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
