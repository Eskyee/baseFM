'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseCoShowSignalingProps {
  coShowId: string;
  localStream: MediaStream | null;
  role: 'host' | 'co-dj';
  enabled: boolean;
}

interface UseCoShowSignalingReturn {
  remoteStream: MediaStream | null;
  peerReady: boolean;
  connectionState: RTCPeerConnectionState | 'idle';
  sendHandoffRequest: () => void;
  onHandoffRequest: (cb: () => void) => void;
}

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export function useCoShowSignaling({
  coShowId,
  localStream,
  role,
  enabled,
}: UseCoShowSignalingProps): UseCoShowSignalingReturn {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerReady, setPeerReady] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | 'idle'>('idle');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const handoffCallbackRef = useRef<(() => void) | null>(null);
  const remoteDescriptionSet = useRef(false);

  const onHandoffRequest = useCallback((cb: () => void) => {
    handoffCallbackRef.current = cb;
  }, []);

  const sendHandoffRequest = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'handoff-request',
      payload: { from: role },
    });
  }, [role]);

  useEffect(() => {
    if (!enabled || !coShowId) return;

    const supabase = getSupabase();
    const channelName = `co-show:${coShowId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    let pc: RTCPeerConnection | null = null;

    function createPeerConnection() {
      pc = new RTCPeerConnection(ICE_CONFIG);
      pcRef.current = pc;

      pc.onconnectionstatechange = () => {
        if (pc) setConnectionState(pc.connectionState);
      };

      pc.ontrack = (event) => {
        const stream = new MediaStream();
        stream.addTrack(event.track);
        setRemoteStream(stream);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          channel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { candidate: event.candidate.toJSON(), from: role },
          });
        }
      };

      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          pc!.addTrack(track, localStream);
        });
      }

      return pc;
    }

    async function processIceQueue() {
      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift()!;
        try {
          await pc?.addIceCandidate(candidate);
        } catch (err) {
          console.error('Failed to add queued ICE candidate:', err);
        }
      }
    }

    channel
      .on('broadcast', { event: 'peer-ready' }, async (payload) => {
        const msg = payload.payload as { from: string };
        if (msg.from === role) return;
        setPeerReady(true);

        // Host creates offer when peer is ready
        if (role === 'host' && pc) {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            channel.send({
              type: 'broadcast',
              event: 'sdp-offer',
              payload: { sdp: offer, from: role },
            });
          } catch (err) {
            console.error('Failed to create offer:', err);
          }
        }
      })
      .on('broadcast', { event: 'sdp-offer' }, async (payload) => {
        const msg = payload.payload as { sdp: RTCSessionDescriptionInit; from: string };
        if (msg.from === role || !pc) return;

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          remoteDescriptionSet.current = true;
          await processIceQueue();

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({
            type: 'broadcast',
            event: 'sdp-answer',
            payload: { sdp: answer, from: role },
          });
        } catch (err) {
          console.error('Failed to handle offer:', err);
        }
      })
      .on('broadcast', { event: 'sdp-answer' }, async (payload) => {
        const msg = payload.payload as { sdp: RTCSessionDescriptionInit; from: string };
        if (msg.from === role || !pc) return;

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          remoteDescriptionSet.current = true;
          await processIceQueue();
        } catch (err) {
          console.error('Failed to handle answer:', err);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async (payload) => {
        const msg = payload.payload as { candidate: RTCIceCandidateInit; from: string };
        if (msg.from === role || !pc) return;

        const candidate = new RTCIceCandidate(msg.candidate);
        if (remoteDescriptionSet.current) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (err) {
            console.error('Failed to add ICE candidate:', err);
          }
        } else {
          iceCandidateQueue.current.push(candidate);
        }
      })
      .on('broadcast', { event: 'handoff-request' }, (payload) => {
        const msg = payload.payload as { from: string };
        if (msg.from !== role) {
          handoffCallbackRef.current?.();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          createPeerConnection();
          channel.send({
            type: 'broadcast',
            event: 'peer-ready',
            payload: { from: role },
          });
        }
      });

    return () => {
      remoteDescriptionSet.current = false;
      iceCandidateQueue.current = [];
      pc?.close();
      pcRef.current = null;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [coShowId, localStream, role, enabled]);

  return {
    remoteStream,
    peerReady,
    connectionState,
    sendHandoffRequest,
    onHandoffRequest,
  };
}
