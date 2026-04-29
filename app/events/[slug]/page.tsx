'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types/event';
import { TicketPurchase } from '@/components/TicketPurchase';
import { EVENTS } from '@/lib/events/config';

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvent() {
      const staticEvent = EVENTS.find((item) => item.slug === slug);
      if (staticEvent) {
        const eventData: Event = {
          id: staticEvent.id,
          name: staticEvent.title,
          title: staticEvent.title,
          subtitle: staticEvent.subtitle,
          description: staticEvent.subtitle,
          eventType: 'physical',
          startTime: Math.floor(new Date(staticEvent.date).getTime() / 1000),
          endTime: Math.floor(new Date(staticEvent.date).getTime() / 1000) + 43200,
          maxSupply: 0,
          minted: 0,
          nftType: 'ERC721',
          status: staticEvent.isPast ? 'ended' : 'active',
          location: staticEvent.venue,
          venue: staticEvent.venue,
          displayDate: staticEvent.displayDate,
          tags: staticEvent.tags,
          headliners: staticEvent.headliners,
          isPast: staticEvent.isPast,
          imageUrl: staticEvent.imageUrl ?? undefined,
        };
        setEvent(eventData);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/events/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Event not found');
          } else {
            setError('Failed to load event');
          }
          return;
        }

        const data = await res.json();
        setEvent(data.event);
      } catch (err) {
        console.error('Failed to load event:', err);
        setError('Failed to load event');
      } finally {
        setIsLoading(false);
      }
    }

    void loadEvent();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-black p-6 sm:p-8 animate-pulse">
              <div className="h-4 w-28 bg-zinc-900 mb-4" />
              <div className="aspect-[16/9] bg-zinc-900 mb-6" />
              <div className="h-8 w-2/3 bg-zinc-900 mb-3" />
              <div className="h-4 w-1/2 bg-zinc-900 mb-8" />
              <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
                <div className="h-24 bg-black" />
                <div className="h-24 bg-black" />
              </div>
            </div>
            <div className="bg-black p-6 sm:p-8 animate-pulse">
              <div className="h-4 w-24 bg-zinc-900 mb-4" />
              <div className="space-y-4">
                <div className="h-20 bg-zinc-900" />
                <div className="h-20 bg-zinc-900" />
                <div className="h-20 bg-zinc-900" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="basefm-panel p-8 text-center max-w-xl">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Event</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{error || 'Not found'}</h1>
            <p className="text-sm text-zinc-500 mb-6">This event does not exist or cannot be loaded right now.</p>
            <Link href="/events" className="basefm-button-primary">
              Back to Events
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const title = event.title ?? event.name;
  const subtitle = event.subtitle;
  const coverImage = event.coverImageUrl || event.imageUrl;
  const venue = event.venue || event.location;
  const dateLine =
    event.displayDate ||
    (typeof event.startTime === 'number' ? new Date(event.startTime * 1000).toLocaleDateString() : null);
  const timeLine =
    event.startTime && event.endTime
      ? `${typeof event.startTime === 'number' ? new Date(event.startTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : event.startTime} - ${
          typeof event.endTime === 'number' ? new Date(event.endTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : event.endTime
        }`
      : null;

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8 mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Event</span>
            <span className="basefm-kicker text-zinc-500">{event.isPast ? 'Archive' : 'Upcoming'}</span>
            {venue ? <span className="basefm-kicker text-zinc-500">{venue}</span> : null}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              {title}
              <br />
              <span className="text-zinc-700">
                {event.isPast ? 'Past event. Still part of the station history.' : 'Culture in real space.'}
              </span>
            </h1>
            {subtitle ? (
              <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-black p-6 sm:p-8">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Event cover</div>
            <div className="relative aspect-[16/9] overflow-hidden border border-zinc-900 bg-zinc-950 mb-6">
              {coverImage ? (
                <>
                  <Image src={coverImage} alt={title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className={`basefm-kicker ${event.isPast ? 'text-zinc-500' : 'text-white border-white'}`}>
                  {event.isPast ? 'Past Event' : 'Upcoming'}
                </span>
              </div>

              <Link href="/events" className="absolute top-3 right-3 basefm-button-secondary !px-4 !py-2">
                Back
              </Link>
            </div>

            {event.tags && event.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags.map((tag) => (
                  <span key={tag} className="basefm-kicker text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 mb-6">
              <div className="bg-black p-5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Date</div>
                <div className="text-lg font-bold text-white">{dateLine || 'TBA'}</div>
                {timeLine ? <p className="text-xs text-zinc-500 mt-2">{timeLine}</p> : null}
              </div>
              <div className="bg-black p-5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Location</div>
                <div className="text-lg font-bold text-white">{venue || 'TBA'}</div>
                {event.address || event.city || event.country ? (
                  <p className="text-xs text-zinc-500 mt-2">
                    {event.address ? `${event.address} · ` : ''}
                    {event.city && event.country ? `${event.city}, ${event.country}` : event.city || event.country}
                  </p>
                ) : null}
              </div>
            </div>

            {event.description ? (
              <div className="basefm-panel p-5 mb-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">About</div>
                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            ) : null}

            {event.headliners && event.headliners.length > 0 ? (
              <div className="basefm-panel p-5 mb-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Lineup</div>
                <div className="grid gap-px bg-zinc-900">
                  {event.headliners.map((artist) => (
                    <div key={artist} className="bg-black px-4 py-3 flex items-center gap-3">
                      <div className="h-8 w-8 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                        {artist.charAt(0)}
                      </div>
                      <span className="text-sm text-white font-medium">{artist}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {event.genres && event.genres.length > 0 ? (
              <div className="basefm-panel p-5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Genres</div>
                <div className="flex flex-wrap gap-2">
                  {event.genres.map((genre) => (
                    <span key={genre} className="basefm-kicker text-zinc-400">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-black p-6 sm:p-8">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Attend</div>

            {!event.isPast && event.id ? (
              <div className="mb-6">
                <TicketPurchase eventId={event.id} eventTitle={title} />
              </div>
            ) : (
              <div className="basefm-panel p-5 mb-6">
                <div className="text-sm font-bold uppercase tracking-wider text-white mb-2">Past event</div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Ticketing is closed because this event has already happened.
                </p>
              </div>
            )}

            {event.ticketUrl && !event.isPast ? (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="basefm-button-secondary w-full mb-6"
              >
                {event.ticketPrice ? `External Tickets ${event.ticketPrice}` : 'External Tickets'}
              </a>
            ) : null}

            {event.promoter ? (
              <div className="basefm-panel p-5 mb-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Presented by</div>
                <Link href={`/collectives/${event.promoter.slug}`} className="block hover:bg-zinc-950 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 border border-zinc-900 bg-black flex items-center justify-center overflow-hidden flex-shrink-0">
                      {event.promoter.logoUrl ? (
                        <Image src={event.promoter.logoUrl} alt={event.promoter.name} width={56} height={56} className="object-cover" />
                      ) : (
                        <Image src="/logo.png" alt={event.promoter.name} width={28} height={28} className="object-contain opacity-70" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium truncate">{event.promoter.name}</span>
                        {event.promoter.isVerified ? <span className="basefm-kicker text-blue-500">Verified</span> : null}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {event.promoter.totalEvents} events
                        {event.promoter.city ? ` · ${event.promoter.city}` : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ) : null}

            <div className="basefm-panel p-5">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Share</div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                Share the event link directly or copy it to send around the group chat.
              </p>
              <button
                onClick={() => {
                  if (navigator.share) {
                    void navigator.share({
                      title,
                      text: subtitle || `Check out ${title}`,
                      url: window.location.href,
                    });
                  } else {
                    void navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="basefm-button-secondary w-full"
              >
                Copy Event Link
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
