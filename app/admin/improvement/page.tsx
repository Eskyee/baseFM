'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { WalletConnect } from '@/components/WalletConnect';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface ImprovementInsight {
  key: string;
  eventType: string;
  severity: 'info' | 'warning' | 'error';
  surface: string;
  count: number;
  lastSeenAt: string;
  sampleDetails: string[];
}

interface RecentEvent {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error';
  surface: string;
  route: string | null;
  details: string | null;
  created_at: string;
}

function severityClass(severity: string) {
  if (severity === 'error') return 'text-red-400';
  if (severity === 'warning') return 'text-yellow-400';
  return 'text-zinc-500';
}

export default function ImprovementPage() {
  const { isConnected } = useAccount();
  const { adminFetch } = useAdminAuth();
  const [insights, setInsights] = useState<ImprovementInsight[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    async function load() {
      try {
        setIsLoading(true);
        const response = await adminFetch('/api/admin/improvement');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load improvement insights');
        }

        setInsights(data.insights || []);
        setRecentEvents(data.recentEvents || []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load improvement insights');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [isConnected, adminFetch]);

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="basefm-panel p-8 text-center">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Admin only</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-4">Improvement Console</h1>
            <p className="max-w-md mx-auto text-sm text-zinc-400 leading-relaxed mb-6">
              Connect an admin wallet to review product friction and the self-improvement queue.
            </p>
            <WalletConnect />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Improvement</span>
            <span className="basefm-kicker text-zinc-500">Self-learning loop</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Product learning.
              <br />
              <span className="text-zinc-700">Fix what real usage breaks.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              This console groups real friction events from the station so the next improvements come from actual failures, broken flows, and repeated user pain.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="basefm-button-secondary">Back to Admin</Link>
            <a href="https://agentbot.sh/dashboard" target="_blank" rel="noopener noreferrer" className="basefm-button-secondary">
              Agentbot Dashboard
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          {error ? (
            <div className="border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 mb-6">{error}</div>
          ) : null}

          {isLoading ? (
            <div className="grid gap-px bg-zinc-900 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-black p-5 animate-pulse">
                  <div className="h-4 w-24 bg-zinc-900 mb-3" />
                  <div className="h-4 w-40 bg-zinc-900 mb-2" />
                  <div className="h-3 w-20 bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Priority insights</div>
                {insights.length === 0 ? (
                  <div className="basefm-panel p-8 text-center">
                    <p className="text-sm text-zinc-400">No learning events recorded yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {insights.map((insight) => (
                      <div key={insight.key} className="basefm-panel p-5">
                        <div className={`text-[10px] uppercase tracking-widest mb-3 ${severityClass(insight.severity)}`}>
                          {insight.severity}
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-tight text-white mb-2">
                          {insight.eventType.replaceAll('_', ' ')}
                        </h2>
                        <div className="text-sm text-zinc-400 mb-4">
                          Surface: {insight.surface} · Count: {insight.count}
                        </div>
                        <div className="text-xs text-zinc-500 mb-4">
                          Last seen: {new Date(insight.lastSeenAt).toLocaleString()}
                        </div>
                        {insight.sampleDetails.length > 0 ? (
                          <div className="space-y-2">
                            {insight.sampleDetails.map((detail) => (
                              <p key={detail} className="text-xs text-zinc-400 leading-relaxed">
                                {detail}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Recent raw events</div>
                <div className="grid gap-px bg-zinc-900">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="bg-black p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className={`text-[10px] uppercase tracking-widest ${severityClass(event.severity)}`}>
                            {event.severity}
                          </div>
                          <div className="text-sm text-zinc-300 mt-1">
                            {event.event_type} · {event.surface}
                          </div>
                          {event.details ? <p className="text-xs text-zinc-500 mt-2">{event.details}</p> : null}
                          {event.route ? <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-2">{event.route}</p> : null}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600">
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
