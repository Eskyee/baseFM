'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useEvent, useEventAccess } from '@/hooks/useEvents';
import { AccessModal } from '@/components/AccessModal';
import { EventEntry } from '@/components/EventEntry';

// ============================================================
// Single Event Page — the core user experience
//
// Flow:
//   1. Anyone can view event details (no wallet)
//   2. "Get Access" → opens AccessModal → wallet only if needed
//   3. If user has access → "Access Confirmed" badge + entry
//   4. Countdown timer to event start
//
// UX Copy Rules (NON-NEGOTIABLE):
//   ✅ Access, Pass, Entry, Confirmed
//   ❌ NFT, Token, Mint, Blockchain, Gas, Transaction
// ============================================================

function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function useCountdown(targetTimestamp: number) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = targetTimestamp * 1000 - Date.now();
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      const diff = targetTimestamp * 1000 - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, timeLeft]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: timeLeft <= 0 };
}

export default function EventPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const { address } = useAccount();
  const { event, isLoading, error } = useEvent(eventId);
  const {
    hasAccess,
    status: accessStatus,
    isChecking: accessChecking,
    checkAccess,
  } = useEventAccess(eventId, address);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const countdown = useCountdown(event?.startTime ?? 0);

  const isLive =
    event &&
    event.startTime * 1000 <= Date.now() &&
    event.endTime * 1000 > Date.now() &&
    event.status === 'active';

  const isEnded = event?.status === 'ended' || (event && event.endTime * 1000 < Date.now());
  const isUpcoming = event && event.startTime * 1000 > Date.now();

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-[#1A1A1A] rounded w-20" />
            <div className="h-8 bg-[#1A1A1A] rounded w-3/4" />
            <div className="h-4 bg-[#1A1A1A] rounded w-1/2" />
            <div className="h-32 bg-[#1A1A1A] rounded-2xl" />
            <div className="h-14 bg-[#1A1A1A] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found
  if (error || !event) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-[#F5F5F5] text-xl font-bold mb-2">
            Event not found
          </h1>
          <p className="text-[#888] text-sm mb-6">
            This event may have been removed or doesn&apos;t exist.
          </p>
          <Link
            href="/events"
            className="inline-flex px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-[#0A0A0A] to-[#0A0A0A]" />

        <div className="relative max-w-2xl mx-auto px-4 pt-6 pb-2">
          {/* Back */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-[#888] mb-6 transition-colors active:scale-[0.97]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Events</span>
          </Link>

          {/* Status badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase rounded-full">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Live Now
              </span>
            )}
            {isEnded && (
              <span className="px-2.5 py-1 bg-[#2C2C2E] text-[#888] text-xs font-medium rounded-full">
                Event Ended
              </span>
            )}
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold uppercase rounded-full">
              {event.eventType === 'livestream' ? 'Livestream' : 'In Person'}
            </span>

            {/* Access confirmed badge */}
            {hasAccess && !accessChecking && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Access Confirmed
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-[#F5F5F5] text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {event.name}
          </h1>

          {/* Date & Location */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <span className="flex items-center gap-1.5 text-[#888]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatFullDate(event.startTime)} · {formatTime(event.startTime)}
            </span>
            <span className="flex items-center gap-1.5 text-[#888]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location || (event.eventType === 'livestream' ? 'Livestream' : 'TBA')}
            </span>
          </div>

          {/* Creator */}
          {event.creator && (
            <p className="text-[#888] text-sm mb-6">
              By <span className="text-[#F5F5F5] font-medium">{event.creator}</span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Countdown (only for upcoming events) */}
        {isUpcoming && !countdown.isExpired && (
          <div className="bg-[#1A1A1A] rounded-2xl p-5">
            <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-3">
              Starts in
            </p>
            <div className="flex items-center gap-4">
              {countdown.days > 0 && (
                <div className="text-center">
                  <span className="text-[#F5F5F5] text-2xl font-bold tabular-nums">
                    {String(countdown.days).padStart(2, '0')}
                  </span>
                  <p className="text-[#666] text-[10px] uppercase mt-0.5">Days</p>
                </div>
              )}
              <div className="text-center">
                <span className="text-[#F5F5F5] text-2xl font-bold tabular-nums">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <p className="text-[#666] text-[10px] uppercase mt-0.5">Hours</p>
              </div>
              <div className="text-center">
                <span className="text-[#F5F5F5] text-2xl font-bold tabular-nums">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <p className="text-[#666] text-[10px] uppercase mt-0.5">Min</p>
              </div>
              <div className="text-center">
                <span className="text-[#F5F5F5] text-2xl font-bold tabular-nums">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <p className="text-[#666] text-[10px] uppercase mt-0.5">Sec</p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div>
            <h2 className="text-[#F5F5F5] text-sm font-semibold uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="text-[#888] text-sm leading-relaxed">
              {event.description}
            </p>
          </div>
        )}

        {/* === PRIMARY CTA AREA === */}
        {!isEnded && (
          <div className="space-y-3">
            {/* User doesn't have access yet */}
            {!hasAccess && !accessChecking && (
              <button
                onClick={() => setShowAccessModal(true)}
                className="w-full py-4 bg-white text-black rounded-2xl font-bold text-base transition-all active:scale-[0.97]"
              >
                Get Access
              </button>
            )}

            {/* Checking access */}
            {accessChecking && (
              <div className="w-full py-4 bg-[#1A1A1A] rounded-2xl flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#888] border-t-transparent rounded-full animate-spin" />
                <span className="text-[#888] text-sm">Checking access...</span>
              </div>
            )}

            {/* User has access — show entry or "Entry opens soon" */}
            {hasAccess && !accessChecking && (
              <>
                {isLive ? (
                  // Event is live — show entry
                  <EventEntry event={event} />
                ) : isUpcoming ? (
                  // Event upcoming — entry not open yet
                  <div className="bg-[#1A1A1A] rounded-2xl p-5 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-400 font-semibold">Access Confirmed</span>
                    </div>
                    <button
                      disabled
                      className="w-full py-3.5 bg-[#2C2C2E] text-[#888] rounded-xl font-semibold text-base cursor-not-allowed mt-3"
                    >
                      Entry opens soon
                    </button>
                    <p className="text-[#666] text-xs mt-3">
                      Keep this page handy for event day.
                    </p>
                  </div>
                ) : null}
              </>
            )}

            {/* Already have access prompt (when no wallet connected) */}
            {!hasAccess && !accessChecking && !address && (
              <p className="text-[#888] text-sm text-center">
                Already have access?{' '}
                <button
                  onClick={() => setShowAccessModal(true)}
                  className="text-[#F5F5F5] underline underline-offset-2"
                >
                  Check your pass
                </button>
              </p>
            )}
          </div>
        )}

        {/* Event ended state */}
        {isEnded && (
          <div className="bg-[#1A1A1A] rounded-2xl p-6 text-center">
            <p className="text-[#888] text-sm mb-1">
              {accessStatus === 'used'
                ? 'You were there'
                : 'This event has ended'}
            </p>
            {accessStatus === 'used' && (
              <p className="text-[#666] text-xs">
                This event is now part of your history.
              </p>
            )}
            {accessStatus !== 'used' && (
              <p className="text-[#666] text-xs">
                Thanks for being part of it.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Access Modal */}
      <AccessModal
        isOpen={showAccessModal}
        onClose={() => {
          setShowAccessModal(false);
          // Refresh access status after modal closes
          checkAccess();
        }}
        eventId={eventId}
        eventName={event.name}
        onAccessGranted={() => {
          checkAccess();
        }}
      />
    </div>
  );
}
