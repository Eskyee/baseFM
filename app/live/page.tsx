'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLiveStreams } from '@/hooks/useStreams';
import { LiveShowCard } from '@/components/LiveShowCard';
import { reportProductLearningEvent } from '@/lib/product-learning';

export default function LivePage() {
  const { streams, isLoading, error } = useLiveStreams();
  const primary = streams[0] || null;
  const others = streams.slice(1);

  useEffect(() => {
    if (!error) return;

    reportProductLearningEvent('live-page-error', {
      eventType: 'live_page_error',
      severity: 'error',
      surface: 'live',
      route: '/live',
      details: error,
    });
  }, [error]);

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Live</span>
            <span className="basefm-kicker text-zinc-500">Canonical station feed</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              baseFM live.
              <br />
              <span className="text-zinc-700">Real station. Real playback.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              This page follows the real current baseFM program feed. If something is live, you can start it here and keep browsing with the global player. If nothing is live, the station tells you honestly instead of pretending.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          {isLoading ? (
            <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-black p-6 animate-pulse">
                <div className="h-4 w-24 bg-zinc-900 mb-4" />
                <div className="h-64 bg-zinc-900 mb-4" />
                <div className="h-4 w-48 bg-zinc-900 mb-2" />
                <div className="h-4 w-32 bg-zinc-900" />
              </div>
              <div className="bg-black p-6 animate-pulse">
                <div className="h-4 w-20 bg-zinc-900 mb-6" />
                <div className="space-y-4">
                  <div className="h-12 bg-zinc-900" />
                  <div className="h-12 bg-zinc-900" />
                  <div className="h-12 bg-zinc-900" />
                </div>
              </div>
            </div>
          ) : primary ? (
            <div className="space-y-8">
              <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="bg-black p-6 sm:p-8">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Now playing</div>
                  <LiveShowCard
                    id={primary.id}
                    title={primary.title}
                    djName={primary.djName}
                    djWalletAddress={primary.djWalletAddress}
                    artwork={primary.coverImageUrl}
                    genre={primary.genre}
                    isLive
                    isTokenGated={primary.isGated}
                    muxPlaybackId={primary.muxPlaybackId}
                    hlsUrl={primary.hlsPlaybackUrl}
                    useGlobalPlayer
                    variant="featured"
                  />
                </div>

                <div className="bg-black p-6 sm:p-8">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Station facts</div>
                  <div className="grid gap-px bg-zinc-900">
                    {[
                      ['DJ', primary.djName],
                      ['Title', primary.title],
                      ['Genre', primary.genre || 'Underground program'],
                      ['Gate', primary.isGated ? 'Token gated' : 'Open listen'],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-black p-4">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{label}</div>
                        <div className="text-sm text-zinc-300 leading-relaxed">{value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600">How to use this</div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Press the live card to start playback. The global player keeps the stream alive while you move around the site.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/stream/${primary.id}`} className="basefm-button-secondary">
                        Open Stream Page
                      </Link>
                      <Link href="/schedule" className="basefm-button-secondary">
                        View Schedule
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {others.length > 0 ? (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Also live</div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {others.map((stream) => (
                      <LiveShowCard
                        key={stream.id}
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
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-black p-6 sm:p-8">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Station status</div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-4">
                  Off air.
                  <br />
                  <span className="text-zinc-700">Nothing is live right now.</span>
                </h2>
                <p className="max-w-xl text-sm text-zinc-400 leading-relaxed mb-6">
                  No fake player, no dead feed. Check the schedule, browse DJs, or come back when the next set starts.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/schedule" className="basefm-button-primary">
                    View Schedule
                  </Link>
                  <Link href="/djs" className="basefm-button-secondary">
                    Browse DJs
                  </Link>
                </div>
              </div>

              <div className="bg-black p-6 sm:p-8">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">If this seems wrong</div>
                <div className="space-y-4 text-sm text-zinc-400">
                  <p>If a DJ says they are live but this page is empty, the issue is upstream in the broadcast chain or Mux state, not the listener page alone.</p>
                  <p>Agentbot remains the canonical live source for the station and downstream relay truth.</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://agentbot.sh/basefm/live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="basefm-button-secondary"
                  >
                    Check Agentbot Station
                  </a>
                  <Link href="/guide" className="basefm-button-secondary">
                    Read Guide
                  </Link>
                </div>
              </div>
            </div>
          )}

          {error ? (
            <div className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
              {error}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
