'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useSignMessage } from 'wagmi';
import { generateNonce, createAuthMessage } from '@/lib/auth/wallet';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStreams } from '@/hooks/useStreams';
import { useDJAccess } from '@/hooks/useDJAccess';
import { StreamCard } from '@/components/StreamCard';
import { WalletConnect } from '@/components/WalletConnect';
import { TokenSurfacePanel } from '@/components/TokenSurfacePanel';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

function formatAddress(address?: string | null) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function statusClasses(kind: 'active' | 'idle' | 'error') {
  if (kind === 'active') return 'border border-green-500/30 bg-green-500/10 text-green-300';
  if (kind === 'error') return 'border border-red-500/30 bg-red-500/10 text-red-300';
  return 'border border-zinc-700 bg-black text-zinc-400';
}

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [broadcastName, setBroadcastName] = useState('DJ Escaba');
  const [isArming, setIsArming] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const [formError, setFormError] = useState<string | null>(null);

  const { hasAccess, isAdmin, isChecking, balance, requiredAmount, tokenSymbol } = useDJAccess();
  const { streams, isLoading } = useStreams({
    djWalletAddress: address,
  });

  const liveStreams = useMemo(() => streams.filter((stream) => stream.status === 'LIVE'), [streams]);
  const preparingStreams = useMemo(() => streams.filter((stream) => stream.status === 'PREPARING'), [streams]);
  const scheduledStreams = useMemo(() => streams.filter((stream) => stream.status === 'CREATED'), [streams]);
  const pastStreams = useMemo(() => streams.filter((stream) => stream.status === 'ENDED'), [streams]);
  const currentSet = liveStreams[0] || preparingStreams[0] || null;


  const clearStaleStreams = async () => {
    if (!address) return;
    setIsCleaning(true);
    try {
      const nonce = generateNonce();
      const timestamp = new Date().toISOString();
      const message = createAuthMessage(nonce);
      const signature = await signMessageAsync({ message });

      const res = await fetch('/api/streams/cleanup-stale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          djWalletAddress: address,
          signature,
          message,
          timestamp,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cleanup failed');

      toast.success(data.message || 'Stale streams cleared.');
      router.refresh();
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to clear stale streams');
    } finally {
      setIsCleaning(false);
    }
  };

  const armBroadcast = async () => {
    if (!address) return;
    const name = broadcastName.trim();
    if (!name) {
      setFormError('Enter a DJ or show name first.');
      return;
    }

    setIsArming(true);
    setFormError(null);

    try {
      const response = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          djName: name,
          djWalletAddress: address,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to arm broadcast');
      }

      router.push(`/dashboard/stream/${data.stream.id}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to arm broadcast');
    } finally {
      setIsArming(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">DJ Dashboard</span>
            <span className="basefm-kicker text-zinc-500">Pioneer mode</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              Broadcast like Agentbot.
              <br />
              <span className="text-zinc-700">Keep your DJ workflow.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              Use the same guided flow DJs already like on Agentbot. Keep your decks, mixer, and OBS habits.
              baseFM handles the station surface while your stream page handles credentials, start, stop, and recovery.
            </p>
          </div>

          <div className="border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="text-[10px] uppercase tracking-widest text-blue-300 mb-3">Do this first</div>
            <div className="space-y-2 text-sm text-zinc-200">
              <p>1. Connect your wallet.</p>
              <p>2. Confirm your BASEFM gate is eligible.</p>
              <p>3. Name your set and press Go Live.</p>
              <p>4. Copy the RTMP credentials from the next page and send your mixer master through OBS.</p>
            </div>
          </div>

          <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Decks', 'Keep track selection, cueing, tempo, and EQ on your Pioneer hardware or Rekordbox.'],
              ['Mixer', 'Treat baseFM like the broadcast rack after your master out.'],
              ['Encoder', 'OBS or your encoder sends the program feed to the station.'],
              ['Station', 'Use the stream page for credentials, live state, and recovery if OBS drops.'],
            ].map(([label, body]) => (
              <div key={label} className="bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">{label}</div>
                <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <TokenSurfacePanel
            compact
            title="Access tokens"
            subtitle="The DJ gate here still checks the Base-side RAVE/baseFM token. The Solana Agentbot token remains the wider ecosystem and community path around the station."
          />
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="max-w-3xl space-y-px">
            <div className="basefm-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">Step 01</span>
                  <span className="text-sm font-bold uppercase tracking-wider">Connect Wallet</span>
                </div>
                {isConnected ? (
                  <span className={`px-3 py-1 text-[10px] uppercase tracking-widest ${statusClasses('active')}`}>
                    Connected
                  </span>
                ) : null}
              </div>

              {!isConnected ? (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Connect the Base wallet that holds your DJ access tokens.
                  </p>
                  <WalletConnect />
                </div>
              ) : (
                <div className="space-y-3">
                  <code className="text-sm text-zinc-300">{formatAddress(address)}</code>
                  <p className="text-xs uppercase tracking-widest text-zinc-600">Base mainnet wallet</p>
                </div>
              )}
            </div>

            <div className="basefm-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">Step 02</span>
                  <span className="text-sm font-bold uppercase tracking-wider">Gate Check</span>
                </div>
                {isChecking ? (
                  <span className={`px-3 py-1 text-[10px] uppercase tracking-widest ${statusClasses('idle')}`}>
                    Checking
                  </span>
                ) : isConnected ? (
                  <span className={`px-3 py-1 text-[10px] uppercase tracking-widest ${statusClasses(hasAccess ? 'active' : 'error')}`}>
                    {isAdmin ? 'Admin' : hasAccess ? 'Eligible' : 'Insufficient'}
                  </span>
                ) : null}
              </div>

              {!isConnected ? (
                <p className="text-sm text-zinc-500">Connect first to verify the DJ token gate.</p>
              ) : (
                <div className="space-y-4">
                  {isAdmin ? (
                    <div className="border border-blue-500/20 bg-blue-500/10 p-4">
                      <p className="text-blue-300 text-[10px] uppercase tracking-widest mb-2">Admin Override</p>
                      <p className="text-sm text-zinc-200">
                        This wallet is configured as a baseFM admin, so the DJ dashboard stays open even if the public token threshold is not met.
                      </p>
                    </div>
                  ) : null}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{balance}</span>
                    <span className="text-xs uppercase tracking-widest text-zinc-500">{tokenSymbol}</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Required: {requiredAmount} {tokenSymbol} · Gate token: {DJ_TOKEN_CONFIG.symbol} on Base
                  </p>
                  {!hasAccess ? (
                    <div className="border border-zinc-800 bg-black p-4">
                      <p className="text-sm text-zinc-300 mb-2">
                        You need {requiredAmount} {tokenSymbol} to open the DJ path.
                      </p>
                      <a
                        href={`https://basescan.org/token/${DJ_TOKEN_CONFIG.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] uppercase tracking-widest text-blue-500 hover:text-white transition-colors"
                      >
                        View token on BaseScan →
                      </a>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="basefm-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">Step 03</span>
                  <span className="text-sm font-bold uppercase tracking-wider">Broadcast Arm</span>
                </div>
                {currentSet ? (
                  <span className={`px-3 py-1 text-[10px] uppercase tracking-widest ${statusClasses('active')}`}>
                    Active set
                  </span>
                ) : null}
              </div>

              {currentSet ? (
                <div className="space-y-4">
                  <div className="border border-zinc-800 bg-black p-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Current set</div>
                    <div className="text-lg font-bold uppercase tracking-tight text-white">{currentSet.title}</div>
                    <p className="mt-2 text-sm text-zinc-400">
                      {currentSet.status === 'LIVE'
                        ? 'Your stream is live. Use the manage page for stop/start, Mux status, and credentials.'
                        : 'Your stream is armed. Finish setup or check Mux status from the manage page.'}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/stream/${currentSet.id}`}
                    className="basefm-button-primary"
                  >
                    Manage Current Set
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">DJ / Show Name</label>
                    <input
                      type="text"
                      value={broadcastName}
                      onChange={(event) => setBroadcastName(event.target.value)}
                      placeholder="DJ Escaba"
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono"
                      disabled={!hasAccess || !isConnected || isArming}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={armBroadcast}
                      disabled={!hasAccess || !isConnected || isArming}
                      className="basefm-button-primary disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
                    >
                      {isArming ? 'Arming...' : 'Go Live'}
                    </button>
                    <Link href="/dashboard/create" className="basefm-button-secondary">
                      Advanced Form
                    </Link>
                  </div>

                  {formError ? (
                    <div className="border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                      {formError}
                    </div>
                  ) : null}

                  <p className="text-xs text-zinc-500">
                    After this step, baseFM sends you to the stream control page for RTMP credentials, Mux setup, and live-state checks.
                  </p>
                </div>
              )}
            </div>

            <div className="basefm-panel p-6">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">If OBS Stops</div>
              <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
                {[
                  ['Check encoder', 'Reconnect OBS with the same server URL and stream key first.'],
                  ['Manage stream page', 'Use Check Mux Status or Start Stream from the stream control page.'],
                  ['Audio path', 'Verify your mixer master is still routed into OBS and not muted.'],
                  ['Fresh recovery', 'If the session is broken beyond repair, end it and arm a fresh set from this dashboard.'],
                ].map(([title, body]) => (
                  <div key={title} className="bg-black p-4">
                    <div className="text-sm font-bold uppercase tracking-wider text-white mb-2">{title}</div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-black p-4 border border-orange-500/20">
                <div className="text-sm font-bold uppercase tracking-wider text-orange-400 mb-2">Emergency Reset</div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  If your session is stuck or basefm.space shows you as live but you aren&apos;t, use this to force-clear your state.
                </p>
                <button
                  onClick={clearStaleStreams}
                  disabled={isCleaning || !isConnected}
                  className="w-full py-2 border border-orange-500/40 text-orange-400 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-black transition-all disabled:opacity-50"
                >
                  {isCleaning ? 'Clearing...' : 'Clear Stale Sessions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14 space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Control</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                Your sets.
                <br />
                <span className="text-zinc-700">Current, queued, and past.</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/profile" className="basefm-button-secondary">
                Profile
              </Link>
              <Link href="/dashboard/analytics" className="basefm-button-secondary">
                Stats
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-px bg-zinc-900 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-black p-6 animate-pulse">
                  <div className="h-32 bg-zinc-900 mb-4" />
                  <div className="h-3 w-32 bg-zinc-900 mb-2" />
                  <div className="h-3 w-24 bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : streams.length === 0 ? (
            <div className="basefm-panel p-8 text-center">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">No streams yet</div>
              <p className="max-w-md mx-auto text-sm text-zinc-400 leading-relaxed mb-6">
                When you arm your first broadcast it will appear here for live management and later archive review.
              </p>
              <button
                onClick={armBroadcast}
                disabled={!hasAccess || !isConnected || isArming}
                className="basefm-button-primary disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isArming ? 'Arming...' : 'Create First Set'}
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {(liveStreams.length > 0 || preparingStreams.length > 0) && (
                <section>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Active</div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...liveStreams, ...preparingStreams].map((stream) => (
                      <StreamCard key={stream.id} stream={stream} showDJControls linkPrefix="/dashboard" />
                    ))}
                  </div>
                </section>
              )}

              {scheduledStreams.length > 0 && (
                <section>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Queued</div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {scheduledStreams.map((stream) => (
                      <StreamCard key={stream.id} stream={stream} showDJControls linkPrefix="/dashboard" />
                    ))}
                  </div>
                </section>
              )}

              {pastStreams.length > 0 && (
                <section>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Past</div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pastStreams.slice(0, 6).map((stream) => (
                      <StreamCard key={stream.id} stream={stream} showDJControls linkPrefix="/dashboard" />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
