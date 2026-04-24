'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import Link from 'next/link';
import { Promoter } from '@/types/event';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 text-sm ${props.className || ''}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 bg-black border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 text-sm resize-none ${props.className || ''}`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-3 bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-500 text-sm ${props.className || ''}`}
    />
  );
}

export default function SubmitEventPage() {
  const { address, isConnected } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [promoter, setPromoter] = useState<Promoter | null>(null);
  const [isLoadingPromoter, setIsLoadingPromoter] = useState(true);

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

  const [enableTicketSales, setEnableTicketSales] = useState(false);
  const [ticketTiers, setTicketTiers] = useState<Array<{
    name: string;
    price: string;
    quantity: string;
    description: string;
  }>>([{ name: 'General Admission', price: '', quantity: '', description: '' }]);
  const [paymentWallet, setPaymentWallet] = useState('');

  useEffect(() => {
    if (address && !paymentWallet) {
      setPaymentWallet(address);
    }
  }, [address, paymentWallet]);

  const addTicketTier = () => {
    setTicketTiers([...ticketTiers, { name: '', price: '', quantity: '', description: '' }]);
  };

  const removeTicketTier = (index: number) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(ticketTiers.filter((_, i) => i !== index));
    }
  };

  const updateTicketTier = (index: number, field: string, value: string) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTiers(updated);
  };

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

    void loadPromoter();
  }, [address]);

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const resetForm = () => {
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
    setEnableTicketSales(false);
    setTicketTiers([{ name: 'General Admission', price: '', quantity: '', description: '' }]);
    setPaymentWallet(address || '');
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
          headliners: headliners ? headliners.split(',').map((h) => h.trim()) : [],
          tags: tags ? tags.split(',').map((t) => t.trim()) : [],
          genres: genres ? genres.split(',').map((g) => g.trim()) : [],
          ticketUrl: ticketUrl || undefined,
          ticketPrice: ticketPrice || undefined,
          imageUrl: imageUrl || undefined,
          promoterId: promoter?.id,
          createdByWallet: address,
          enableTicketSales,
          paymentWallet: enableTicketSales ? paymentWallet : undefined,
          ticketTiers: enableTicketSales
            ? ticketTiers
                .filter((t) => t.name && t.price)
                .map((t) => ({
                  name: t.name,
                  priceUsdc: parseFloat(t.price) || 0,
                  quantity: parseInt(t.quantity) || 0,
                  description: t.description || undefined,
                }))
            : undefined,
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
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="basefm-kicker text-blue-500">Events</span>
              <span className="basefm-kicker text-zinc-500">Submit</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
                Submit your event.
                <br />
                <span className="text-zinc-700">Connect first.</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
                Connect your wallet to submit an event for review and publication on the station calendar.
              </p>
            </div>
            <WalletConnect />
          </div>
        </section>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="basefm-panel p-8 sm:p-10 max-w-2xl">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Submission complete</div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase mb-4">Event submitted.</h1>
            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              Your event is in review. Once approved, it will appear on the events page and ticket flow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/events" className="basefm-button-primary">
                View Events
              </Link>
              <button onClick={resetForm} className="basefm-button-secondary">
                Submit Another
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8 mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Events</span>
            <span className="basefm-kicker text-zinc-500">Submission flow</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              Submit an event.
              <br />
              <span className="text-zinc-700">Get it onto the station calendar.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              This flow keeps the event data clean, optional ticket sales structured, and promoter attribution explicit before review.
            </p>
          </div>
        </div>

        {!isLoadingPromoter && !promoter ? (
          <div className="border border-blue-500/20 bg-blue-500/10 p-4 mb-6 max-w-4xl">
            <p className="text-sm text-blue-300">
              Create a promoter profile if you want events linked to your organization.{' '}
              <Link href="/promoters/create" className="underline hover:text-white">
                Create profile
              </Link>
            </p>
          </div>
        ) : null}

        {promoter ? (
          <div className="basefm-panel p-4 mb-6 max-w-4xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest text-zinc-600">Submitting as</span>
              <span className="text-sm text-white font-medium">{promoter.name}</span>
              {promoter.isVerified ? <span className="basefm-kicker text-blue-500">Verified</span> : null}
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="border border-red-500/30 bg-red-500/10 p-4 mb-6 text-sm text-red-300 max-w-4xl">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-px bg-zinc-900 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-black p-6 sm:p-8 space-y-6">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">Event details</div>

            <div>
              <FieldLabel>Event title *</FieldLabel>
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. STROBE SOUNDSYSTEM" />
            </div>

            <div>
              <FieldLabel>Subtitle</FieldLabel>
              <TextInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Dub to live techno and drum & bass" />
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Tell the station what this event is, why it matters, and what the night feels like." />
            </div>

            <div className="grid gap-px bg-zinc-900 sm:grid-cols-3">
              <div className="bg-black p-4">
                <FieldLabel>Date *</FieldLabel>
                <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="bg-black p-4">
                <FieldLabel>Start time</FieldLabel>
                <TextInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="bg-black p-4">
                <FieldLabel>End time</FieldLabel>
                <TextInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
              <div className="bg-black p-4 sm:col-span-2">
                <FieldLabel>Venue *</FieldLabel>
                <TextInput value={venue} onChange={(e) => setVenue(e.target.value)} required placeholder="e.g. Hackney Bridge" />
              </div>
              <div className="bg-black p-4 sm:col-span-2">
                <FieldLabel>Address</FieldLabel>
                <TextInput value={address_} onChange={(e) => setAddress_(e.target.value)} placeholder="Street address" />
              </div>
              <div className="bg-black p-4">
                <FieldLabel>City</FieldLabel>
                <TextInput value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. London" />
              </div>
              <div className="bg-black p-4">
                <FieldLabel>Country</FieldLabel>
                <TextInput value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. UK" />
              </div>
            </div>

            <div className="grid gap-px bg-zinc-900">
              <div className="bg-black p-4">
                <FieldLabel>Headliners</FieldLabel>
                <TextInput value={headliners} onChange={(e) => setHeadliners(e.target.value)} placeholder="Comma-separated: SAYTEK LIVE, JAH SCOOP" />
              </div>
              <div className="bg-black p-4">
                <FieldLabel>Genres</FieldLabel>
                <TextInput value={genres} onChange={(e) => setGenres(e.target.value)} placeholder="Comma-separated: Techno, Drum & Bass, Dub" />
              </div>
              <div className="bg-black p-4">
                <FieldLabel>Tags</FieldLabel>
                <TextInput value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Comma-separated: Launch Event, All Night" />
              </div>
              <div className="bg-black p-4">
                <FieldLabel>Event image URL</FieldLabel>
                <TextInput type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>

          <div className="bg-black p-6 sm:p-8 space-y-6">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600">Ticketing and media</div>

            <div className="basefm-panel p-4">
              <FieldLabel>External ticket URL</FieldLabel>
              <TextInput type="url" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://..." disabled={enableTicketSales} className="disabled:opacity-50" />
              <p className="text-xs text-zinc-500 mt-2">Leave this empty if you are using the onchain ticket flow below.</p>
            </div>

            <div className="basefm-panel p-4">
              <FieldLabel>Ticket price display</FieldLabel>
              <TextInput value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} placeholder="e.g. Free, $20, 10-25" disabled={enableTicketSales} className="disabled:opacity-50" />
            </div>

            <div className={`border ${enableTicketSales ? 'border-blue-500/30 bg-blue-500/10' : 'border-zinc-800 bg-black'} p-4`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider text-white mb-1">Onchain ticket sales</div>
                  <p className="text-xs text-zinc-500">Structured ticket tiers with direct USDC payment to your wallet.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableTicketSales(!enableTicketSales)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${enableTicketSales ? 'border-white bg-white text-black' : 'border-zinc-700 text-zinc-400 hover:text-white'}`}
                >
                  {enableTicketSales ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>

            {enableTicketSales ? (
              <div className="space-y-4">
                <div className="basefm-panel p-4">
                  <FieldLabel>Payment wallet</FieldLabel>
                  <TextInput value={paymentWallet} onChange={(e) => setPaymentWallet(e.target.value)} placeholder="0x..." className="font-mono" />
                  <p className="text-xs text-zinc-500 mt-2">USDC payments go directly to this wallet.</p>
                </div>

                <div className="space-y-3">
                  {ticketTiers.map((tier, index) => (
                    <div key={index} className="basefm-panel p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600">Tier {index + 1}</div>
                        {ticketTiers.length > 1 ? (
                          <button type="button" onClick={() => removeTicketTier(index)} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-white">
                            Remove
                          </button>
                        ) : null}
                      </div>

                      <TextInput value={tier.name} onChange={(e) => updateTicketTier(index, 'name', e.target.value)} placeholder="e.g. Early Bird" />

                      <div className="grid gap-px bg-zinc-900 sm:grid-cols-[1fr_120px]">
                        <div className="bg-black p-4">
                          <FieldLabel>Price</FieldLabel>
                          <TextInput type="number" min="0" step="0.01" value={tier.price} onChange={(e) => updateTicketTier(index, 'price', e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="bg-black p-4">
                          <FieldLabel>Quantity</FieldLabel>
                          <TextInput type="number" min="0" value={tier.quantity} onChange={(e) => updateTicketTier(index, 'quantity', e.target.value)} placeholder="0" />
                        </div>
                      </div>

                      <TextInput value={tier.description} onChange={(e) => updateTicketTier(index, 'description', e.target.value)} placeholder="Description (optional)" />
                    </div>
                  ))}

                  <button type="button" onClick={addTicketTier} className="basefm-button-secondary w-full">
                    Add Another Tier
                  </button>
                </div>

                <div className="border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-zinc-300 mb-2">How it works</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Attendees pay with USDC on Base and the funds go directly to your wallet. The platform records the sale cleanly for verification and accounting.
                  </p>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="basefm-button-primary w-full disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isSubmitting ? 'Submitting Event...' : 'Submit Event for Review'}
            </button>

            <p className="text-xs text-zinc-500 leading-relaxed">
              By submitting, you confirm the listing is accurate and ready for review.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}
