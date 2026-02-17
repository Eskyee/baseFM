'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { Promoter, PromoterType } from '@/types/event';

const TYPE_OPTIONS: { value: PromoterType; label: string; description: string }[] = [
  { value: 'promoter', label: 'Promoter', description: 'Event organizer / booker' },
  { value: 'collective', label: 'Collective', description: 'Artist collective or crew' },
  { value: 'venue', label: 'Venue', description: 'Club, warehouse, or space' },
  { value: 'label', label: 'Label', description: 'Record label' },
  { value: 'organization', label: 'Organization', description: 'Community or non-profit' },
];

export default function CreatePromoterPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingPromoter, setExistingPromoter] = useState<Promoter | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [type, setType] = useState<PromoterType>('promoter');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [genres, setGenres] = useState('');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Check if user already has a promoter profile
  useEffect(() => {
    async function checkExisting() {
      if (!address) {
        setIsCheckingExisting(false);
        return;
      }

      try {
        const res = await fetch(`/api/promoters?wallet=${address}`);
        if (res.ok) {
          const data = await res.json();
          if (data.promoter) {
            setExistingPromoter(data.promoter);
          }
        }
      } catch (err) {
        console.error('Failed to check existing promoter:', err);
      } finally {
        setIsCheckingExisting(false);
      }
    }

    checkExisting();
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/promoters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          name,
          bio: bio || undefined,
          type,
          city: city || undefined,
          country: country || undefined,
          genres: genres ? genres.split(',').map(g => g.trim()) : [],
          email: email || undefined,
          websiteUrl: websiteUrl || undefined,
          instagramUrl: instagramUrl || undefined,
          twitterUrl: twitterUrl || undefined,
          logoUrl: logoUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }

      // Redirect to the new profile
      router.push(`/collectives/${data.promoter.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Create Profile</h1>
          <p className="text-[#888] mb-8">Connect your wallet to create a promoter profile</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  if (isCheckingExisting) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#888]">Checking existing profile...</p>
        </div>
      </div>
    );
  }

  if (existingPromoter) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Profile Exists</h1>
          <p className="text-[#888] mb-8">
            You already have a profile: <strong className="text-[#F5F5F5]">{existingPromoter.name}</strong>
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href={`/collectives/${existingPromoter.slug}`}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </Link>
            <Link
              href="/events/submit"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#333] text-[#F5F5F5] rounded-full font-semibold hover:bg-[#252525] hover:border-purple-500/50 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5 text-[#888] group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Submit Event
            </Link>
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
          href="/collectives"
          className="text-[#888] hover:text-[#F5F5F5] mb-6 inline-flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Collectives
        </Link>

        <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Create Profile</h1>
        <p className="text-[#888] text-sm mb-8">
          Create a profile for your collective, venue, label, or organization.
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm text-[#888] mb-3">Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    type === option.value
                      ? 'bg-purple-500/20 border border-purple-500'
                      : 'bg-[#1A1A1A] border border-[#333] hover:border-[#444]'
                  }`}
                >
                  <span className={`block font-medium text-sm ${
                    type === option.value ? 'text-purple-300' : 'text-[#F5F5F5]'
                  }`}>
                    {option.label}
                  </span>
                  <span className="block text-xs text-[#888] mt-0.5">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#888] mb-2">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your collective or organization name"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888] mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us about your collective..."
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>

          {/* Location */}
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

          {/* Genres */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Genres</label>
            <input
              type="text"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="Comma-separated: Techno, House, Drum & Bass"
              className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Contact & Links</h2>

            <div>
              <label className="block text-sm text-[#888] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-[#888] mb-2">Website</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#888] mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-[#888] mb-2">Twitter/X URL</label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:border-purple-500"
            />
            <p className="text-[#666] text-xs mt-1">Direct link to your logo image</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !name}
            className="group w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] rounded-2xl text-white font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:bg-right transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Profile...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
