'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { ChatMessage, chatMessageFromRow, ChatMessageRow } from '@/types/chat';

const DEFAULT_AVATAR = '/logo.png';

// Create browser client for realtime
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LiveChatProps {
  streamId: string;
  djWalletAddress: string;
  userName?: string;
  userAvatar?: string;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function MessageBubble({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  const displayName = msg.senderName ||
    `${msg.walletAddress.slice(0, 4)}...${msg.walletAddress.slice(-3)}`;

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#333] flex-shrink-0">
        {msg.senderAvatar ? (
          <Image src={msg.senderAvatar} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#888]">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Message */}
      <div className={`max-w-[75%] ${isOwn ? 'text-right' : ''}`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-medium ${msg.isDj ? 'text-purple-400' : 'text-[#888]'}`}>
            {displayName}
          </span>
          {msg.isDj && (
            <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded">
              DJ
            </span>
          )}
          <span className="text-[10px] text-[#666]">{formatTime(msg.createdAt)}</span>
        </div>
        <p className={`text-sm text-[#F5F5F5] px-3 py-2 rounded-lg inline-block ${
          isOwn ? 'bg-blue-600' : msg.isDj ? 'bg-purple-600/30' : 'bg-[#1A1A1A]'
        }`}>
          {msg.message}
        </p>
      </div>
    </div>
  );
}

export function LiveChat({ streamId, djWalletAddress, userName, userAvatar }: LiveChatProps) {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/chat?streamId=${streamId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    }

    fetchMessages();
  }, [streamId]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          const newMsg = chatMessageFromRow(payload.new as ChatMessageRow);
          setMessages((prev) => [...prev, newMsg]);
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId,
          walletAddress: address,
          message: newMessage.trim(),
          senderName: userName,
          senderAvatar: userAvatar,
          isDj: address.toLowerCase() === djWalletAddress.toLowerCase(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send');
      }
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] hover:bg-[#222] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-[#F5F5F5]">Live Chat</span>
          <span className="text-xs text-[#888]">{messages.length} messages</span>
        </div>
        <svg
          className={`w-5 h-5 text-[#888] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <>
          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 min-h-[200px]"
          >
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#888] text-sm">No messages yet</p>
                <p className="text-[#666] text-xs mt-1">Be the first to say something!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={address?.toLowerCase() === msg.walletAddress.toLowerCase()}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {isConnected ? (
            <form onSubmit={handleSend} className="p-3 border-t border-[#1A1A1A]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={500}
                  className="flex-1 px-4 py-2 bg-[#1A1A1A] text-[#F5F5F5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#666]"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 border-t border-[#1A1A1A] text-center">
              <p className="text-sm text-[#888]">Connect wallet to chat</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
