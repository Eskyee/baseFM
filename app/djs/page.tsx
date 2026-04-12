'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DJ } from '@/types/dj';

const DEFAULT_AVATAR = '/logo.png';

type Filter = 'all' | 'residents';

function DJsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterParam = searchParams.get('filter') as Filter | null;

  const [djs, setDJs] = useState<DJ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>(filterParam === 'residents' ? 'residents' : 'all');

  const handleFilterChange = (nextFilter: Filter) => {
    setFilter(nextFilter);
    if (nextFilter === 'all') {
      router.push('/djs', { scroll: false });
    } else {
      router.push(`/djs?filter=${nextFilter}`, { scroll: false });
    }
  };

  useEffect(() => {
    setFilter(filterParam === 'residents' ? 'residents' : 'all');
  }, [filterParam]);

  useEffect(() => {
    async function fetchDJs() {
      try {
        setIsLoading(true);
        const params = filter === 'residents' ? '?residents=true' : '';
        const response = await fetch(`/api/djs${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch DJs');
        }

        const data = await response.json();
        setDJs(data.djs || []);
      } catch (error) {
        console.error('Failed to fetch DJs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDJs();
  }, [filter]);

  const residents = djs.filter((dj) => dj.isResident);
  const guests = djs.filter((dj) => !dj.isResident);
  const visibleDjs = filter === 'residents' ? residents : guests;

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">DJs</span>
            <span className="basefm-kicker text-zinc-500">People behind the station</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Meet the DJs.
              <br />
              <span className="text-zinc-700">Residents, guests, and selectors.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              The station is only as good as the people running it. Browse resident DJs, discover guests, and open each profile for shows, links, and current activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleFilterChange('all')}
              className={filter === 'all' ? 'basefm-button-primary' : 'basefm-button-secondary'}
            >
              All DJs
            </button>
            <button
              onClick={() => handleFilterChange('residents')}
              className={filter === 'residents' ? 'basefm-button-primary' : 'basefm-button-secondary'}
            >
              Residents
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20 space-y-10">
          {isLoading ? (
            <div className="grid gap-px bg-zinc-900 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-black p-6 animate-pulse">
                  <div className="aspect-square bg-zinc-900 mb-4" />
                  <div className="h-4 w-32 bg-zinc-900 mb-2" />
                  <div className="h-3 w-20 bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : djs.length === 0 ? (
            <div className="basefm-panel p-8 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">No DJs yet</div>
              <p className="max-w-md mx-auto text-sm text-zinc-400 leading-relaxed">
                This roster will populate as DJs create profiles and attach sets to the station.
              </p>
            </div>
          ) : (
            <>
              {filter === 'all' && residents.length > 0 ? (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Residents</div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {residents.map((dj) => (
                      <DJCard key={dj.id} dj={dj} />
                    ))}
                  </div>
                </div>
              ) : null}

              {visibleDjs.length > 0 ? (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">
                    {filter === 'residents' ? 'Resident roster' : 'Guests'}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {visibleDjs.map((dj) => (
                      <DJCard key={dj.id} dj={dj} />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function DJCard({ dj }: { dj: DJ }) {
  const hasAvatar = Boolean(dj.avatarUrl);

  return (
    <Link href={`/djs/${dj.slug}`} className="basefm-panel hover:bg-zinc-950 transition-colors">
      <div className="aspect-square relative bg-black border-b border-zinc-900 overflow-hidden">
        <Image
          src={dj.avatarUrl || DEFAULT_AVATAR}
          alt={dj.name}
          fill
          className={hasAvatar ? 'object-cover grayscale hover:grayscale-0 transition-all' : 'object-contain p-10'}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {dj.isResident ? <span className="basefm-kicker text-blue-500">Resident</span> : null}
          {dj.isVerified ? <span className="basefm-kicker text-zinc-500">Verified</span> : null}
        </div>
        <h2 className="text-lg font-bold uppercase tracking-tight text-white mb-2">{dj.name}</h2>
        {dj.genres && dj.genres.length > 0 ? (
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">{dj.genres.slice(0, 3).join(' · ')}</p>
        ) : null}
        <div className="text-[10px] uppercase tracking-widest text-zinc-600">{dj.totalShows} shows</div>
      </div>
    </Link>
  );
}

function DJsPageSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="animate-pulse space-y-4 max-w-4xl">
          <div className="h-6 w-28 bg-zinc-900" />
          <div className="h-16 w-96 bg-zinc-900" />
          <div className="h-4 w-[32rem] bg-zinc-900" />
        </div>
      </section>
    </main>
  );
}

export default function DJsPage() {
  return (
    <Suspense fallback={<DJsPageSkeleton />}>
      <DJsContent />
    </Suspense>
  );
}
