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

  useEffect(() => {
    async function checkExisting() {
      if (!address) { setIsCheckingExisting(false); return; }
      try {
        const res = await fetch(`/api/promoters?wallet=${address}`);
        if (res.ok) {
          const data = await res.json();
          if (data.promoter) setExistingPromoter(data.promoter);
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
      if (!res.ok) throw new Error(data.error || 'Failed to create profile');
      router.push(`/collectives/${data.promoter.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Not connected ───────────────────────────────────────────────
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="basefm-kicker text-purple-400">Collectives</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter uppercase leading-[0.92]">
              Connect wallet.
            </h1>
            <p className="text-sm text-zinc-400">Connect your wallet to create a promoter profile.</p>
            <WalletConnect />
          </div>
        </section>
      </main>
    );
  }

  // ── Checking ────────────────────────────────────────────────────
  if (isCheckingExisting) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-500 animate-spin mx-auto" />
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Checking existing profile</p>
          </div>
        </section>
      </main>
    );
  }

  // ── Already exists ──────────────────────────────────────────────
  if (existingPromoter) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-[10px] uppercase tracking-widest text-green-400">Profile Exists</div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">{existingPromoter.name}</h1>
            <p className="text-sm text-zinc-400">You already have a promoter profile.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href={`/collectives/${existingPromoter.slug}`} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-purple-500/40 text-purple-400 hover:bg-purple-500 hover:text-black transition-all">
                View Profile
              </Link>
              <Link href="/events/submit" className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all">
                Submit Event
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Create form ─────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl space-y-6">
          <Link href="/collectives" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collectives
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-purple-400">Create Profile</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              Create profile.
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              Create a profile for your collective, venue, label, or organization.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="max-w-3xl">
            {error && (
              <div className="border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 mb-px">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-px">
              {/* Type Selection */}
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Type *</div>
                <div className="grid gap-px bg-zinc-900 sm:grid-cols-3 lg:grid-cols-5">
                  {TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value)}
                      className={`bg-black p-4 text-left transition-colors ${
                        type === option.value
                          ? 'bg-purple-500/10 border border-purple-500/30'
                          : 'hover:bg-zinc-950'
                      }`}
                    >
                      <span className={`block text-sm font-bold uppercase tracking-wider ${
                        type === option.value ? 'text-purple-300' : 'text-zinc-300'
                      }`}>
                        {option.label}
                      </span>
                      <span className="block text-[10px] text-zinc-500 mt-1">{option.description}</span>
                      {type === option.value && <div className="mt-2 h-2 w-2 bg-purple-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Basic Info</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your collective or organization name" className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about your collective..." className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono resize-none" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Location</div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="London" className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Country</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="UK" className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono" />
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Genres</div>
                <input type="text" value={genres} onChange={(e) => setGenres(e.target.value)} placeholder="Techno, House, Drum & Bass" className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono" />
                <p className="text-[10px] text-zinc-600 mt-2">Comma-separated</p>
              </div>

              {/* Contact & Links */}
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Contact & Links</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Website</label>
                    <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Instagram URL</label>
                      <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Twitter/X URL</label>
                      <input type="url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/..." className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Logo</div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Logo URL</label>
                <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono" />
                <p className="text-[10px] text-zinc-600 mt-2">Direct link to your logo image</p>
              </div>

              {/* Submit */}
              <div className="border border-zinc-800 bg-zinc-950 p-6">
                <button type="submit" disabled={isSubmitting || !name} className="w-full py-3 text-[10px] font-bold uppercase tracking-widest border border-purple-500/40 text-purple-400 hover:bg-purple-500 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
