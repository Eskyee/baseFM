'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import type { PublicEvent } from '@/types/event';

// ============================================================
// EventEntry — Entry experience at the event
//
// Physical: QR / screen for door staff
// Livestream: Silent access check → load stream
//
// UX Copy Rules (NON-NEGOTIABLE):
//   ✅ "Welcome" / "Access confirmed" / "Present this screen"
//   ❌ No transaction signing, no wallet popups at entry
// ============================================================

type EntryStatus = 'ready' | 'checking' | 'granted' | 'denied';

interface EventEntryProps {
  event: PublicEvent;
}

export function EventEntry({ event }: EventEntryProps) {
  const { address } = useAccount();
  const [status, setStatus] = useState<EntryStatus>('ready');
  const [errorMessage, setErrorMessage] = useState('');

  const isPhysical = event.eventType === 'physical';

  const handleEnterStream = async () => {
    if (!address) {
      setErrorMessage('Access not found — Please check your pass.');
      setStatus('denied');
      return;
    }

    setStatus('checking');
    setErrorMessage('');

    try {
      const res = await fetch(
        `/api/events/access?eventId=${encodeURIComponent(event.id)}&wallet=${encodeURIComponent(address)}`
      );
      const data = await res.json();

      if (data.hasAccess) {
        setStatus('granted');
      } else {
        setErrorMessage('Access not found — Please check your pass.');
        setStatus('denied');
      }
    } catch {
      setErrorMessage('Something didn\'t work. Please try again.');
      setStatus('denied');
    }
  };

  // ---- Physical Event Entry ----
  if (isPhysical) {
    return (
      <div className="bg-[#1A1A1A] rounded-2xl p-6">
        <h3 className="text-[#F5F5F5] text-lg font-bold text-center mb-2">
          Event Entry
        </h3>
        <p className="text-[#888] text-sm text-center mb-6">
          Present this screen at the door.
        </p>

        {/* QR Code Placeholder */}
        <div className="w-48 h-48 mx-auto mb-6 bg-[#0A0A0A] rounded-xl flex items-center justify-center border border-[#2C2C2E]">
          <div className="text-center">
            <svg className="w-12 h-12 text-[#888] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <p className="text-[#666] text-xs">QR Code</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-semibold">Ready</span>
        </div>
      </div>
    );
  }

  // ---- Livestream Entry ----
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-6">
      {status === 'ready' && (
        <>
          <h3 className="text-[#F5F5F5] text-lg font-bold text-center mb-2">
            Enter Stream
          </h3>
          <p className="text-[#888] text-sm text-center mb-6">
            Your access will be checked before joining.
          </p>
          <button
            onClick={handleEnterStream}
            className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-base transition-all active:scale-[0.97]"
          >
            Enter
          </button>
        </>
      )}

      {status === 'checking' && (
        <div className="py-6 text-center">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#888] text-sm">Checking access...</p>
        </div>
      )}

      {status === 'granted' && (
        <>
          <div className="py-4 text-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 text-sm font-semibold">Access confirmed</p>
          </div>

          {/* Stream embed */}
          {event.streamUrl ? (
            <div className="rounded-xl overflow-hidden bg-black">
              <iframe
                src={event.streamUrl}
                className="w-full border-none aspect-video"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="rounded-xl bg-[#0A0A0A] aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[#F5F5F5] text-sm font-semibold">Live</span>
                </div>
                <p className="text-[#888] text-xs">
                  Hosted by {event.creator || 'baseFM'}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {status === 'denied' && (
        <>
          <div className="py-4 text-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] text-lg font-bold mb-1">
              Access not found
            </h3>
            <p className="text-[#888] text-sm">
              {errorMessage || 'Please check your pass.'}
            </p>
          </div>
          <button
            onClick={() => setStatus('ready')}
            className="w-full py-3 bg-[#2C2C2E] text-[#F5F5F5] rounded-xl font-medium text-sm transition-all active:scale-[0.97]"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
