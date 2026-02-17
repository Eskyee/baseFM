'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { Promoter } from '@/types/event';

export default function SubmitEventPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [promoter, setPromoter] = useState<Promoter | null>(null);
  const [isLoadingPromoter, setIsLoadingPromoter] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [address_, setAddress_] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [headliners, setHeadliners] = useState('');
  const [tags, setTags] = useState('');
  const [genres, setGenres] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Load promoter profile for connected wallet
  useEffect(() => {
    async function loadPromoter() {
      if (!address) {
        setIsLoadingPromoter(false);
        return;
      }

      try {
        const res = await fetch(`/api/promoters?wallet=${address}`);
        if (res.ok) {
          const data = await res.json();
          setPromoter(data.promoter);
        }
      } catch (err) {
        console.error('Failed to load promoter:', err);
      } finally {
        setIsLoadingPromoter(false);
      }
    }

    loadPromoter();
  }, [address]);

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          description,
          date,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          displayDate: formatDisplayDate(date),
          venue,
          address: address_ || undefined,
          city: city || undefined,
          country: country || undefined,
          headliners: headliners ? headliners.split(',').map(h => h.trim()) : [],
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
          genres: genres ? genres.split(',').map(g => g.trim()) : [],
          ticketUrl: ticketUrl || undefined,
          ticketPrice: ticketPrice || undefined,
          imageUrl: imageUrl || undefined,
          promoterId: promoter?.id,
          createdByWallet: address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit event');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Submit Event</h1>
          <p className="text-[#888] mb-8">Connect your wallet to submit an event</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Event Submitted!</h1>
          <p className="text-[#888] mb-8">
            Your event has been submitted for review. We&apos;ll notify you once it&apos;s approved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Events
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setTitle('');
                setSubtitle('');
                setDescription('');
                setDate('');
                setStartTime('');
                setEndTime('');
                setVenue('');
                setAddress_('');
                setCity('');
                setCountry('');
                setHeadliners('');
                setTags('');
                setGenres('');
                setTicketUrl('');
                setTicketPrice('');
                setImageUrl('');
              }}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#333] text-[#F5F5F5] rounded-full font-semibold hover:bg-[#252525] hover:border-purple-500/50 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5 text-[#888] group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/events"
          className="text-[#888] hover:text-[#F5F5F5] mb-6 inline-flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </Link>

        <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Submit Event</h1>
        <p className="text-[#888] text-sm mb-8">
          Submit your event for review. Once approved, it will appear on the events page.
        </p>

        {/* Promoter Profile Notice */}
        {!isLoadingPromoter && !promoter && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
            <p className="text-purple-300 text-sm">
              <strong>Tip:</strong> Create a promoter profile to have your events linked to your organization.{' '}
              <Link href="/promoters/create" className="underline hover:text-purple-200">
                Create profile
              </Link>
            </p>
          </div>
        )}

        {promoter && (
          <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6">
            <p className="text-[#888] text-sm">
              Submitting as: <span className="text-[#F5F5F5] font-medium">{promoter.name}</span>
              {promoter.isVerified && (
                <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded">Verified</span>
              )}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Event Details</h2>

            <div>
              <label className="block text-sm text-[#888] mb-2">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., STROBE SOUNDSYSTEM"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888] mb-2">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., Dub to Live Techno & Drum & Bass"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888] mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell us about your event..."
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Date & Time</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[#888] mb-2">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-[#888] mb-2">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-[#888] mb-2">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Location</h2>

            <div>
              <label className="block text-sm text-[#888] mb-2">Venue *</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                placeholder="e.g., 360 Warehouse"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888] mb-2">Address</label>
              <input
                type="text"
                value={address_}
                onChange={(e) => setAddress_(e.target.value)}
                placeholder="Street address"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#888] mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., London"
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-[#888] mb-2">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., UK"
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Lineup & Tags */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Lineup & Tags</h2>

            <div>
              <label className="block text-sm text-[#888] mb-2">Headliners</label>
              <input
                type="text"
                value={headliners}
                onChange={(e) => setHeadliners(e.target.value)}
                placeholder="Comma-separated: SAYTEK LIVE, JAH SCOOP"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888] mb-2">Genres</label>
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="Comma-separated: Techno, Drum & Bass, Dub"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888] mb-2">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma-separated: Launch Event, All Night"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Tickets & Media */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Tickets & Media</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#888] mb-2">Ticket URL</label>
                <input
                  type="url"
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-[#888] mb-2">Ticket Price</label>
                <input
                  type="text"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="e.g., Free, $20, 10-25"
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#888] mb-2">Event Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
              <p className="text-[#666] text-xs mt-1">Direct link to your event flyer/image</p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] rounded-2xl text-white font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:bg-right transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting Event...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Event for Review
              </>
            )}
          </button>

          <p className="text-center text-[#666] text-xs">
            By submitting, you agree that your event follows our community guidelines.
          </p>
        </form>
      </div>
    </div>
  );
}
