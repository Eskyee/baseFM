'use client';

import { useState, useEffect } from 'react';

interface ListenerCountProps {
  streamId: string;
  initialCount?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ListenerCount({
  streamId,
  initialCount = 0,
  showLabel = true,
  size = 'md',
}: ListenerCountProps) {
  const [count, setCount] = useState(initialCount);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let hasLeft = false;

    // Register this viewer
    const registerViewer = async () => {
      try {
        await fetch('/api/viewers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamId, action: 'join' }),
        });
      } catch (error) {
        console.error('Failed to register viewer:', error);
      }
    };

    // Unregister on unmount
    const unregisterViewer = async () => {
      if (hasLeft) return;
      hasLeft = true;

      const payload = JSON.stringify({ streamId, action: 'leave' });

      if (typeof navigator.sendBeacon === 'function') {
        const sent = navigator.sendBeacon('/api/viewers', new Blob([payload], { type: 'application/json' }));
        if (sent) return;
      }

      try {
        await fetch('/api/viewers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
      } catch (error) {
        console.error('Failed to unregister viewer:', error);
      }
    };

    registerViewer();
    setIsLive(true);

    // Poll for viewer count updates
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/viewers?streamId=${streamId}`);
        if (res.ok) {
          const data = await res.json();
          setCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch viewer count:', error);
      }
    }, 10000); // Update every 10 seconds

    const handlePageHide = () => {
      void unregisterViewer();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void unregisterViewer();
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void unregisterViewer();
    };
  }, [streamId]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div className={`flex items-center gap-1.5 ${sizeClasses[size]}`}>
      {isLive && (
        <span className={`${dotSizes[size]} bg-red-500 rounded-full animate-pulse`} />
      )}
      <span className="text-[#F5F5F5] font-medium">{count.toLocaleString()}</span>
      {showLabel && (
        <span className="text-[#888]">
          {count === 1 ? 'listener' : 'listeners'}
        </span>
      )}
    </div>
  );
}
