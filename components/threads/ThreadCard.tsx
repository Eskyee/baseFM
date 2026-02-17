'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';
import { Thread } from '@/types/thread';

interface ThreadCardProps {
  thread: Thread;
  onLike?: (threadId: string) => void;
  onUnlike?: (threadId: string) => void;
  onReply?: (thread: Thread) => void;
  onDelete?: (threadId: string) => void;
  currentWallet?: string;
  showActions?: boolean;
  isCompact?: boolean;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ThreadCard({
  thread,
  onLike,
  onUnlike,
  onReply,
  onDelete,
  currentWallet,
  showActions = true,
  isCompact = false,
}: ThreadCardProps) {
  const [isLiked, setIsLiked] = useState(thread.isLikedByMe || false);
  const [likeCount, setLikeCount] = useState(thread.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = currentWallet?.toLowerCase() === thread.authorWallet.toLowerCase();
  const displayName = thread.author?.baseName || thread.author?.ensName || thread.author?.displayName;

  const handleLike = async () => {
    if (isLiking || !currentWallet) return;
    setIsLiking(true);

    try {
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
        onUnlike?.(thread.id);
      } else {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        onLike?.(thread.id);
      }
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className={`bg-[#1A1A1A] rounded-2xl ${isCompact ? 'p-3' : 'p-4'} transition-all`}>
      {/* Pinned indicator */}
      {thread.isPinned && (
        <div className="flex items-center gap-1.5 text-[10px] text-purple-400 font-medium mb-2">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
          <span>Pinned</span>
        </div>
      )}

      {/* Header: Avatar, Name, Time */}
      <div className="flex items-start gap-3">
        <Link href={`/community?wallet=${thread.authorWallet}`} className="flex-shrink-0">
          <Identity
            address={thread.authorWallet as `0x${string}`}
            chain={base}
            className="!bg-transparent !p-0"
          >
            <Avatar className="w-10 h-10 rounded-full" />
          </Identity>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2">
            <Link
              href={`/community?wallet=${thread.authorWallet}`}
              className="flex items-center gap-1.5 min-w-0"
            >
              {displayName ? (
                <span className="text-[#F5F5F5] font-medium text-sm truncate">{displayName}</span>
              ) : (
                <Identity
                  address={thread.authorWallet as `0x${string}`}
                  chain={base}
                  className="!bg-transparent !p-0"
                >
                  <Name className="text-[#F5F5F5] font-medium text-sm truncate" />
                </Identity>
              )}
              {thread.author?.isVerified && (
                <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </Link>
            <span className="text-[#666] text-xs flex-shrink-0">
              {formatTimeAgo(thread.createdAt)}
            </span>

            {/* More menu */}
            {isOwner && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-[#666] hover:text-[#888] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-6 z-20 bg-[#2A2A2A] rounded-lg py-1 min-w-[120px] shadow-xl border border-[#333]">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete?.(thread.id);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#333]"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <p className="text-[#F5F5F5] text-sm mt-1 whitespace-pre-wrap break-words leading-relaxed">
            {thread.content}
          </p>

          {/* Media */}
          {thread.mediaUrls && thread.mediaUrls.length > 0 && (
            <div className={`mt-3 grid gap-2 ${thread.mediaUrls.length === 1 ? '' : 'grid-cols-2'}`}>
              {thread.mediaUrls.slice(0, 4).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="rounded-xl w-full aspect-square object-cover"
                />
              ))}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-6 mt-3">
              {/* Reply */}
              <button
                onClick={() => onReply?.(thread)}
                className="flex items-center gap-1.5 text-[#666] hover:text-[#888] transition-colors group"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {thread.replyCount > 0 && (
                  <span className="text-xs">{thread.replyCount}</span>
                )}
              </button>

              {/* Like */}
              <button
                onClick={handleLike}
                disabled={isLiking || !currentWallet}
                className={`flex items-center gap-1.5 transition-colors ${
                  isLiked
                    ? 'text-red-400'
                    : 'text-[#666] hover:text-red-400'
                } disabled:opacity-50`}
              >
                <svg
                  className="w-4 h-4"
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {likeCount > 0 && (
                  <span className="text-xs">{likeCount}</span>
                )}
              </button>

              {/* Share */}
              <button
                onClick={() => {
                  navigator.share?.({
                    url: `${window.location.origin}/threads/${thread.id}`,
                  }).catch(() => {});
                }}
                className="text-[#666] hover:text-[#888] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
