'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface FollowButtonProps {
  djId: string;
  djName: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FollowButton({ djId, djName, size = 'md' }: FollowButtonProps) {
  const { address, isConnected } = useAccount();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if already following
  useEffect(() => {
    async function checkFollowing() {
      if (!address) return;

      try {
        const res = await fetch(`/api/favorites?wallet=${address}`);
        if (res.ok) {
          const data = await res.json();
          const following = data.favorites?.some((f: { dj_id: string }) => f.dj_id === djId);
          setIsFollowing(following);
        }
      } catch (err) {
        console.error('Failed to check following:', err);
      }
    }

    checkFollowing();
  }, [address, djId]);

  const handleToggle = async () => {
    if (!address || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        // Unfollow
        const res = await fetch(`/api/favorites?wallet=${address}&djId=${djId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setIsFollowing(false);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to unfollow');
          console.error('Unfollow error:', data);
        }
      } else {
        // Follow
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address, djId }),
        });

        if (res.ok) {
          setIsFollowing(true);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);

          // Request push notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();

            if (permission === 'granted' && 'serviceWorker' in navigator) {
              // Subscribe to push notifications
              try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                });

                await fetch('/api/push/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    walletAddress: address,
                    subscription: subscription.toJSON(),
                  }),
                });
              } catch (err) {
                console.error('Failed to subscribe to push:', err);
              }
            }
          }
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to follow');
          console.error('Follow error:', data);
        }
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`${sizeClasses[size]} rounded-lg font-medium transition-all disabled:opacity-50 ${
          error
            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
            : showSuccess
            ? 'bg-green-500/20 text-green-400'
            : isFollowing
            ? 'bg-[#1A1A1A] text-[#888] hover:text-red-400 hover:bg-red-500/10'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title={error || undefined}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        ) : error ? (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Retry
          </span>
        ) : showSuccess ? (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Followed!
          </span>
        ) : isFollowing ? (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Following
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Follow
          </span>
        )}
      </button>
      {error && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-400 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
}
