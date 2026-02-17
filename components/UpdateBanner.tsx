'use client';

import { useEffect, useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { RefreshCw } from 'lucide-react';

export function UpdateBanner() {
  const { hasUpdate, clearCacheAndReload } = useServiceWorker();
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (hasUpdate) {
      // Delay showing banner for smooth appearance
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasUpdate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await clearCacheAndReload();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-[#0052FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#F5F5F5] text-sm font-medium">Update available</p>
            <p className="text-[#888] text-xs">Refresh for the latest version</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
