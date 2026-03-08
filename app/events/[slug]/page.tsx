'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types/event';
import { TicketPurchase } from '@/components/TicketPurchase';
import { EVENTS } from '@/lib/events/config';
import { EventBreadcrumb } from '@/components/Breadcrumb';
import { useToast } from '@/components/ui/Toast';

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadEvent() {
      // First check static config
      const staticEvent = EVENTS.find(e => e.slug === slug);
      if (staticEvent) {
        // Convert to Event format
        const eventData: Event = {
          id: staticEvent.id,
          name: staticEvent.title,
          description: staticEvent.subtitle,
          eventType: 'physical',
          startTime: Math.floor(new Date(staticEvent.date).getTime() / 1000),
          endTime: Math.floor(new Date(staticEvent.date).getTime() / 1000) + 43200,
          maxSupply: 0,
          minted: 0,
          nftType: 'ERC721',
          status: staticEvent.isPast ? 'ended' : 'active',
          location: staticEvent.venue,
          tags: staticEvent.tags,
          headliners: staticEvent.headliners,
        };
        setEvent(eventData);
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from API
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

    loadEvent();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="h-64 skeleton" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 skeleton rounded-lg w-3/4 mb-4" />
          <div className="h-4 skeleton rounded w-1/2 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="h-24 skeleton rounded-xl" />
            <div className="h-24 skeleton rounded-xl" />
          </div>
          <div className="h-32 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">{error || 'Not Found'}</h1>
          <Link
            href="/events"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero/Cover Image */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-purple-900/60 via-black to-black">
        {event.coverImageUrl || event.imageUrl ? (
          <Image
            src={event.coverImageUrl || event.imageUrl!}
            alt={event.title ?? event.name}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {event.isPast ? (
            <span className="px-3 py-1.5 bg-[#2C2C2E] text-[#8E8E93] text-sm font-medium rounded-full">
              Past Event
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-white text-black text-sm font-bold rounded-full">
              Upcoming
            </span>
          )}
        </div>

      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <EventBreadcrumb eventName={event.title ?? event.name} />
        </div>
        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{event.title}</h1>
          {event.subtitle && (
            <p className="text-[#888] text-lg">{event.subtitle}</p>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Date & Time */}
          <div className="bg-[#1A1A1A] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[#888] text-xs">Date</p>
                <p className="text-[#F5F5F5] font-medium">{event.displayDate}</p>
              </div>
            </div>
            {(event.startTime || event.endTime) && (
              <p className="text-[#666] text-sm ml-[52px]">
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="bg-[#1A1A1A] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[#888] text-xs">Location</p>
                <p className="text-[#F5F5F5] font-medium">{event.venue}</p>
              </div>
            </div>
            {(event.address || event.city) && (
              <p className="text-[#666] text-sm ml-[52px]">
                {event.address && <span>{event.address}<br /></span>}
                {event.city && event.country ? `${event.city}, ${event.country}` : event.city || event.country}
              </p>
            )}
          </div>
        </div>

        {/* Onchain Ticket Purchase */}
        {!event.isPast && event.id && (
          <div className="mb-8">
            <TicketPurchase eventId={event.id} eventTitle={event.title ?? event.name} />
          </div>
        )}

        {/* External Ticket Link (fallback if no onchain tickets) */}
        {event.ticketUrl && !event.isPast && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-[#1A1A1A] text-[#F5F5F5] rounded-xl font-medium text-lg mb-8 hover:bg-[#222] transition-colors border border-[#333]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {event.ticketPrice ? `External Tickets - ${event.ticketPrice}` : 'External Tickets'}
          </a>
        )}

        {/* Description */}
        {event.description && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">About</h2>
            <div className="bg-[#1A1A1A] rounded-xl p-5">
              <p className="text-[#888] whitespace-pre-wrap">{event.description}</p>
            </div>
          </section>
        )}

        {/* Lineup */}
        {event.headliners && event.headliners.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Lineup</h2>
            <div className="bg-[#1A1A1A] rounded-xl p-5">
              <div className="space-y-3">
                {event.headliners.map((artist, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{artist.charAt(0)}</span>
                    </div>
                    <span className="text-[#F5F5F5] font-medium">{artist}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Genres */}
        {event.genres && event.genres.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {event.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-4 py-2 bg-[#1A1A1A] text-[#888] rounded-lg text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Promoter */}
        {event.promoter && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Presented by</h2>
            <Link
              href={`/collectives/${event.promoter.slug}`}
              className="flex items-center gap-4 bg-[#1A1A1A] rounded-xl p-5 hover:bg-[#222] transition-colors"
            >
              <div className="w-14 h-14 rounded-lg bg-[#0A0A0A] flex items-center justify-center overflow-hidden flex-shrink-0">
                {event.promoter.logoUrl ? (
                  <Image
                    src={event.promoter.logoUrl}
                    alt={event.promoter.name}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/logo.png"
                    alt={event.promoter.name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[#F5F5F5] font-medium">{event.promoter.name}</span>
                  {event.promoter.isVerified && (
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </div>
                <p className="text-[#666] text-sm">
                  {event.promoter.totalEvents} events
                  {event.promoter.city && ` · ${event.promoter.city}`}
                </p>
              </div>
              <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </section>
        )}

        {/* Share */}
        <div className="text-center py-8 border-t border-[#1A1A1A]">
          <p className="text-[#666] text-sm mb-3">Share this event</p>
          <button
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: event.title,
                    text: event.subtitle || `Check out ${event.title}`,
                    url: window.location.href,
                  });
                  addToast('Shared successfully', 'success');
                } catch {
                  // User cancelled share
                }
              } else {
                await navigator.clipboard.writeText(window.location.href);
                addToast('Link copied to clipboard', 'success');
              }
            }}
            className="px-6 py-2 bg-[#1A1A1A] text-[#888] rounded-full text-sm hover:bg-[#222] hover:text-[#F5F5F5] transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
