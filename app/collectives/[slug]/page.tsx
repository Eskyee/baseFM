'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Promoter, Event, PromoterType } from '@/types/event';

const TYPE_LABELS: Record<PromoterType, string> = {
  promoter: 'Promoter',
  collective: 'Collective',
  venue: 'Venue',
  label: 'Label',
  artist: 'Artist',
  organization: 'Organization',
};

const DEFAULT_LOGO = '/logo.png';

export default function CollectiveProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [promoter, setPromoter] = useState<Promoter | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPromoter() {
      try {
        const res = await fetch(`/api/promoters/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Collective not found');
          } else {
            setError('Failed to load profile');
          }
          return;
        }

        const data = await res.json();
        setPromoter(data.promoter);
        setEvents(data.events || []);
      } catch (err) {
        console.error('Failed to load promoter:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadPromoter();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="h-48 bg-[#1A1A1A] animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 -mt-16">
          <div className="w-32 h-32 bg-[#333] rounded-xl animate-pulse" />
          <div className="h-8 bg-[#1A1A1A] rounded w-48 mt-4 animate-pulse" />
          <div className="h-4 bg-[#1A1A1A] rounded w-32 mt-2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !promoter) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">{error || 'Not Found'}</h1>
          <Link
            href="/collectives"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Back to Collectives
          </Link>
        </div>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => !e.isPast);
  const pastEvents = events.filter(e => e.isPast);

  return (
    <div className="min-h-screen pb-20">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-purple-900/60 via-black to-black">
        {promoter.coverImageUrl ? (
          <Image
            src={promoter.coverImageUrl}
            alt={promoter.name}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-6">
          <div className="flex items-end gap-4">
            {/* Logo */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-[#1A1A1A] border-4 border-black overflow-hidden flex-shrink-0">
              <Image
                src={promoter.logoUrl || DEFAULT_LOGO}
                alt={promoter.name}
                width={128}
                height={128}
                className={promoter.logoUrl ? 'object-cover w-full h-full' : 'object-contain p-4'}
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] truncate">
                  {promoter.name}
                </h1>
                {promoter.isVerified && (
                  <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-2 text-[#888]">
                <span className="px-2 py-0.5 bg-[#1A1A1A] rounded text-xs">
                  {TYPE_LABELS[promoter.type]}
                </span>
                {promoter.city && (
                  <span className="text-sm">
                    {promoter.city}{promoter.country && `, ${promoter.country}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {promoter.bio && (
          <p className="text-[#888] text-sm sm:text-base mb-6">{promoter.bio}</p>
        )}

        {/* Genres */}
        {promoter.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {promoter.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          {promoter.websiteUrl && (
            <a
              href={promoter.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-lg text-[#888] hover:text-[#F5F5F5] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Website
            </a>
          )}
          {promoter.instagramUrl && (
            <a
              href={promoter.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-lg text-[#888] hover:text-[#F5F5F5] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
            </a>
          )}
          {promoter.twitterUrl && (
            <a
              href={promoter.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-lg text-[#888] hover:text-[#F5F5F5] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X / Twitter
            </a>
          )}
          {promoter.email && (
            <a
              href={`mailto:${promoter.email}`}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-lg text-[#888] hover:text-[#F5F5F5] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">{promoter.totalEvents}</div>
            <div className="text-[#888] text-xs">Total Events</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">{upcomingEvents.length}</div>
            <div className="text-[#888] text-xs">Upcoming</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">{pastEvents.length}</div>
            <div className="text-[#888] text-xs">Past Events</div>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Upcoming Events
            </h2>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block bg-[#1A1A1A] rounded-lg p-4 hover:bg-[#222] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[#F5F5F5] font-medium">{event.title}</h3>
                      <p className="text-[#888] text-sm">
                        {event.displayDate} · {event.venue}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[#888] mb-4">Past Events</h2>
            <div className="space-y-3">
              {pastEvents.slice(0, 5).map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="block bg-[#1A1A1A] rounded-lg p-4 hover:bg-[#222] transition-colors opacity-60 hover:opacity-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[#F5F5F5] font-medium">{event.title}</h3>
                      <p className="text-[#888] text-sm">
                        {event.displayDate} · {event.venue}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
              {pastEvents.length > 5 && (
                <p className="text-[#666] text-sm text-center pt-2">
                  +{pastEvents.length - 5} more past events
                </p>
              )}
            </div>
          </section>
        )}

        {/* No Events */}
        {events.length === 0 && (
          <div className="text-center py-12 bg-[#1A1A1A] rounded-xl">
            <p className="text-[#888]">No events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
