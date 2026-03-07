import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Promoter Dashboard | baseFM',
  description: 'Discover and book talented DJs for your events. View stats, press kits, and booking availability.',
};

// Get DJ stats and info
async function getDJs() {
  const supabase = createServerClient();
  const { data: djs } = await supabase
    .from('djs')
    .select('*')
    .eq('is_active', true)
    .order('total_streams', { ascending: false })
    .limit(20);

  return djs || [];
}

export default async function PromotersPage() {
  const djs = await getDJs();

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-900/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-3">
              Promoter Dashboard
            </h1>
            <p className="text-[#888] text-sm sm:text-base max-w-lg mx-auto mb-6">
              Discover talent, view performance stats, and book DJs for your events.
              All data verified onchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/bookings?service=dj-booking"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
              >
                <span>Book a DJ</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] rounded-full text-[#F5F5F5] font-semibold hover:bg-[#252525] transition-colors"
              >
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">{djs.length}</div>
            <div className="text-[#888] text-xs">Active DJs</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">50+</div>
            <div className="text-[#888] text-xs">Genres</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">UK/EU</div>
            <div className="text-[#888] text-xs">Availability</div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#F5F5F5]">24h</div>
            <div className="text-[#888] text-xs">Response Time</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
          {['All', 'House', 'Techno', 'Drum & Bass', 'UK Garage', 'Disco', 'Ambient'].map((genre) => (
            <button
              key={genre}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                genre === 'All'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5]'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* DJ Grid */}
        {djs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {djs.map((dj) => (
              <DJCard key={dj.id} dj={dj} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">No DJs Listed Yet</h2>
            <p className="text-[#888] text-sm mb-6">
              DJ profiles will appear here once they complete their first stream.
            </p>
            <Link
              href="/bookings?service=dj-booking"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold"
            >
              Request DJ Recommendations
            </Link>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-[#F5F5F5] font-bold text-lg mb-1">Need Help Finding the Right DJ?</h3>
              <p className="text-[#888] text-sm">
                Tell us about your event and we&apos;ll recommend the perfect artist.
              </p>
            </div>
            <Link
              href="/bookings?service=dj-booking"
              className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            >
              Get Recommendations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// DJ Card Component
function DJCard({ dj }: { dj: {
  id: string;
  display_name: string;
  avatar_url?: string;
  genres?: string[];
  total_streams?: number;
  total_listeners?: number;
  bio?: string;
  wallet_address: string;
} }) {
  const truncatedAddress = `${dj.wallet_address.slice(0, 6)}...${dj.wallet_address.slice(-4)}`;

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A] hover:border-purple-500/50 transition-all group">
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {dj.avatar_url ? (
            <Image src={dj.avatar_url} alt={dj.display_name} fill className="object-cover" />
          ) : (
            <span className="text-2xl">🎧</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[#F5F5F5] font-bold text-lg truncate">{dj.display_name}</h3>
          <p className="text-[#666] text-xs font-mono">{truncatedAddress}</p>
        </div>
      </div>

      {/* Bio */}
      {dj.bio && (
        <p className="text-[#888] text-sm mb-4 line-clamp-2">{dj.bio}</p>
      )}

      {/* Genres */}
      {dj.genres && dj.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {dj.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 bg-[#0A0A0A] rounded-full text-xs text-[#888]"
            >
              {genre}
            </span>
          ))}
          {dj.genres.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-[#666]">
              +{dj.genres.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0A0A0A] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#F5F5F5]">{dj.total_streams || 0}</div>
          <div className="text-[#888] text-xs">Shows</div>
        </div>
        <div className="bg-[#0A0A0A] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#F5F5F5]">
            {dj.total_listeners ? `${(dj.total_listeners / 1000).toFixed(1)}k` : '0'}
          </div>
          <div className="text-[#888] text-xs">Total Listeners</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/djs/${dj.wallet_address}`}
          className="flex-1 py-2.5 text-center bg-[#0A0A0A] rounded-xl text-[#F5F5F5] text-sm font-medium hover:bg-[#252525] transition-colors"
        >
          View Profile
        </Link>
        <Link
          href={`/bookings?service=dj-booking&dj=${dj.display_name}`}
          className="flex-1 py-2.5 text-center bg-purple-600 rounded-xl text-white text-sm font-medium hover:bg-purple-500 transition-colors"
        >
          Book
        </Link>
      </div>
    </div>
  );
}
