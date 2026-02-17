'use client';

import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isReady: boolean;
  hasUpdate: boolean;
  version: string | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isReady: false,
    hasUpdate: false,
    version: null,
  });

  // Clear all caches and reload
  const clearCacheAndReload = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage('CLEAR_CACHE');
      // Wait a moment for caches to clear
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    // Force reload without cache
    window.location.reload();
  }, []);

  // Skip waiting and activate new service worker
  const activateUpdate = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage('SKIP_WAITING');
    }
  }, []);

  // Get current cache version
  const getVersion = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data?.version || null);
        };
        navigator.serviceWorker.controller.postMessage('GET_VERSION', [
          messageChannel.port2,
        ]);
        // Timeout after 1 second
        setTimeout(() => resolve(null), 1000);
      } else {
        resolve(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Listen for service worker updates
    const handleControllerChange = () => {
      setState((prev) => ({ ...prev, hasUpdate: true }));
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATED') {
        setState((prev) => ({
          ...prev,
          hasUpdate: true,
          version: event.data.version,
        }));
      }
    };

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange
    );
    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Get initial version
    navigator.serviceWorker.ready.then(async () => {
      const version = await getVersion();
      setState((prev) => ({ ...prev, isReady: true, version }));
    });

    return () => {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange
      );
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [getVersion]);

  return {
    ...state,
    clearCacheAndReload,
    activateUpdate,
    getVersion,
  };
}
