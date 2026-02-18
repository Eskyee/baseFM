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
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-white font-mono mb-2">
            Collectives & Promoters
          </h1>
          <p className="text-[#888] font-mono text-sm mb-6">
            The crews behind the underground
          </p>
          <Link
            href="/promoters"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-mono font-semibold text-sm hover:bg-gray-100 transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register Your Crew
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {typeFilters.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-mono whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-white text-black'
                  : 'bg-[#1A1A1A] text-[#888] hover:text-white'
              }`}
            >
              {type === 'all' ? 'All' : TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#2A2A2A]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-[#2A2A2A] rounded w-32" />
                    <div className="h-3 bg-[#2A2A2A] rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Promoters List */}
        {!isLoading && filteredPromoters.length > 0 && (
          <div className="space-y-4">
            {filteredPromoters.map((promoter) => (
              <Link
                key={promoter.id}
                href={`/collectives/${promoter.slug}`}
                className="block bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 hover:border-purple-500/50 transition-all active:scale-[0.98]"
              >
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {promoter.logoUrl ? (
                      <Image
                        src={promoter.logoUrl}
                        alt={promoter.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-2xl font-mono">
                        {promoter.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-mono font-semibold truncate">
                        {promoter.name}
                      </h3>
                      {promoter.isVerified && (
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>

                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
                        {TYPE_LABELS[promoter.type]}
                      </span>
                      {promoter.isFeatured && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-mono">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Bio */}
                    {promoter.bio && (
                      <p className="text-[#888] text-sm font-mono line-clamp-2 mb-2">
                        {promoter.bio}
                      </p>
                    )}

                    {/* Location & Stats */}
                    <div className="flex items-center gap-4 text-xs text-[#666] font-mono">
                      {promoter.city && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {promoter.city}
                        </span>
                      )}
                      {promoter.totalEvents > 0 && (
                        <span>{promoter.totalEvents} events</span>
                      )}
                    </div>

                    {/* Genres */}
                    {promoter.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {promoter.genres.slice(0, 4).map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-0.5 bg-[#0A0A0A] text-[#666] rounded text-[10px] font-mono"
                          >
                            {genre}
                          </span>
                        ))}
                        {promoter.genres.length > 4 && (
                          <span className="px-2 py-0.5 text-[#555] text-[10px] font-mono">
                            +{promoter.genres.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-[#555] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPromoters.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white font-mono mb-2">
              {filter === 'all' ? 'No collectives yet' : `No ${TYPE_LABELS[filter as PromoterType]}s yet`}
            </h3>
            <p className="text-[#888] font-mono text-sm mb-6">
              Be the first to register your crew
            </p>
            <Link
              href="/promoters"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-mono font-semibold hover:bg-purple-600 transition-all"
            >
              Register Your Crew
            </Link>
          </div>
        )}

        {/* Register CTA */}
        {!isLoading && filteredPromoters.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/promoters"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-xl font-mono font-medium hover:border-purple-500/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Register Your Crew
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
