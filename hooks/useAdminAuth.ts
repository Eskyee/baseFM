'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import {
  createAdminAuthMessage,
  generateAdminNonce,
  getAdminAuthTimestamp,
} from '@/lib/admin/config';

type CachedHeaders = {
  wallet: string;
  expiresAt: number;
  headers: Record<string, string>;
};

const ADMIN_AUTH_CACHE_MS = 4 * 60 * 1000;

export function useAdminAuth() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const cacheRef = useRef<CachedHeaders | null>(null);
  const inFlightRef = useRef<Promise<Record<string, string>> | null>(null);

  // Clear cached signature when the wallet disconnects or switches.
  // Without this, signing out and reconnecting the same wallet within the
  // 4-min cache window would skip re-signing — a stale admin session.
  useEffect(() => {
    const current = cacheRef.current;
    if (!address) {
      cacheRef.current = null;
      inFlightRef.current = null;
      return;
    }
    if (current && current.wallet.toLowerCase() !== address.toLowerCase()) {
      cacheRef.current = null;
      inFlightRef.current = null;
    }
  }, [address]);

  const buildAdminHeaders = useCallback(async () => {
    if (!address) {
      throw new Error('Connect your admin wallet first');
    }

    const now = Date.now();
    if (
      cacheRef.current &&
      cacheRef.current.wallet.toLowerCase() === address.toLowerCase() &&
      cacheRef.current.expiresAt > now
    ) {
      return cacheRef.current.headers;
    }

    // Single-flight: if a signature request is already in progress for this
    // wallet, every concurrent caller awaits the same promise instead of
    // popping its own wallet window.
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    const promise = (async () => {
      const nonce = generateAdminNonce();
      const timestamp = getAdminAuthTimestamp();
      const message = createAdminAuthMessage(nonce, timestamp);
      const signature = await signMessageAsync({ message });

      const headers = {
        'x-wallet-address': address,
        'x-signature': signature,
        'x-nonce': nonce,
        'x-timestamp': timestamp,
      };

      cacheRef.current = {
        wallet: address,
        expiresAt: Date.now() + ADMIN_AUTH_CACHE_MS,
        headers,
      };

      return headers;
    })();

    inFlightRef.current = promise;
    try {
      return await promise;
    } finally {
      inFlightRef.current = null;
    }
  }, [address, signMessageAsync]);

  const adminFetch = useCallback(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const authHeaders = await buildAdminHeaders();
    const headers = new Headers(init.headers || {});

    for (const [key, value] of Object.entries(authHeaders)) {
      headers.set(key, value);
    }

    return fetch(input, {
      ...init,
      headers,
    });
  }, [buildAdminHeaders]);

  return {
    address,
    adminFetch,
    buildAdminHeaders,
  };
}
