'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { CoShowMessage, CoShowMessageType } from '@/types/co-show';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseCoShowChatProps {
  inviteCode: string;
  coShowId?: string;
}

interface UseCoShowChatReturn {
  messages: CoShowMessage[];
  sendMessage: (
    senderWallet: string,
    senderName: string,
    content: string,
    messageType: CoShowMessageType
  ) => void;
  isConnected: boolean;
}

export function useCoShowChat({ inviteCode, coShowId }: UseCoShowChatProps): UseCoShowChatReturn {
  const [messages, setMessages] = useState<CoShowMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const resolvedCoShowId = useRef(coShowId || '');

  // Load initial messages
  useEffect(() => {
    if (!inviteCode) return;

    async function loadMessages() {
      try {
        const res = await fetch(`/api/co-show/${inviteCode}/messages`);
        if (res.ok) {
          const data = await res.json();
          resolvedCoShowId.current = data.coShowId || resolvedCoShowId.current;
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load co-show messages:', err);
      }
    }

    loadMessages();
  }, [inviteCode]);

  // Subscribe to realtime broadcast
  useEffect(() => {
    const id = coShowId || resolvedCoShowId.current;
    if (!id) return;

    const supabase = getSupabase();
    const channel = supabase.channel(`co-show-chat:${id}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'chat-message' }, (payload) => {
        const msg = payload.payload as CoShowMessage;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [coShowId]);

  const sendMessage = useCallback(
    async (
      senderWallet: string,
      senderName: string,
      content: string,
      messageType: CoShowMessageType
    ) => {
      if (!content.trim()) return;

      // Optimistic local message
      const tempId = crypto.randomUUID();
      const tempMsg: CoShowMessage = {
        id: tempId,
        coShowId: coShowId || resolvedCoShowId.current,
        senderWallet,
        senderName,
        content,
        messageType,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMsg]);

      // Broadcast via realtime
      channelRef.current?.send({
        type: 'broadcast',
        event: 'chat-message',
        payload: tempMsg,
      });

      // Persist to DB
      try {
        const res = await fetch(`/api/co-show/${inviteCode}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderWallet,
            senderName,
            content,
            messageType,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          // Replace temp message with persisted one
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? data.message : m))
          );
        }
      } catch (err) {
        console.error('Failed to persist co-show message:', err);
      }
    },
    [inviteCode, coShowId]
  );

  return { messages, sendMessage, isConnected };
}
