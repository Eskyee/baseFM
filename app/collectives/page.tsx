'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Promoter, PromoterType } from '@/types/event';

const TYPE_LABELS: Record<PromoterType, string> = {
  promoter: 'Promoter',
  collective: 'Collective',
  venue: 'Venue',
  label: 'Label',
  artist: 'Artist',
  organization: 'Organization',
};

const DEFAULT_LOGO = '/logo.png';

export default function CollectivesPage() {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<PromoterType | 'all'>('all');

  useEffect(() => {
    async function loadPromoters() {
      try {
        const res = await fetch('/api/promoters');
        if (res.ok) {
          const data = await res.json();
          setPromoters(data.promoters || []);
        }
      } catch (err) {
        console.error('Failed to load promoters:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPromoters();
  }, []);

  const filteredPromoters = promoters.filter(p => {
    if (filter === 'all') return true;
    return p.type === filter;
  });

  const typeFilters: (PromoterType | 'all')[] = ['all', 'promoter', 'collective', 'venue', 'label', 'organization'];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-b from-purple-900/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-3">
              Collectives & Promoters
            </h1>
            <p className="text-[#888] text-sm sm:text-base max-w-lg mx-auto mb-6">
              Discover crews, collectives, venues, and labels in the baseFM community.
            </p>
            <Link
              href="/promoters/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
          {typeFilters.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-white text-black'
                  : 'bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5]'
              }`}
            >
              {type === 'all' ? 'All' : TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Promoters Grid */}
        {!isLoading && filteredPromoters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPromoters.map((promoter) => (
              <Link
                key={promoter.id}
                href={`/collectives/${promoter.slug}`}
                className="bg-[#1A1A1A] rounded-xl overflow-hidden group hover:bg-[#222] transition-colors"
              >
                {/* Cover/Logo */}
                <div className="relative aspect-video bg-gradient-to-br from-purple-900/60 via-black to-black">
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

                  {/* Logo overlay */}
                  <div className="absolute bottom-3 left-3">
                    <div className="w-12 h-12 rounded-lg bg-black/80 backdrop-blur overflow-hidden">
                      <Image
                        src={promoter.logoUrl || DEFAULT_LOGO}
                        alt={promoter.name}
                        width={48}
                        height={48}
                        className={promoter.logoUrl ? 'object-cover' : 'object-contain p-2'}
                      />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur text-white text-xs font-medium rounded-full">
                      {TYPE_LABELS[promoter.type]}
                    </span>
                    {promoter.isVerified && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-[#F5F5F5] font-bold text-lg group-hover:text-white transition-colors line-clamp-1">
                    {promoter.name}
                  </h3>
                  {promoter.bio && (
                    <p className="text-[#888] text-sm mt-1 line-clamp-2">{promoter.bio}</p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2C2C2E]">
                    <div className="flex items-center gap-2 text-sm text-[#666]">
                      {promoter.city && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {promoter.city}
                        </span>
                      )}
                    </div>
                    <span className="text-[#666] text-sm">
                      {promoter.totalEvents} event{promoter.totalEvents !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Genres */}
                  {promoter.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {promoter.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-0.5 bg-[#0A0A0A] rounded-full text-xs text-[#888]"
                        >
                          {genre}
                        </span>
                      ))}
                      {promoter.genres.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-[#666]">
                          +{promoter.genres.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPromoters.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#F5F5F5] mb-2">
              {filter === 'all' ? 'No collectives yet' : `No ${TYPE_LABELS[filter as PromoterType]}s yet`}
            </h3>
            <p className="text-[#888] text-sm mb-6">
              Be the first to create a profile
            </p>
            <Link
              href="/promoters/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all"
            >
              Create Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
