'use client';

import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStreams } from '@/hooks/useStreams';
import { useDJAccess } from '@/hooks/useDJAccess';
import { StreamCard } from '@/components/StreamCard';
import { WalletConnect } from '@/components/WalletConnect';
import { reportProductLearningEvent } from '@/lib/product-learning';
import { TokenSurfacePanel } from '@/components/TokenSurfacePanel';
import { useToastActions } from '@/components/ui/Toast';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

function formatAddress(address?: string | null) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function StatusPill({ status, label }: { status: 'active' | 'idle' | 'error' | 'offline'; label: string }) {
  const classes = {
    active: 'border border-green-500/30 bg-green-500/10 text-green-300',
    idle: 'border border-amber-500/30 bg-amber-500/10 text-amber-300',
    error: 'border border-red-500/30 bg-red-500/10 text-red-300',
    offline: 'border border-zinc-700 bg-black text-zinc-400',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono ${classes[status]}`}>
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const toast = useToastActions();
  const [broadcastName, setBroadcastName] = useState('DJ Escaba');
  const [djLocation, setDjLocation] = useState('');
  const [streamMode, setStreamMode] = useState<'audio' | 'playlist' | 'video'>('audio');
  const [isArming, setIsArming] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [xStreamKey, setXStreamKey] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('basefm_x_stream_key') || '';
    return '';
  });
  const [youtubeRelayUrl, setYoutubeRelayUrl] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('basefm_youtube_relay_url') || '';
    return '';
  });
  const [relaySaved, setRelaySaved] = useState(false);

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
      const res = await fetch('/api/streams/cleanup-stale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ djWalletAddress: address }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cleanup failed');

      toast.success(data.message || 'Stale streams cleared.');
      router.refresh();
    } catch (error) {
      console.error('Cleanup error:', error);
      const msg = error instanceof Error ? error.message : 'Failed to clear stale streams';
      reportProductLearningEvent('dashboard-cleanup-error', {
        eventType: 'cleanup_error',
        severity: 'warning',
        surface: 'dashboard',
        route: '/dashboard',
        details: msg,
      });
      toast.error(msg);
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
      const msg = error instanceof Error ? error.message : 'Failed to arm broadcast';
      reportProductLearningEvent('dashboard-arm-error', {
        eventType: 'arm_broadcast_error',
        severity: 'error',
        surface: 'dashboard',
        route: '/dashboard',
        details: msg,
      });
      setFormError(msg);
    } finally {
      setIsArming(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">DJ Stream</span>
            <span className="basefm-kicker text-zinc-500">Pioneer Mode</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-[0.92]">
              Rekordbox-Friendly Layout.
              <br />
              <span className="text-zinc-700">Keep your DJ workflow.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              Keep your normal Pioneer / Rekordbox muscle memory. baseFM handles broadcast and relay control, not your deck workflow.
            </p>
          </div>

          {/* Do This First */}
          <div className="border border-orange-500/20 bg-orange-500/10 p-4">
            <div className="text-[10px] uppercase tracking-widest text-orange-400 mb-3">Do This First</div>
            <div className="space-y-2 text-sm text-zinc-200">
              <p>1. Connect your wallet.</p>
              <p>2. Confirm your access is eligible.</p>
              <p>3. Name your set and press Go Live.</p>
              <p>4. Send your mixer master out through OBS to the RTMP target below.</p>
            </div>
          </div>

          {/* Deck / Mixer / Broadcast / Relays */}
          <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Deck A / B', 'Keep track selection, cueing, tempo, EQ, and channel faders on your Pioneer hardware or inside Rekordbox.'],
              ['Mixer', 'Treat baseFM like the broadcast rack after your mixer. Your master output stays the source of truth.'],
              ['Broadcast', 'OBS or your encoder sends the master program feed to baseFM. No need to relearn DJ controls to go live.'],
              ['Relays', 'baseFM manages first-party playback, basefm.space, and optional downstream relays like YouTube.'],
            ].map(([label, body]) => (
              <div key={label} className="bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">{label}</div>
                <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Signal Path */}
          <div className="border border-zinc-800 bg-black p-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Signal Path</div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { label: 'Source', value: 'CDJ / XDJ / DDJ / Rekordbox' },
                { label: 'Mixer', value: 'Master Out' },
                { label: 'Encoder', value: 'OBS / RTMP' },
                { label: 'Station', value: 'baseFM / Relays' },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="border border-zinc-800 p-3 flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{item.label}</div>
                    <div className="text-xs text-zinc-300">{item.value}</div>
                  </div>
                  {i < 3 && (
                    <svg className="w-4 h-4 text-zinc-700 flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          <TokenSurfacePanel
            compact
            title="Access tokens"
            subtitle="The DJ gate checks the Base-side BASEFM token. The Solana Agentbot token remains the wider ecosystem and community path."
          />
        </div>
      </section>

      {/* Steps */}
      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="max-w-3xl space-y-px">
            {/* Step 1: Wallet */}
            <div className="border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">Step 01</span>
                  <span className="text-sm font-bold uppercase tracking-wider">Connect Wallet</span>
                </div>
                {isConnected && <StatusPill status="active" label="Connected" />}
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
                  <div className="flex items-center gap-4">
                    <code className="text-sm text-zinc-300">{formatAddress(address)}</code>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-600">Disconnect</span>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-zinc-600">Base mainnet wallet</p>
                </div>
              )}
            </div>

            {/* Step 2: Access Check */}
            <div className="border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">Step 02</span>
                  <span className="text-sm font-bold uppercase tracking-wider">Check Access</span>
                </div>
                {isChecking ? (
                  <StatusPill status="idle" label="Checking" />
                ) : isConnected ? (
                  <StatusPill status={hasAccess ? 'active' : 'error'} label={isAdmin ? 'Admin' : hasAccess ? 'Eligible' : 'Insufficient'} />
                ) : null}
              </div>

              {!isConnected ? (
                <p className="text-sm text-zinc-500">Connect first to verify the DJ token gate.</p>
              ) : (
                <div className="space-y-4">
                  {isAdmin && (
                    <div className="border border-blue-500/20 bg-blue-500/10 p-4">
                      <p className="text-blue-300 text-[10px] uppercase tracking-widest mb-2">Admin Override</p>
                      <p className="text-sm text-zinc-200">
                        This wallet is configured as a baseFM admin, so the DJ dashboard stays open even if the public token threshold is not met.
                      </p>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{balance}</span>
                    <span className="text-xs uppercase tracking-widest text-zinc-500">{tokenSymbol}</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Required: {requiredAmount} {tokenSymbol} · Gate: ${DJ_TOKEN_CONFIG.symbol} token on Base
                  </p>
                  {!hasAccess && (
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
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Name Your Set */}
            <div className="border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">Step 03</span>
                  <span className="text-sm font-bold uppercase tracking-wider">Name Your Set</span>
                </div>
                {currentSet && <StatusPill status="active" label="Active set" />}
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
                  <Link href={`/dashboard/stream/${currentSet.id}`} className="basefm-button-primary">
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
                      onChange={(e) => setBroadcastName(e.target.value)}
                      placeholder="DJ YourName"
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono"
                      disabled={!hasAccess || !isConnected || isArming}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">City / Location</label>
                    <input
                      type="text"
                      value={djLocation}
                      onChange={(e) => setDjLocation(e.target.value)}
                      placeholder="London, UK"
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono"
                      disabled={!hasAccess || !isConnected || isArming}
                    />
                    <p className="mt-1 text-[10px] text-zinc-600">Optional. Leave it blank to go live faster.</p>
                  </div>

                  {/* Stream Mode */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Stream Mode</label>
                    <div className="grid gap-px bg-zinc-800 sm:grid-cols-3">
                      {[
                        { value: 'audio' as const, label: 'Audio Only', desc: 'Default. Lowest friction for DJ sets.' },
                        { value: 'playlist' as const, label: 'Playlist', desc: 'Audio concat. Ordered tracks via ffmpeg.' },
                        { value: 'video' as const, label: 'Video', desc: 'Artwork loop. When you want a video track.' },
                      ].map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setStreamMode(mode.value)}
                          className={`bg-black p-4 text-left transition-colors ${
                            streamMode === mode.value
                              ? 'bg-zinc-950 border border-zinc-700'
                              : 'hover:bg-zinc-950'
                          }`}
                        >
                          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">{mode.label}</div>
                          <p className="text-[10px] text-zinc-500">{mode.desc}</p>
                          {streamMode === mode.value && <div className="mt-2 h-2 w-2 bg-blue-500" />}
                        </button>
                      ))}
                    </div>
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

                  {formError && (
                    <div className="border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                      {formError}
                    </div>
                  )}

                  {isConnected && (
                    <p className="text-xs text-zinc-500">
                      Access wallet: <span className="font-mono text-zinc-300">{formatAddress(address)}</span> · using {DJ_TOKEN_CONFIG.symbol} gate path
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Distribution / Station Health */}
            <div className="border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Distribution</div>
                <h3 className="text-sm font-bold uppercase tracking-wider">Station Health</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  baseFM is the main station. Relays like basefm.space sit downstream and are tracked separately.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-800">
                <div className="bg-black p-4">
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Origin</span>
                  <StatusPill status="offline" label="Off Air" />
                </div>
                <div className="bg-black p-4">
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">baseFM</span>
                  <StatusPill status="offline" label="Off Air" />
                </div>
                <div className="bg-black p-4">
                  <span className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Required Relays</span>
                  <StatusPill status="active" label="Healthy" />
                </div>
              </div>

              <div className="mt-4 border border-zinc-800">
                <div className="border-b border-zinc-800 bg-black px-4 py-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">Relay Destinations</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-700">1 Configured</span>
                </div>
                <div className="bg-black p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold uppercase tracking-tight">basefm.space</span>
                        <StatusPill status="active" label="Healthy" />
                      </div>
                      <div className="mt-2 text-xs text-zinc-500 space-y-1">
                        <p>Type: <span className="text-zinc-300 uppercase tracking-widest">HLS-Consumer</span></p>
                        <p>Required relay</p>
                        <p>Viewer: <a href="https://basefm.space" target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">https://basefm.space</a></p>
                      </div>
                    </div>
                    <button className="border border-zinc-700 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white">
                      Probe Relay
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional YouTube Relay */}
              <div className="mt-4 border border-zinc-800 bg-black p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Optional YouTube Relay</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={youtubeRelayUrl}
                    onChange={(e) => setYoutubeRelayUrl(e.target.value)}
                    placeholder="https://youtube.com/@yourchannel/live"
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Optional custom probe URL"
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-zinc-500">
                    Save the viewer/probe destination here. RTMP key management stays external for now.
                  </p>
                  <button
                    onClick={() => {
                      localStorage.setItem('basefm_youtube_relay_url', youtubeRelayUrl);
                      setRelaySaved(true);
                      setTimeout(() => setRelaySaved(false), 2000);
                    }}
                    className="border border-zinc-700 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                  >
                    {relaySaved ? 'Saved!' : 'Save YouTube Relay'}
                  </button>
                </div>
              </div>

              {/* X (Twitter) Relay */}
              <div className="mt-4 border border-zinc-800 bg-black p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600">X (Twitter) Live</div>
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest border border-zinc-700 bg-black text-zinc-400">Optional</span>
                </div>
                <div className="grid gap-px bg-zinc-900 sm:grid-cols-2">
                  <div className="bg-black p-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">RTMP URL</div>
                    <code className="block text-xs text-zinc-300 break-all select-all">rtmp://ie.pscp.tv:80/x</code>
                  </div>
                  <div className="bg-black p-4">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">RTMPS URL</div>
                    <code className="block text-xs text-zinc-300 break-all select-all">rtmps://ie.pscp.tv:443/x</code>
                  </div>
                </div>
                <div className="mt-px bg-black p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Stream Key</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={xStreamKey}
                      onChange={(e) => setXStreamKey(e.target.value)}
                      placeholder="Your X stream key from studio.twitter.com"
                      className="flex-1 bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 font-mono"
                    />
                    <button
                      onClick={() => {
                        localStorage.setItem('basefm_x_stream_key', xStreamKey);
                        setRelaySaved(true);
                        setTimeout(() => setRelaySaved(false), 2000);
                      }}
                      className="border border-zinc-700 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                    >
                      {relaySaved ? 'Saved!' : 'Save'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-xs text-zinc-500 space-y-1">
                  <p>Region: EU (Ireland) · Recommended: 1080p30, 9Mbps video, 128kbps AAC, keyframe every 3s</p>
                  <p>Get your stream key from <a href="https://studio.twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-white transition-colors">studio.twitter.com</a> → Go Live</p>
                </div>
              </div>
            </div>

            {/* Emergency Reset */}
            <div className="border border-zinc-800 bg-zinc-950 p-6">
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
              <div className="mt-4 border border-orange-500/20 bg-black p-4">
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

      {/* Sets */}
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
              <Link href="/dashboard/profile" className="basefm-button-secondary">Profile</Link>
              <Link href="/dashboard/analytics" className="basefm-button-secondary">Stats</Link>
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
            <div className="border border-zinc-800 bg-zinc-950 p-8 text-center">
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
