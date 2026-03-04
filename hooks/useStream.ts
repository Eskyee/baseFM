'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Stream, StreamRow, streamFromRow } from '@/types/stream';

export function useStream(streamId: string) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!streamId) {
      setIsLoading(false);
      return;
    }

    // Fetch initial stream data
    async function fetchStream() {
      try {
        const response = await fetch(`/api/streams/${streamId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stream');
        }
        const data = await response.json();
        setStream(data.stream);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStream();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`stream:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'streams',
          filter: `id=eq.${streamId}`,
        },
        (payload) => {
          setStream(streamFromRow(payload.new as StreamRow));
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Stream subscription error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/streams/${streamId}`);
      if (!response.ok) throw new Error('Failed to fetch stream');
      const data = await response.json();
      setStream(data.stream);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return { stream, isLoading, error, refetch };
}
