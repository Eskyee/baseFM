'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DJ } from '@/types/dj';

const DEFAULT_AVATAR = '/logo.png';

export default function DJsPage() {
  const [djs, setDJs] = useState<DJ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'residents'>('all');

  useEffect(() => {
    async function fetchDJs() {
      try {
        const params = filter === 'residents' ? '?residents=true' : '';
        const res = await fetch(`/api/djs${params}`);
        if (res.ok) {
          const data = await res.json();
          setDJs(data.djs || []);
        }
      } catch (err) {
        console.error('Failed to fetch DJs:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDJs();
  }, [filter]);

  const residents = djs.filter(dj => dj.isResident);
  const guests = djs.filter(dj => !dj.isResident);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5]">DJs</h1>
            <p className="text-[#888] text-sm mt-1">Meet the people behind the music</p>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                filter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('residents')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                filter === 'residents'
                  ? 'bg-white text-black'
                  : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white'
              }`}
            >
              Residents
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-[#1A1A1A] rounded-xl mb-3" />
                <div className="h-5 bg-[#1A1A1A] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#1A1A1A] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : djs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#888]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h2 className="text-[#F5F5F5] text-xl font-bold mb-2">No DJs Yet</h2>
            <p className="text-[#888] text-sm">Be the first to create a profile!</p>
          </div>
        ) : (
          <>
            {/* Residents Section */}
            {residents.length > 0 && filter === 'all' && (
              <section className="mb-12">
                <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
                  Resident DJs
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {residents.map((dj) => (
                    <DJCard key={dj.id} dj={dj} />
                  ))}
                </div>
              </section>
            )}

            {/* All/Guests Section */}
            {(filter === 'residents' ? residents : guests).length > 0 && (
              <section>
                {filter === 'all' && guests.length > 0 && (
                  <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">Guest DJs</h2>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(filter === 'residents' ? residents : guests).map((dj) => (
                    <DJCard key={dj.id} dj={dj} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DJCard({ dj }: { dj: DJ }) {
  const hasAvatar = !!dj.avatarUrl;

  return (
    <Link
      href={`/djs/${dj.slug}`}
      className="group block"
    >
      {/* Avatar */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#1A1A1A] mb-3">
        <img
          src={dj.avatarUrl || DEFAULT_AVATAR}
          alt={dj.name}
          className={`w-full h-full transition-all duration-300 group-hover:scale-105 grayscale group-hover:grayscale-0 ${
            hasAvatar ? 'object-cover' : 'object-contain p-8'
          }`}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {dj.isResident && (
            <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded">
              Resident
            </span>
          )}
          {dj.isVerified && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-medium rounded">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <h3 className="text-[#F5F5F5] font-medium group-hover:text-[#3B82F6] transition-colors">
        {dj.name}
      </h3>

      {/* Genres */}
      {dj.genres && dj.genres.length > 0 && (
        <p className="text-[#888] text-sm line-clamp-1">
          {dj.genres.slice(0, 2).join(', ')}
        </p>
      )}

      {/* Stats */}
      <p className="text-[#666] text-xs mt-1">
        {dj.totalShows} shows
      </p>
    </Link>
  );
}
