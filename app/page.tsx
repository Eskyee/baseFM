'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLiveStreams, useStreams } from '@/hooks/useStreams';
import { LiveShowCard } from '@/components/LiveShowCard';
import { ShareApp } from '@/components/ShareApp';
import { MoltxFeed } from '@/components/MoltxFeed';
import { TokenSurfacePanel } from '@/components/TokenSurfacePanel';
import {
  getNextUpcomingEvent,
  hasAnyEvents,
} from '@/lib/events/config';

interface DJOfTheDay {
  dj: {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
    genres: string[];
    isVerified: boolean;
    totalShows: number;
  };
  reason: string;
}

/**
 * Renders the baseFM homepage composed of live streams, upcoming shows, events, DJ of the Day, Agentbot feed, quick links, previews, and support/creator sections.
 *
 * Conditionally displays a loading skeleton, a featured live stream (and additional live streams), an upcoming event or events link, the DJ of the Day card (when available), an Agentbot feed, quick navigation links, a raveculture preview, sharing controls, a "Coming Up" carousel for scheduled streams, support actions, GitHub Sponsors card, and creator links.
 *
 * @returns The rendered homepage as a React element
 */
export default function HomePage() {
  const { streams: liveStreams, isLoading: liveLoading } = useLiveStreams();
  const { streams: upcomingStreams, isLoading: upcomingLoading } = useStreams({
    status: ['CREATED', 'PREPARING'],
    limit: 10,
  });
  const [djOfTheDay, setDjOfTheDay] = useState<DJOfTheDay | null>(null);

  useEffect(() => {
    async function fetchDJOfTheDay() {
      try {
        const response = await fetch('/api/dj-of-the-day');
        if (!response.ok) return;
        const data = await response.json();
        if (data.djOfTheDay) {
          setDjOfTheDay(data.djOfTheDay);
        }
      } catch {
        // Optional surface.
      }
    }

    fetchDJOfTheDay();
  }, []);

  const featuredStream = liveStreams[0];
  const otherLiveStreams = liveStreams.slice(1);
  const nextEvent = getNextUpcomingEvent();
  const eventsExist = hasAnyEvents();
  const loading = liveLoading && upcomingLoading;
  const hasLive = liveStreams.length > 0;

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">BaseFM by Agentbot</span>
            <a
              href="https://github.com/Eskyee/baseFM"
              target="_blank"
              rel="noopener noreferrer"
              className="basefm-kicker text-zinc-500 hover:text-white transition-colors"
            >
              Open Source
            </a>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Onchain radio on Base.
              <br />
              <span className="text-zinc-700">Agentbot runs the live station.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              baseFM stays culture-first and open source. Agentbot provides the canonical live state,
              relay truth, and operator tooling so streams, archives, and broadcast recovery are handled
              like production infrastructure instead of guesswork.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/live" className="basefm-button-primary">
              Listen Live
            </Link>
            <Link href="/guide" className="basefm-button-secondary">
              Read Guide
            </Link>
            <a
              href="https://agentbot.sh/basefm/live"
              target="_blank"
              rel="noopener noreferrer"
              className="basefm-button-secondary"
            >
              Agentbot Station
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-px bg-zinc-900 sm:grid-cols-4">
          {[
            {
              label: 'Live Now',
              value: hasLive ? `${liveStreams.length}` : '0',
              detail: hasLive ? 'Canonical playback active' : 'No active program feed',
            },
            {
              label: 'Queued Sets',
              value: `${upcomingStreams.length}`,
              detail: upcomingStreams.length > 0 ? 'Created or preparing' : 'No queued shows',
            },
            {
              label: 'Relays',
              value: 'Agentbot',
              detail: 'Source of truth for live state',
            },
            {
              label: 'Model',
              value: 'Open Source',
              detail: 'baseFM brand with Agentbot ops',
            },
          ].map((item) => (
            <div key={item.label} className="bg-black p-5">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">{item.label}</div>
              <div className="text-xl sm:text-2xl font-bold text-white uppercase">{item.value}</div>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="max-w-2xl mb-8">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Station</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
              {hasLive ? 'Live now.' : 'Off air.'}
              <br />
              <span className="text-zinc-700">
                {hasLive ? 'Agentbot is serving the current program feed.' : 'The station will show the next set here.'}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-black p-6 animate-pulse">
                  <div className="h-3 w-24 bg-zinc-900 mb-4" />
                  <div className="h-32 bg-zinc-900 mb-4" />
                  <div className="h-3 w-40 bg-zinc-900 mb-2" />
                  <div className="h-3 w-28 bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : hasLive && featuredStream ? (
            <div className="space-y-6">
              <div className="basefm-panel p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">Featured program</div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-green-400">
                    <span className="h-2 w-2 bg-green-400" />
                    Live
                  </div>
                </div>
                <LiveShowCard
                  id={featuredStream.id}
                  title={featuredStream.title}
                  djName={featuredStream.djName}
                  djWalletAddress={featuredStream.djWalletAddress}
                  artwork={featuredStream.coverImageUrl}
                  genre={featuredStream.genre}
                  isLive={featuredStream.status === 'LIVE'}
                  isTokenGated={featuredStream.isGated}
                  muxPlaybackId={featuredStream.muxPlaybackId}
                  hlsUrl={featuredStream.hlsPlaybackUrl}
                  useGlobalPlayer
                  variant="featured"
                />
              </div>

              {otherLiveStreams.length > 0 && (
                <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 lg:grid-cols-3">
                  {otherLiveStreams.map((stream) => (
                    <div key={stream.id} className="bg-black p-4">
                      <LiveShowCard
                        id={stream.id}
                        title={stream.title}
                        djName={stream.djName}
                        djWalletAddress={stream.djWalletAddress}
                        artwork={stream.coverImageUrl}
                        genre={stream.genre}
                        isLive
                        isTokenGated={stream.isGated}
                        muxPlaybackId={stream.muxPlaybackId}
                        hlsUrl={stream.hlsPlaybackUrl}
                        useGlobalPlayer
                        variant="compact"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.4fr_1fr]">
              <div className="bg-black p-6 sm:p-8">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">What to do next</div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">
                  No live set is active.
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-xl mb-6">
                  Check the schedule, browse DJs, or read the guide before the next broadcast starts.
                  baseFM keeps the listener surface simple while Agentbot handles the control plane behind it.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/schedule" className="basefm-button-primary">
                    View Schedule
                  </Link>
                  <Link href="/djs" className="basefm-button-secondary">
                    Browse DJs
                  </Link>
                  <Link href="/guide" className="basefm-button-secondary">
                    How It Works
                  </Link>
                </div>
              </div>
              <div className="bg-black p-6 sm:p-8">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Broadcast path</div>
                <div className="space-y-4 text-sm text-zinc-400">
                  {[
                    ['Source', 'CDJs, controller, or recorded mix'],
                    ['Encoder', 'OBS or another RTMP encoder'],
                    ['Agentbot', 'Canonical live state, relay truth, archive policy'],
                    ['baseFM', 'Listener surface and culture layer'],
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[90px_1fr] gap-4 border-t border-zinc-900 pt-4 first:border-t-0 first:pt-0">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</div>
                      <div className="leading-relaxed">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <TokenSurfacePanel
            compact
            title="Token rails"
            subtitle="BaseFM now shows both the Base-side RAVE/baseFM station token and the Solana Agentbot token so the ecosystem split is visible instead of hidden."
          />
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="max-w-2xl mb-8">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Programming</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
              Built for sets,
              <br />
              <span className="text-zinc-700">not streaming confusion.</span>
            </h2>
          </div>

          <div className="grid gap-px bg-zinc-900 lg:grid-cols-2">
            <div className="bg-black p-6 sm:p-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Next event</div>
              {nextEvent ? (
                <Link href={`/events/${nextEvent.slug}`} className="block border border-zinc-800 p-5 hover:border-zinc-600 transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">{nextEvent.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4">{nextEvent.subtitle}</p>
                  <div className="space-y-2 text-xs text-zinc-500">
                    <div>{nextEvent.displayDate}</div>
                    <div>{nextEvent.venue}</div>
                    {nextEvent.headliners.length > 0 && (
                      <div>{nextEvent.headliners.slice(0, 3).join(' · ')}</div>
                    )}
                  </div>
                </Link>
              ) : eventsExist ? (
                <Link href="/events" className="block border border-zinc-800 p-5 hover:border-zinc-600 transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Browse events</h3>
                  <p className="text-sm text-zinc-400">The archive is live even when there is no featured upcoming date.</p>
                </Link>
              ) : (
                <div className="border border-zinc-900 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">No event card yet</h3>
                  <p className="text-sm text-zinc-400">When the next event is scheduled it will anchor this section.</p>
                </div>
              )}
            </div>

            <div className="bg-black p-6 sm:p-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Operating model</div>
              <div className="grid gap-px bg-zinc-900">
                {[
                  ['Open source protocol', 'baseFM stays forkable and public-facing.'],
                  ['Agentbot control plane', 'Live routing, recovery, and relay verification stay consistent.'],
                  ['Wallet-native audience', 'Base wallets, community access, and direct support remain core.'],
                  ['DJ-first flow', 'Hardware and encoder workflows stay familiar while the station handles broadcast ops.'],
                ].map(([title, body]) => (
                  <div key={title} className="bg-black p-4">
                    <div className="text-sm font-bold uppercase tracking-wider text-white mb-2">{title}</div>
                    <p className="text-xs leading-relaxed text-zinc-500">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {djOfTheDay && (
        <section className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
            <div className="max-w-2xl mb-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Featured</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                DJ of the day.
                <br />
                <span className="text-zinc-700">Signal worth following.</span>
              </h2>
            </div>

            <Link
              href={`/djs/${djOfTheDay.dj.slug}`}
              className="grid gap-px bg-zinc-900 lg:grid-cols-[220px_1fr] hover:[&>*]:border-zinc-600"
            >
              <div className="bg-black border border-transparent p-6 flex items-center justify-center">
                <div className="relative h-36 w-36 overflow-hidden border border-zinc-800 bg-zinc-950">
                  {djOfTheDay.dj.avatarUrl ? (
                    <Image
                      src={djOfTheDay.dj.avatarUrl}
                      alt={djOfTheDay.dj.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Image src="/logo.png" alt="" width={56} height={56} className="opacity-40" />
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-black border border-transparent p-6 sm:p-8">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">{djOfTheDay.reason}</div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-white">{djOfTheDay.dj.name}</h3>
                  {djOfTheDay.dj.isVerified && <span className="basefm-kicker text-blue-500">Verified</span>}
                </div>
                <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-black p-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Shows</div>
                    <div className="text-sm font-bold uppercase tracking-wider text-white">{djOfTheDay.dj.totalShows}</div>
                  </div>
                  <div className="bg-black p-4 sm:col-span-2">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Genres</div>
                    <div className="text-sm text-zinc-400">
                      {djOfTheDay.dj.genres.length > 0 ? djOfTheDay.dj.genres.join(' · ') : 'Underground program'}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Agent log</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-8">
                Station notes.
                <br />
                <span className="text-zinc-700">Operator visibility without dashboard clutter.</span>
              </h2>
              <MoltxFeed agentName="Atlas_baseFM" limit={3} />
            </div>

            <div className="space-y-8">
              <div className="basefm-panel p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Quick paths</div>
                <div className="grid gap-px bg-zinc-900">
                  {[
                    ['/guide', 'Guide', 'Start here if you need the cleanest path through the product.'],
                    ['/schedule', 'Schedule', 'See the next shows and time blocks.'],
                    ['/djs', 'DJs', 'Find the artists and their current profiles.'],
                    ['/community', 'Community', 'Token-gated and social surfaces.'],
                    ['/dashboard', 'Dashboard', 'Go backstage if you are operating the station.'],
                  ].map(([href, label, body]) => (
                    <Link key={href} href={href} className="bg-black p-4 hover:bg-zinc-950 transition-colors">
                      <div className="text-sm font-bold uppercase tracking-wider text-white mb-1">{label}</div>
                      <p className="text-xs leading-relaxed text-zinc-500">{body}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="basefm-panel p-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Support the station</div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Support keeps the infrastructure running: radio operations, relay capacity, and cultural programming.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="https://www.coinbase.com/pay?address=eskyee.base.eth&currency=ETH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="basefm-button-primary"
                  >
                    Donate
                  </Link>
                  <Link
                    href="https://base.meme/coin/base:0x1DBf2954FFEC96a333ae20F00c0bC40471ad8888"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="basefm-button-secondary"
                  >
                    Support Token
                  </Link>
                </div>
              </div>

              <ShareApp variant="compact" className="justify-start" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
