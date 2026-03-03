'use client';

import { useState, useEffect } from 'react';
import { useLiveStreams, useStreams } from '@/hooks/useStreams';
import { useEvents } from '@/hooks/useEvents';
import { LiveShowCard } from '@/components/LiveShowCard';
import { ShareApp } from '@/components/ShareApp';
import { MoltxFeed } from '@/components/MoltxFeed';
import Link from 'next/link';
import {
  getNextUpcomingEvent,
  hasAnyEvents,
} from '@/lib/events/config';

interface DJOfTheDay {
  dj: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
    genres: string[];
    isVerified: boolean;
    totalShows: number;
  };
  reason: string;
}

export default function HomePage() {
  const { streams: liveStreams, isLoading: liveLoading } = useLiveStreams();
  const { streams: upcomingStreams, isLoading: upcomingLoading } = useStreams({
    status: ['CREATED', 'PREPARING'],
    limit: 10,
  });
  const [djOfTheDay, setDjOfTheDay] = useState<DJOfTheDay | null>(null);

  useEffect(() => {
    async function fetchDJOfTheDay() {
      try {
        const res = await fetch('/api/dj-of-the-day');
        if (res.ok) {
          const data = await res.json();
          if (data.djOfTheDay) {
            setDjOfTheDay(data.djOfTheDay);
          }
        }
      } catch (err) {
        // Silently fail - DJ of the day is optional
      }
    }
    fetchDJOfTheDay();
  }, []);

  const featuredStream = liveStreams[0];
  const otherLiveStreams = liveStreams.slice(1);
  const isLoading = liveLoading && upcomingLoading;
  const hasLive = liveStreams.length > 0;
  const hasUpcoming = upcomingStreams.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-5 bg-[#1A1A1A] rounded w-40" />
            <div className="aspect-[16/9] bg-[#1A1A1A] rounded-2xl" />
            <div className="h-5 bg-[#1A1A1A] rounded w-32" />
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-36 flex-shrink-0">
                  <div className="aspect-square bg-[#1A1A1A] rounded-lg" />
                  <div className="h-3 bg-[#1A1A1A] rounded w-28 mt-2" />
                </div>
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

        {/* Header — one line, not a wall of text */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[#F5F5F5] text-xl font-bold">baseFM</h1>
            <p className="text-[#888] text-sm">Onchain radio on Base</p>
          </div>
          <Link
            href="/events"
            className="px-4 py-2 bg-[#1A1A1A] text-[#F5F5F5] rounded-full text-sm font-medium hover:bg-[#222] transition-colors active:scale-[0.97]"
          >
            Events
          </Link>
        </header>

        {/* === LIVE SECTION === */}
        {hasLive && (
          <>
            {/* Featured live stream */}
            <section>
              <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live Now
              </h2>
              <LiveShowCard
                id={featuredStream.id}
                title={featuredStream.title}
                djName={featuredStream.djName}
                djWalletAddress={featuredStream.djWalletAddress}
                artwork={featuredStream.coverImageUrl}
                genre={featuredStream.genre}
                isLive={featuredStream.status === 'LIVE'}
                isTokenGated={featuredStream.isGated}
                muxPlaybackId={featuredStream.muxPlaybackId}
                hlsUrl={featuredStream.hlsPlaybackUrl}
                useGlobalPlayer
                variant="featured"
              />
            </section>

            {/* Additional live streams */}
            {otherLiveStreams.length > 0 && (
              <section>
                <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3">
                  Also Live
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {otherLiveStreams.map((stream) => (
                    <LiveShowCard
                      key={stream.id}
                      id={stream.id}
                      title={stream.title}
                      djName={stream.djName}
                      djWalletAddress={stream.djWalletAddress}
                      artwork={stream.coverImageUrl}
                      genre={stream.genre}
                      isLive
                      isTokenGated={stream.isGated}
                      muxPlaybackId={stream.muxPlaybackId}
                      hlsUrl={stream.hlsPlaybackUrl}
                      useGlobalPlayer
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* === NOTHING LIVE — guide users instead of empty state === */}
        {!hasLive && (
          <section>
            <div className="rounded-2xl bg-[#1A1A1A] p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <p className="text-[#F5F5F5] font-semibold mb-1">No one is live right now</p>
              <p className="text-[#888] text-sm mb-5">Check the schedule or explore DJs</p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/schedule"
                  className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-[#E5E5E5] transition-all active:scale-[0.97]"
                >
                  View Schedule
                </Link>
                <Link
                  href="/djs"
                  className="px-5 py-2.5 bg-[#2C2C2E] text-white rounded-full text-sm font-medium hover:bg-[#3C3C3E] transition-all active:scale-[0.97]"
                >
                  Browse DJs
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* === EVENT === */}
        {(() => {
          const nextEvent = getNextUpcomingEvent();
          const hasEvents = hasAnyEvents();

          // Show featured card for upcoming event
          if (nextEvent) {
            return (
              <section>
                <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Upcoming Event
                </h2>
                <Link
                  href={`/events/${nextEvent.slug}`}
                  className="block bg-gradient-to-r from-purple-900/40 to-black rounded-2xl overflow-hidden border border-purple-500/20 group active:scale-[0.98] transition-transform"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {nextEvent.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-[#2C2C2E] text-[#8E8E93] text-[10px] font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight mb-1">
                      {nextEvent.title}
                    </h3>
                    <p className="text-[#8E8E93] text-sm mb-3">
                      {nextEvent.subtitle}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#8E8E93]">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {nextEvent.displayDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {nextEvent.venue}
                      </span>
                    </div>
                    {nextEvent.headliners.length > 0 && (
                      <p className="text-[#666] text-xs mt-3 line-clamp-1">
                        {nextEvent.headliners.slice(0, 3).join(' • ')}
                        {nextEvent.headliners.length > 3 && ` +${nextEvent.headliners.length - 3} more`}
                      </p>
                    )}
                  </div>
                </Link>
              </section>
            );
          }

          // No upcoming event but has past events - show smaller browse link
          if (hasEvents) {
            return (
              <Link
                href="/events"
                className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[#F5F5F5] font-medium text-sm">Browse Events</span>
                    <p className="text-[#666] text-xs">View past events</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#666] group-hover:text-[#888] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          }

          // No events at all - hide section
          return null;
        })()}

        {/* === DJ OF THE DAY === */}
        {djOfTheDay && (
          <section>
            <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
              DJ of the Day
            </h2>
            <Link
              href={`/djs/${djOfTheDay.dj.slug}`}
              className="block bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1A1A1A] flex-shrink-0 ring-2 ring-purple-500/30">
                  {djOfTheDay.dj.avatarUrl ? (
                    <img
                      src={djOfTheDay.dj.avatarUrl}
                      alt={djOfTheDay.dj.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src="/logo.png" alt="" className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[#F5F5F5] font-bold text-lg truncate">{djOfTheDay.dj.name}</h3>
                    {djOfTheDay.dj.isVerified && (
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[#888] text-sm mb-2">{djOfTheDay.reason}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#666]">{djOfTheDay.dj.totalShows} shows</span>
                    {djOfTheDay.dj.genres.length > 0 && (
                      <span className="text-purple-400">{djOfTheDay.dj.genres.slice(0, 2).join(' • ')}</span>
                    )}
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#666] group-hover:text-purple-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </section>
        )}

        {/* === AGENTBOT FEED === */}
        <section>
          <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Agentbot
          </h2>
          <MoltxFeed agentName="Atlas_baseFM" limit={3} />
        </section>

        {/* === QUICK LINKS — always visible === */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/community"
              className="flex flex-col items-center gap-2 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors active:scale-[0.97]"
            >
              <svg className="w-6 h-6 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <span className="text-[#F5F5F5] text-xs font-medium">Community</span>
            </Link>
            <Link
              href="/djs"
              className="flex flex-col items-center gap-2 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors active:scale-[0.97]"
            >
              <svg className="w-6 h-6 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="text-[#F5F5F5] text-xs font-medium">DJs</span>
            </Link>
            <Link
              href="/archive"
              className="flex flex-col items-center gap-2 p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#222] transition-colors active:scale-[0.97]"
            >
              <svg className="w-6 h-6 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z" />
              </svg>
              <span className="text-[#F5F5F5] text-xs font-medium">Archive</span>
            </Link>
          </div>
        </section>

        {/* === RAVECULTURE PREVIEW — tighter === */}
        <section>
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl overflow-hidden border border-purple-500/20">
            <div className="p-4 pb-3">
              <h2 className="text-[#F5F5F5] text-base font-bold">raveculture&reg;</h2>
              <p className="text-[#888] text-xs">Underground culture. Onchain access.</p>
            </div>
            <div className="bg-black">
              <iframe
                src="https://player.mux.com/X9OgXqO8Gvo3iHgtTWJqgstGJFVIloBQnT5dhpxeIBM"
                className="w-full border-none aspect-video"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* === SHARE — compact row, not a full section === */}
        <section className="pb-4">
          <ShareApp variant="compact" className="justify-center" />
        </section>

        {/* === COMING UP === */}
        {hasUpcoming && (
          <section>
            <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3">
              Coming Up
            </h2>
            <div className="flex gap-3 overflow-x-auto carousel-scroll hide-scrollbar pb-2">
              {upcomingStreams.map((stream) => (
                <LiveShowCard
                  key={stream.id}
                  id={stream.id}
                  title={stream.title}
                  djName={stream.djName}
                  artwork={stream.coverImageUrl}
                  genre={stream.genre}
                  isLive={false}
                  isTokenGated={stream.isGated}
                  startTime={
                    stream.scheduledStartTime
                      ? new Date(stream.scheduledStartTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : undefined
                  }
                  variant="carousel"
                />
              ))}
            </div>
          </section>
        )}

        {/* === SUPPORT THE PLATFORM === */}
        <section className="pt-6 border-t border-[#1A1A1A]">
          <div className="bg-gradient-to-br from-purple-900/20 via-[#1A1A1A] to-blue-900/20 rounded-2xl p-5 border border-[#2A2A2A]">
            <div className="text-center mb-4">
              <h3 className="text-[#F5F5F5] font-bold text-lg mb-1">Support baseFM</h3>
              <p className="text-[#888] text-sm">
                Help fund the backend, improve the platform, or support the community
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Donate ETH/Crypto */}
              <Link
                href="https://www.coinbase.com/pay?address=eskyee.base.eth&currency=ETH"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>Donate</span>
              </Link>
              {/* Buy baseFM Token */}
              <Link
                href="https://base.meme/coin/base:0x1DBf2954FFEC96a333ae20F00c0bC40471ad8888"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] border border-[#333] rounded-full text-[#F5F5F5] text-sm font-medium hover:bg-[#1A1A1A] hover:border-purple-500/50 transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Buy baseFM Token</span>
              </Link>
            </div>
          </div>
        </section>

        {/* === GITHUB SPONSORS === */}
        <section className="pt-4">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[600px] rounded-xl overflow-hidden bg-[#0d1117]">
              <iframe
                src="https://github.com/sponsors/Eskyee/card"
                title="Sponsor Eskyee"
                height="225"
                className="w-full border-0"
              />
            </div>
          </div>
        </section>

        {/* === CREATOR INFO === */}
        <section className="pt-4">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/Eskyee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-full text-[#888] text-sm hover:text-[#F5F5F5] hover:bg-[#222] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>Eskyee</span>
              </Link>
              <Link
                href="https://github.com/Eskyee/baseFM"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-full text-[#888] text-sm hover:text-[#F5F5F5] hover:bg-[#222] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Source</span>
              </Link>
            </div>
            <p className="text-[#666] text-xs text-center">
              Created by Eskyee for baseFM
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
