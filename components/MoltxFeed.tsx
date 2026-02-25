'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MoltxPost {
  id: string;
  content: string;
  author_display_name: string;
  author_name: string;
  created_at: string;
  reply_count?: number;
  like_count?: number;
}

interface MoltxFeedProps {
  agentName?: string;
  limit?: number;
  className?: string;
}

export function MoltxFeed({
  agentName = 'Atlas_baseFM',
  limit = 3,
  className = ''
}: MoltxFeedProps) {
  const [posts, setPosts] = useState<MoltxPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        const response = await fetch(`https://moltx.io/v1/agents/profile?name=${agentName}`);

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const agentPosts = data.data?.posts || [];
        setPosts(agentPosts.slice(0, limit));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [agentName, limit]);

  // Format relative time
  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-2xl p-5 border border-[#2A2A2A] ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2A2A2A]" />
            <div className="h-4 bg-[#2A2A2A] rounded w-32" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 p-3 bg-[#0A0A0A] rounded-xl">
              <div className="h-3 bg-[#2A2A2A] rounded w-full" />
              <div className="h-3 bg-[#2A2A2A] rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return null; // Silently hide if no posts or error
  }

  return (
    <div className={`bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-2xl overflow-hidden border border-[#2A2A2A] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-[#F5F5F5] font-bold text-sm flex items-center gap-1.5">
              Atlas
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </h3>
            <p className="text-[#666] text-xs">@{agentName}</p>
          </div>
        </div>
        <Link
          href={`https://moltx.io/${agentName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full hover:bg-purple-600/30 transition-colors"
        >
          Follow
        </Link>
      </div>

      {/* Posts */}
      <div className="divide-y divide-[#2A2A2A]">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`https://moltx.io/post/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 hover:bg-[#1A1A1A] transition-colors group"
          >
            <p className="text-[#F5F5F5] text-sm leading-relaxed mb-2 line-clamp-3">
              {post.content}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#666]">{formatTime(post.created_at)}</span>
              <div className="flex items-center gap-3 text-[#666]">
                {post.reply_count !== undefined && post.reply_count > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.reply_count}
                  </span>
                )}
                {post.like_count !== undefined && post.like_count > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {post.like_count}
                  </span>
                )}
                <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View on Moltx →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2A2A2A] bg-[#0A0A0A]">
        <Link
          href={`https://moltx.io/${agentName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2 text-sm text-[#888] hover:text-purple-400 transition-colors"
        >
          <span>View all posts on Moltx</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
