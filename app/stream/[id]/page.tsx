'use client';

import { useStream } from '@/hooks/useStream';
import { TokenGate } from '@/components/TokenGate';
import { TipButton } from '@/components/TipButton';
import { usePlayer } from '@/contexts/PlayerContext';
import Link from 'next/link';
import Image from 'next/image';
import MuxPlayer from '@mux/mux-player-react';
import { ListenerCount } from '@/components/ListenerCount';

export default function StreamPage({ params }: { params: { id: string } }) {
  const { stream, isLoading, error } = useStream(params.id);
  const { state, playStream, stopStream } = usePlayer();
  const currentShow = state.currentStream;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-24 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-black p-6 animate-pulse">
              <div className="h-4 w-24 bg-zinc-900 mb-4" />
              <div className="aspect-video bg-zinc-900 mb-6" />
              <div className="h-6 w-64 bg-zinc-900 mb-3" />
              <div className="h-4 w-40 bg-zinc-900" />
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
        </section>
      </main>
    );
  }

  if (error || !stream) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-24 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="basefm-panel p-8 text-center">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Stream not found</div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              {error || 'This stream does not exist or has been removed.'}
            </p>
            <Link href="/live" className="basefm-button-primary">
              Back to Live
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const isLive = stream.status === 'LIVE';
  const isPreparing = stream.status === 'PREPARING';
  const hasEnded = stream.status === 'ENDED';
  const isInPersistentPlayer = currentShow?.id === stream.id;

  const enablePersistentPlayback = () => {
    const hlsUrl = stream.muxPlaybackId
      ? `https://stream.mux.com/${stream.muxPlaybackId}.m3u8`
      : stream.hlsPlaybackUrl;

    playStream({
      id: stream.id,
      title: stream.title,
      djName: stream.djName,
      djWalletAddress: stream.djWalletAddress,
      artwork: stream.coverImageUrl,
      isLive,
      isTokenGated: stream.isGated,
      muxPlaybackId: stream.muxPlaybackId,
      hlsUrl: hlsUrl || undefined,
    });
  };

  const stopPersistentPlayback = () => {
    stopStream();
  };

  const player = (() => {
    if (hasEnded) {
      return (
        <div className="basefm-panel p-8 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Ended</div>
          <p className="text-sm text-zinc-400">This stream has finished.</p>
        </div>
      );
    }

    if (!isLive && !isPreparing) {
      return (
        <div className="basefm-panel p-8 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Not live yet</div>
          <p className="text-sm text-zinc-400 mb-2">This stream has not started.</p>
          {stream.scheduledStartTime ? (
            <p className="text-xs text-zinc-500">
              Scheduled for {new Date(stream.scheduledStartTime).toLocaleString()}
            </p>
          ) : null}
        </div>
      );
    }

    if (isPreparing) {
      return (
        <div className="basefm-panel p-8 text-center">
          <div className="text-[10px] uppercase tracking-widest text-yellow-400 mb-3">Preparing</div>
          <p className="text-sm text-zinc-300">The stream is starting. Give the station a moment to pick up the feed.</p>
        </div>
      );
    }

    if (stream.muxPlaybackId) {
      return (
        <div className="border border-zinc-900 bg-black overflow-hidden">
          <MuxPlayer
            playbackId={stream.muxPlaybackId}
            streamType="live"
            autoPlay="muted"
            muted
            accentColor="#3b82f6"
            primaryColor="#FFFFFF"
            secondaryColor="#09090b"
            metadata={{
              video_title: stream.title,
              viewer_user_id: 'anonymous',
            }}
            style={{
              aspectRatio: '16/9',
              width: '100%',
            }}
          />
        </div>
      );
    }

    if (!stream.hlsPlaybackUrl) {
      return (
        <div className="basefm-panel p-8 text-center">
          <div className="text-[10px] uppercase tracking-widest text-red-400 mb-3">Playback unavailable</div>
          <p className="text-sm text-zinc-400">The stream does not have a valid playback source right now.</p>
        </div>
      );
    }

    return (
      <div className="border border-zinc-900 bg-black overflow-hidden">
        <MuxPlayer
          src={stream.hlsPlaybackUrl}
          streamType="live"
          autoPlay="muted"
          muted
          accentColor="#3b82f6"
          primaryColor="#FFFFFF"
          secondaryColor="#09090b"
          metadata={{
            video_title: stream.title,
            viewer_user_id: 'anonymous',
          }}
          style={{
            aspectRatio: '16/9',
            width: '100%',
          }}
        />
      </div>
    );
  })();

  const playerContent = stream.isGated && stream.requiredTokenAddress ? (
    <TokenGate
      tokenAddress={stream.requiredTokenAddress}
      requiredAmount={stream.requiredTokenAmount || 1}
    >
      {player}
    </TokenGate>
  ) : (
    player
  );

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-24 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="bg-black p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <Link href="/live" className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                Back to live
              </Link>
              <div className="flex items-center gap-3">
                {isLive ? (
                  <span className="basefm-kicker text-red-400">Live</span>
                ) : isPreparing ? (
                  <span className="basefm-kicker text-yellow-400">Preparing</span>
                ) : hasEnded ? (
                  <span className="basefm-kicker text-zinc-500">Ended</span>
                ) : (
                  <span className="basefm-kicker text-zinc-500">{stream.status}</span>
                )}
                {isLive ? <ListenerCount streamId={stream.id} size="sm" /> : null}
              </div>
            </div>

            <div className="mb-6">{playerContent}</div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 border border-zinc-900 bg-black overflow-hidden flex-shrink-0">
                {stream.coverImageUrl ? (
                  <Image
                    src={stream.coverImageUrl}
                    alt={stream.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image src="/logo.png" alt="" width={40} height={40} className="opacity-40" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {stream.isGated ? <span className="basefm-kicker text-blue-500">Token gated</span> : null}
                  {stream.genre ? <span className="text-[10px] uppercase tracking-widest text-zinc-600">{stream.genre}</span> : null}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase text-white mb-2">
                  {stream.title}
                </h1>
                <p className="text-sm text-zinc-400">{stream.djName}</p>
              </div>
            </div>

            {stream.description || (stream.tags && stream.tags.length > 0) ? (
              <div className="basefm-panel p-5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">About</div>
                {stream.description ? <p className="text-sm text-zinc-400 leading-relaxed mb-4">{stream.description}</p> : null}
                {stream.tags && stream.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stream.tags.map((tag) => (
                      <span key={tag} className="text-[10px] uppercase tracking-widest text-zinc-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="bg-black p-6 sm:p-8 space-y-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Actions</div>
              {isLive ? (
                <div className="space-y-3">
                  <button
                    onClick={isInPersistentPlayer ? stopPersistentPlayback : enablePersistentPlayback}
                    className={isInPersistentPlayer ? 'basefm-button-primary w-full' : 'basefm-button-secondary w-full'}
                  >
                    {isInPersistentPlayer ? 'Playing in Background' : 'Listen While Browsing'}
                  </button>
                  {stream.djWalletAddress ? (
                    <TipButton
                      djWalletAddress={stream.djWalletAddress}
                      djName={stream.djName}
                      streamId={stream.id}
                    />
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">Playback actions appear here when the stream is live.</p>
              )}
            </div>

            <div className="basefm-panel p-5">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Station logic</div>
              <div className="space-y-3 text-sm text-zinc-400">
                <p>baseFM is the listener surface.</p>
                <p>Agentbot remains the canonical live station and relay truth layer.</p>
                <p>If something looks wrong here, check the station-wide live page first.</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/live" className="basefm-button-secondary !px-4 !py-2">
                  Station Live
                </Link>
                <a
                  href="https://agentbot.sh/basefm/live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="basefm-button-secondary !px-4 !py-2"
                >
                  Agentbot Live
                </a>
              </div>
            </div>

            <div className="basefm-panel p-5">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Metadata</div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Status</div>
                  <div className="text-zinc-300">{stream.status}</div>
                </div>
                {stream.scheduledStartTime ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Scheduled</div>
                    <div className="text-zinc-300">{new Date(stream.scheduledStartTime).toLocaleString()}</div>
                  </div>
                ) : null}
                {stream.actualStartTime ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Started</div>
                    <div className="text-zinc-300">{new Date(stream.actualStartTime).toLocaleString()}</div>
                  </div>
                ) : null}
                {stream.actualEndTime ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Ended</div>
                    <div className="text-zinc-300">{new Date(stream.actualEndTime).toLocaleString()}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
