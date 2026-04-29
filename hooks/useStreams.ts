'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Stream, StreamRow, StreamStatus, streamFromRow } from '@/types/stream';

interface UseStreamsOptions {
  status?: StreamStatus | StreamStatus[];
  djWalletAddress?: string;
  limit?: number;
  pollInterval?: number; // in milliseconds
}

export function useStreams(options: UseStreamsOptions = {}) {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreams = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (options.status) {
        if (Array.isArray(options.status)) {
          options.status.forEach((s) => params.append('status', s));
        } else {
          params.set('status', options.status);
        }
      }

      if (options.djWalletAddress) {
        params.set('djWalletAddress', options.djWalletAddress);
      }

      if (options.limit) {
        params.set('limit', options.limit.toString());
      }

      const response = await fetch(`/api/streams?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch streams');

      const data = await response.json();
      setStreams(data.streams);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.djWalletAddress, options.limit]);

  useEffect(() => {
    fetchStreams();

    // Set up polling if interval is provided
    let pollTimer: NodeJS.Timeout | null = null;
    if (options.pollInterval) {
      pollTimer = setInterval(fetchStreams, options.pollInterval);
    }

    // Subscribe to realtime updates
    let realtimeFailed = false;
    const channel = supabase
      .channel('streams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streams',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newStream = streamFromRow(payload.new as StreamRow);
            setStreams((prev) => [newStream, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedStream = streamFromRow(payload.new as StreamRow);
            setStreams((prev) =>
              prev.map((s) => (s.id === updatedStream.id ? updatedStream : s))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setStreams((prev) => prev.filter((s) => s.id !== deletedId));
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('Streams realtime subscription failed, using polling fallback:', err);
          realtimeFailed = true;
        }
      });

    // Fallback polling when realtime is unavailable
    const fallbackPoll = !options.pollInterval && !realtimeFailed
      ? setInterval(() => { if (realtimeFailed) fetchStreams(); }, 15000)
      : null;

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (fallbackPoll) clearInterval(fallbackPoll);
      supabase.removeChannel(channel);
    };
  }, [fetchStreams, options.pollInterval]);

  return { streams, isLoading, error, refetch: fetchStreams };
}

export function useLiveStreams() {
  return useStreams({ status: 'LIVE', pollInterval: 10000 });
}
