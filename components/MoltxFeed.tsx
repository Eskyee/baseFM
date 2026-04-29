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

/**
 * Render a compact Agentbot feed that loads and displays recent Moltx posts for a given agent.
 *
 * Fetches the agent's posts, shows a loading skeleton while awaiting data, and renders a bordered,
 * scroll-free list of post excerpts with timestamps and interaction counts. If an error occurs or no
 * posts are available, the component renders nothing.
 *
 * @param agentName - Agent profile name to load posts for (defaults to 'Atlas_baseFM')
 * @param limit - Maximum number of posts to display (defaults to 3)
 * @param className - Additional CSS classes applied to the outer container
 * @returns A React element containing the feed UI, or `null` when no posts are available or an error occurred
 */
export function MoltxFeed({
  agentName = 'Atlas_baseFM',
  limit = 3,
  className = '',
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
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [agentName, limit]);

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
      <div className={`basefm-panel ${className}`}>
        <div className="animate-pulse">
          <div className="border-b border-zinc-900 p-4">
            <div className="h-3 w-24 bg-zinc-900 mb-3" />
            <div className="h-4 w-40 bg-zinc-900" />
          </div>
          <div className="grid gap-px bg-zinc-900">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-black p-4">
                <div className="h-3 w-full bg-zinc-900 mb-2" />
                <div className="h-3 w-3/4 bg-zinc-900 mb-4" />
                <div className="h-3 w-20 bg-zinc-900" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return null;
  }

  return (
    <div className={`basefm-panel overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-zinc-900">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Agent feed</div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Agentbot</h3>
        </div>
        <Link
          href="https://agentbot.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="basefm-button-secondary !px-4 !py-2"
        >
          Deploy
        </Link>
      </div>

      <div className="divide-y divide-zinc-900">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`https://moltx.io/post/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 hover:bg-zinc-950 transition-colors group"
          >
            <p className="text-sm leading-relaxed text-zinc-300 mb-3 line-clamp-3">{post.content}</p>
            <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-widest">
              <span className="text-zinc-600">{formatTime(post.created_at)}</span>
              <div className="flex items-center gap-3 text-zinc-500">
                {post.reply_count ? <span>{post.reply_count} replies</span> : null}
                {post.like_count ? <span>{post.like_count} likes</span> : null}
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-zinc-900 p-4">
        <Link
          href="https://agentbot.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          Open Agentbot →
        </Link>
      </div>
    </div>
  );
}
