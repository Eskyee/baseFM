'use client';

import { useState } from 'react';

interface ChatModerationProps {
  streamId: string;
  moderatorWallet: string;
  messageId?: string;
  targetWallet?: string;
  targetName?: string;
  onClose?: () => void;
  onAction?: (action: string) => void;
}

export function ChatModeration({
  streamId,
  moderatorWallet,
  messageId,
  targetWallet,
  targetName,
  onClose,
  onAction,
}: ChatModerationProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string, duration?: number) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          streamId,
          messageId,
          targetWallet,
          moderatorWallet,
          duration,
        }),
      });

      if (res.ok) {
        onAction?.(action);
        onClose?.();
      }
    } catch (error) {
      console.error('Moderation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-3 border border-[#333] shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#F5F5F5]">
          Moderate {targetName ? `@${targetName}` : 'User'}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#888] hover:text-[#F5F5F5]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {/* Delete Message */}
        {messageId && (
          <button
            onClick={() => handleAction('delete')}
            disabled={isLoading}
            className="w-full flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] hover:bg-[#333] rounded text-sm text-[#F5F5F5] transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Message
          </button>
        )}

        {/* Timeout Options */}
        {targetWallet && (
          <>
            <button
              onClick={() => handleAction('timeout', 60)}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] hover:bg-[#333] rounded text-sm text-[#F5F5F5] transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeout 1 min
            </button>

            <button
              onClick={() => handleAction('timeout', 300)}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] hover:bg-[#333] rounded text-sm text-[#F5F5F5] transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeout 5 min
            </button>

            <button
              onClick={() => handleAction('timeout', 600)}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] hover:bg-[#333] rounded text-sm text-[#F5F5F5] transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timeout 10 min
            </button>

            <button
              onClick={() => handleAction('ban')}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 rounded text-sm text-red-400 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Ban from Chat
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Simple inline moderation button for chat messages
export function ModerateButton({
  streamId,
  moderatorWallet,
  messageId,
  targetWallet,
  targetName,
}: Omit<ChatModerationProps, 'onClose' | 'onAction'>) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded transition-all"
        title="Moderate"
      >
        <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-6 z-50">
          <ChatModeration
            streamId={streamId}
            moderatorWallet={moderatorWallet}
            messageId={messageId}
            targetWallet={targetWallet}
            targetName={targetName}
            onClose={() => setShowMenu(false)}
            onAction={() => setShowMenu(false)}
          />
        </div>
      )}
    </div>
  );
}
