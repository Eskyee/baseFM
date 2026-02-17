'use client';

import { useState, useRef } from 'react';
import { Avatar, Identity } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';

interface ThreadComposerProps {
  walletAddress: string;
  onSubmit: (content: string, mediaUrls?: string[]) => Promise<void>;
  placeholder?: string;
  parentId?: string;
  maxLength?: number;
}

export function ThreadComposer({
  walletAddress,
  onSubmit,
  placeholder = "What's happening?",
  maxLength = 500,
}: ThreadComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = content.length;
  const isOverLimit = charCount > maxLength;
  const isEmpty = content.trim().length === 0;

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
      setIsFocused(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <Identity
          address={walletAddress as `0x${string}`}
          chain={base}
          className="!bg-transparent !p-0 flex-shrink-0"
        >
          <Avatar className="w-10 h-10 rounded-full" />
        </Identity>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full bg-transparent text-[#F5F5F5] placeholder-[#666] text-sm resize-none focus:outline-none min-h-[24px]"
            style={{ maxHeight: '200px' }}
          />

          {/* Actions row - show when focused or has content */}
          {(isFocused || content.length > 0) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A2A2A]">
              {/* Left: Media buttons (disabled for now) */}
              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-[#666] hover:text-purple-400 transition-colors rounded-full hover:bg-purple-500/10 disabled:opacity-30"
                  disabled
                  title="Coming soon"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* Right: Character count + Post button */}
              <div className="flex items-center gap-3">
                {/* Character count */}
                <div className={`text-xs ${isOverLimit ? 'text-red-400' : charCount > maxLength * 0.8 ? 'text-yellow-400' : 'text-[#666]'}`}>
                  {charCount}/{maxLength}
                </div>

                {/* Post button */}
                <button
                  onClick={handleSubmit}
                  disabled={isEmpty || isOverLimit || isSubmitting}
                  className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors active:scale-[0.97]"
                >
                  {isSubmitting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
