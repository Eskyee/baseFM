'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PublicEvent } from '@/types/event';

// ============================================================
// Event hooks — fetch events, single event, and access status
// ============================================================

interface UseEventsOptions {
  includeEnded?: boolean;
  limit?: number;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (options.includeEnded) params.set('includeEnded', 'true');
      if (options.limit) params.set('limit', options.limit.toString());

      const res = await fetch(`/api/events/list?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load events');

      const data = await res.json();
      setEvents(data.events ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [options.includeEnded, options.limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
}

export function useEvent(id: string | null) {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`/api/events/list?id=${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Event not found');
        } else {
          throw new Error('Failed to load event');
        }
        setEvent(null);
        return;
      }

      const data = await res.json();
      setEvent(data.event ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, isLoading, error, refetch: fetchEvent };
}

type AccessStatus = 'none' | 'confirmed' | 'used' | 'expired';

interface AccessResult {
  hasAccess: boolean;
  status: AccessStatus;
  isChecking: boolean;
  error: string | null;
  checkAccess: () => Promise<void>;
}

export function useEventAccess(
  eventId: string | null,
  address: string | undefined
): AccessResult {
  const [hasAccess, setHasAccess] = useState(false);
  const [status, setStatus] = useState<AccessStatus>('none');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    if (!eventId || !address) {
      setHasAccess(false);
      setStatus('none');
      return;
    }

    try {
      setIsChecking(true);
      setError(null);

      const res = await fetch(
        `/api/events/access?eventId=${encodeURIComponent(eventId)}&wallet=${encodeURIComponent(address)}`
      );

      if (!res.ok) {
        throw new Error('Failed to check access');
      }

      const data = await res.json();
      setHasAccess(data.hasAccess ?? false);
      setStatus((data.status as AccessStatus) ?? 'none');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setHasAccess(false);
      setStatus('none');
    } finally {
      setIsChecking(false);
    }
  }, [eventId, address]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return { hasAccess, status, isChecking, error, checkAccess };
}
