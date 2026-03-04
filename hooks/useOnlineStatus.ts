'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  checkConnection: () => Promise<boolean>;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  // Check actual connectivity by pinging an endpoint
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Initial state from navigator
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      // If we were offline, mark it so we can show "reconnected" message
      if (!isOnline) {
        setWasOffline(true);
        // Reset wasOffline after showing reconnected message
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check every 30 seconds when online
    // More frequent check every 5 seconds when offline
    let intervalId: NodeJS.Timeout;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        const connected = await checkConnection();
        if (connected !== isOnline) {
          if (connected) {
            handleOnline();
          } else {
            handleOffline();
          }
        }
      }, isOnline ? 30000 : 5000);
    };

    startPolling();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline, checkConnection]);

  return { isOnline, wasOffline, checkConnection };
}
