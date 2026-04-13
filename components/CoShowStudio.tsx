'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useCoShowSignaling } from '@/hooks/useCoShowSignaling';
import { CoShowChat } from '@/components/CoShowChat';
import type { CoShow } from '@/types/co-show';

interface CoShowStudioProps {
  coShow: CoShow;
  role: 'host' | 'co-dj';
  walletAddress: string;
  djName: string;
  inviteCode: string;
}

export function CoShowStudio({ coShow, role, walletAddress, djName, inviteCode }: CoShowStudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [handoffReceived, setHandoffReceived] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Get local audio for WebRTC monitoring
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function getAudio() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setLocalStream(stream);
      } catch (err) {
        console.error('Failed to get local audio:', err);
      }
    }
    getAudio();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const { remoteStream, peerReady, connectionState, sendHandoffRequest, onHandoffRequest } =
    useCoShowSignaling({
      coShowId: coShow.id,
      localStream,
      role,
      enabled: true,
    });

  // Wire remote audio
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Handoff callback
  useEffect(() => {
    onHandoffRequest(() => setHandoffReceived(true));
  }, [onHandoffRequest]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const rtmpBase = 'rtmps://global-live.mux.com:443/app';
  const streamKey = coShow.muxStreamKey || '';

  return (
    <div className="bg-black font-mono min-h-screen text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-amber-400 font-bold tracking-tighter">[baseFM]</span>
          <span className="font-bold uppercase tracking-tighter">B2B LIVE</span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-zinc-400">HOST:</span>
            <span className="text-white font-bold">{coShow.hostName}</span>
          </span>
          <span className="text-zinc-700">&#9670;</span>
          <span className="flex items-center gap-1.5">
            {coShow.coDjName ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-zinc-400">CO-DJ:</span>
                <span className="text-white font-bold">{coShow.coDjName}</span>
              </>
            ) : (
              <span className="text-zinc-600">CO-DJ: Waiting...</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
              coShow.status === 'active'
                ? 'bg-green-400/20 text-green-400'
                : coShow.status === 'pending'
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {coShow.status}
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 49px)' }}>
        {/* Left Panel */}
        <div className="flex-1 lg:w-2/3 overflow-y-auto p-4 space-y-4">
          {/* RTMP Credentials */}
          <div className="border border-zinc-800 bg-zinc-950 rounded p-4">
            <h3 className="text-xs font-bold uppercase tracking-tighter text-zinc-400 mb-3">
              RTMP CREDENTIALS
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-600 uppercase">RTMP URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-black border border-zinc-800 rounded px-3 py-2 text-green-400 text-xs break-all">
                    {rtmpBase}
                  </code>
                  <button
                    onClick={() => copyToClipboard(rtmpBase, 'rtmp')}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white transition-colors"
                  >
                    {copied === 'rtmp' ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-600 uppercase">Stream Key</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-black border border-zinc-800 rounded px-3 py-2 text-green-400 text-xs break-all">
                    {showStreamKey ? streamKey : '\u2022'.repeat(20)}
                  </code>
                  <button
                    onClick={() => setShowStreamKey(!showStreamKey)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white transition-colors"
                  >
                    {showStreamKey ? 'HIDE' : 'SHOW'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(streamKey, 'key')}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white transition-colors"
                  >
                    {copied === 'key' ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-zinc-600 mt-3">
              Open OBS &rarr; Settings &rarr; Stream &rarr; Custom RTMP &rarr; paste these
            </p>
          </div>

          {/* Audio Monitoring */}
          <div className="border border-zinc-800 bg-zinc-950 rounded p-4">
            <h3 className="text-xs font-bold uppercase tracking-tighter text-zinc-400 mb-3">
              AUDIO MONITORING
            </h3>
            <audio ref={audioRef} autoPlay className="hidden" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {remoteStream ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-bold uppercase">
                      MONITORING {role === 'host' ? 'CO-DJ' : 'HOST'} AUDIO
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-zinc-700" />
                    <span className="text-zinc-500 text-xs">Waiting for peer audio...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-600">
                  {connectionState === 'idle' ? 'IDLE' : connectionState.toUpperCase()}
                </span>
                <button
                  onClick={() => {
                    setMuted(!muted);
                    if (audioRef.current) audioRef.current.muted = !muted;
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-bold ${
                    muted
                      ? 'bg-red-900/50 text-red-400 border border-red-800'
                      : 'bg-zinc-800 text-white'
                  }`}
                >
                  {muted ? 'UNMUTE' : 'MUTE'}
                </button>
              </div>
            </div>
          </div>

          {/* Handoff */}
          <div className="border border-zinc-800 bg-zinc-950 rounded p-4">
            <h3 className="text-xs font-bold uppercase tracking-tighter text-zinc-400 mb-3">
              DJ HANDOFF
            </h3>
            {handoffReceived ? (
              <div className="bg-amber-400/10 border border-amber-400/30 rounded p-4">
                <p className="text-amber-400 font-bold text-sm uppercase">
                  {role === 'host' ? 'CO-DJ' : 'HOST'} WANTS THE MIC
                </p>
                <p className="text-zinc-400 text-xs mt-2">
                  Connect your RTMP to take over. Stop your encoder within 2 minutes after handing off.
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={sendHandoffRequest}
                  disabled={!peerReady}
                  className="w-full py-4 bg-amber-400 text-black font-bold uppercase tracking-tighter rounded text-sm hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  HAND OFF TO {role === 'host' ? 'CO-DJ' : 'HOST'} &rarr;
                </button>
                <p className="text-[10px] text-zinc-600 mt-2">
                  Stop your encoder within 2 minutes after handing off
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="lg:w-1/3 border-l border-zinc-800 flex flex-col" style={{ height: '100%' }}>
          <CoShowChat
            inviteCode={inviteCode}
            coShowId={coShow.id}
            walletAddress={walletAddress}
            djName={djName}
            role={role}
          />
        </div>
      </div>
    </div>
  );
}
