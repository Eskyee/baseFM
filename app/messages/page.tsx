'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import { WalletConnect } from '@/components/WalletConnect';
import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';

interface Conversation {
  id: string;
  type: 'dm' | 'group';
  name: string | null;
  displayName: string | null;
  displayAvatar: string | null;
  otherWallet: string | null;
  isDj: boolean;
  djSlug: string | null;
  lastMessage: {
    content: string;
    createdAt: string;
    senderWallet: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderWallet: string;
  senderName: string | null;
  senderAvatar: string | null;
  content: string;
  isEdited: boolean;
  createdAt: string;
}

// Loading component for Suspense
function MessagesLoading() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#333] border-t-blue-500 rounded-full" />
    </div>
  );
}

// Main messages content component
function MessagesContent() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConvId = searchParams.get('conv');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatWallet, setNewChatWallet] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!address) return;

    async function fetchConversations() {
      try {
        const res = await fetch(`/api/conversations?wallet=${address}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setIsLoadingConvs(false);
      }
    }

    fetchConversations();
  }, [address]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConvId || !address) {
      setMessages([]);
      return;
    }

    async function fetchMessages() {
      setIsLoadingMsgs(true);
      try {
        const res = await fetch(`/api/messages?conversationId=${selectedConvId}&wallet=${address}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setIsLoadingMsgs(false);
      }
    }

    fetchMessages();
  }, [selectedConvId, address]);

  // Subscribe to new messages
  useEffect(() => {
    if (!selectedConvId) return;

    const channel = supabase
      .channel(`messages:${selectedConvId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${selectedConvId}`,
        },
        (payload: RealtimePostgresInsertPayload<Record<string, unknown>>) => {
          const newMsg = payload.new as unknown as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId || !address || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConvId,
          senderWallet: address,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartDM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatWallet.trim() || !address) return;

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'dm',
          walletAddress: address,
          otherWallet: newChatWallet.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowNewChat(false);
        setNewChatWallet('');
        router.push(`/messages?conv=${data.conversation.id}`);
        // Refresh conversations
        const convRes = await fetch(`/api/conversations?wallet=${address}`);
        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData.conversations || []);
        }
      }
    } catch (err) {
      console.error('Failed to start DM:', err);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Messages</h1>
          <p className="text-[#888] mb-8">Connect your wallet to view messages</p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-[#1A1A1A] flex flex-col">
        <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#F5F5F5]">Messages</h1>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 rounded-lg bg-[#1A1A1A] text-[#888] hover:text-[#F5F5F5] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="p-4 border-b border-[#1A1A1A] bg-[#0A0A0A]">
            <form onSubmit={handleStartDM}>
              <label className="block text-sm text-[#888] mb-2">Start a conversation</label>
              <input
                type="text"
                value={newChatWallet}
                onChange={(e) => setNewChatWallet(e.target.value)}
                placeholder="Wallet address (0x...)"
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] text-sm focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Start Chat
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewChat(false)}
                  className="px-4 py-2 bg-[#333] text-[#888] rounded-lg text-sm hover:text-[#F5F5F5]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConvs ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 skeleton rounded" />
                    <div className="h-3 w-32 skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-[#888] text-sm">No conversations yet</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-4 text-blue-400 text-sm hover:underline"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages?conv=${conv.id}`}
                className={`flex items-center gap-3 p-4 hover:bg-[#1A1A1A] transition-colors ${
                  selectedConvId === conv.id ? 'bg-[#1A1A1A]' : ''
                }`}
              >
                {conv.otherWallet ? (
                  <Identity address={conv.otherWallet as `0x${string}`} className="!bg-transparent">
                    <Avatar className="w-12 h-12 rounded-full" />
                  </Identity>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
                    <span className="text-lg">{conv.name?.charAt(0) || '?'}</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    {conv.otherWallet ? (
                      <Identity address={conv.otherWallet as `0x${string}`} className="!bg-transparent">
                        <Name className="text-[#F5F5F5] font-medium truncate" />
                      </Identity>
                    ) : (
                      <span className="text-[#F5F5F5] font-medium truncate">{conv.name}</span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-sm text-[#888] truncate">
                      {conv.lastMessage.senderWallet.toLowerCase() === address?.toLowerCase() && 'You: '}
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Main - Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConvId && selectedConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#1A1A1A] flex items-center gap-3">
              {selectedConv.otherWallet ? (
                <>
                  <Identity address={selectedConv.otherWallet as `0x${string}`} className="!bg-transparent">
                    <Avatar className="w-10 h-10 rounded-full" />
                  </Identity>
                  <div>
                    <Identity address={selectedConv.otherWallet as `0x${string}`} className="!bg-transparent">
                      <Name className="text-[#F5F5F5] font-medium" />
                    </Identity>
                    {selectedConv.isDj && selectedConv.djSlug && (
                      <Link href={`/djs/${selectedConv.djSlug}`} className="text-xs text-blue-400 hover:underline">
                        View DJ Profile
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
                    <span>{selectedConv.name?.charAt(0) || '?'}</span>
                  </div>
                  <span className="text-[#F5F5F5] font-medium">{selectedConv.name}</span>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-8 h-8 border-2 border-[#333] border-t-blue-500 rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#888]">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderWallet.toLowerCase() === address?.toLowerCase();
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-[#1A1A1A] text-[#F5F5F5] rounded-bl-md'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-[#666]'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.isEdited && ' (edited)'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#1A1A1A]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-[#333] rounded-xl text-[#F5F5F5] focus:outline-none focus:border-blue-500"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-[#F5F5F5] mb-2">Your Messages</h2>
              <p className="text-[#888] text-sm mb-4">Send private messages to DJs, artists, and community members</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start a Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Default export with Suspense boundary
export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent />
    </Suspense>
  );
}
