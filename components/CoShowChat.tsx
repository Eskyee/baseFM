'use client';

import { useState, useRef, useEffect } from 'react';
import { useCoShowChat } from '@/hooks/useCoShowChat';

interface CoShowChatProps {
  inviteCode: string;
  coShowId?: string;
  walletAddress: string;
  djName: string;
  role: 'host' | 'co-dj' | 'listener';
}

export function CoShowChat({ inviteCode, coShowId, walletAddress, djName, role }: CoShowChatProps) {
  const { messages, sendMessage, isConnected } = useCoShowChat({ inviteCode, coShowId });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const messageType = role === 'host' || role === 'co-dj' ? 'dj' : 'listener';
    sendMessage(walletAddress, djName, input.trim(), messageType);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full font-mono bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-tighter text-white">LIVE CHAT</span>
          {isConnected && (
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-zinc-600 text-xs text-center py-8">No messages yet</p>
        )}
        {messages.map((msg) => {
          const isDJ = msg.messageType === 'dj';
          return (
            <div
              key={msg.id}
              className={isDJ ? 'border-l-2 border-amber-400 pl-2' : ''}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold ${isDJ ? 'text-amber-400' : 'text-zinc-400'}`}
                >
                  {msg.senderName}
                </span>
                {isDJ && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase">
                    DJ
                  </span>
                )}
                <span className="text-zinc-600 text-[10px]">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className={`text-sm mt-0.5 ${isDJ ? 'text-white' : 'text-zinc-300'}`}>
                {msg.content}
              </p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 bg-white text-black rounded text-sm font-bold uppercase tracking-tighter hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
