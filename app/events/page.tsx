'use client';

import Link from 'next/link';
import { EVENTS, getPastEvents } from '@/lib/events/config';

export default function EventsPage() {
  const upcoming = EVENTS.filter((event) => !event.isPast);
  const past = getPastEvents();

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Events</span>
            <span className="basefm-kicker text-zinc-500">Culture in real space</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Shows and gatherings.
              <br />
              <span className="text-zinc-700">The station in public.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              baseFM is not just a stream page. Use events to track real-world sessions, cultural drops, and the physical side of the station.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/events/submit" className="basefm-button-primary">
              Submit Event
            </Link>
            <Link href="/" className="basefm-button-secondary">
              Back Home
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20 space-y-12">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Upcoming</div>
            {upcoming.length === 0 ? (
              <div className="basefm-panel p-8 text-center">
                <p className="text-sm text-zinc-400">No upcoming events right now.</p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {upcoming.map((event) => (
                  <Link key={event.id} href={`/events/${event.slug}`} className="basefm-panel hover:bg-zinc-950 transition-colors">
                    <div className="p-6">
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span className="basefm-kicker text-blue-500">In person</span>
                        {event.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] uppercase tracking-widest text-zinc-600">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-2xl font-bold uppercase tracking-tight text-white mb-2">{event.title}</h2>
                      {event.subtitle ? (
                        <p className="text-sm text-zinc-400 leading-relaxed mb-5">{event.subtitle}</p>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-2 text-sm text-zinc-400 mb-5">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Date</div>
                          <div>{event.displayDate}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Venue</div>
                          <div>{event.venue}</div>
                        </div>
                      </div>

                      {event.headliners && event.headliners.length > 0 ? (
                        <p className="text-xs text-zinc-500 mb-5">{event.headliners.join(' · ')}</p>
                      ) : null}

                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Open event →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {past.length > 0 ? (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Past</div>
              <div className="grid gap-px bg-zinc-900">
                {past.map((event) => (
                  <Link key={event.id} href={`/events/${event.slug}`} className="bg-black p-5 hover:bg-zinc-950 transition-colors">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-1">{event.title}</h3>
                        <p className="text-sm text-zinc-500">{event.displayDate} · {event.venue}</p>
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600">Ended</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
