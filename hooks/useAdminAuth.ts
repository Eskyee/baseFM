'use client';

import { useCallback, useEffect } from 'react';
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

// Module-level state so the cached signature survives navigation between
// admin pages (which each remount their own component). Without this, every
// nav would drop the cache and prompt a fresh sign popup.
let cachedHeaders: CachedHeaders | null = null;
let inFlight: Promise<Record<string, string>> | null = null;

export function useAdminAuth() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Clear cached signature when the wallet disconnects or switches.
  // Without this, signing out and reconnecting the same wallet within the
  // 4-min cache window would skip re-signing — a stale admin session.
  useEffect(() => {
    if (!address) {
      cachedHeaders = null;
      inFlight = null;
      return;
    }
    if (cachedHeaders && cachedHeaders.wallet.toLowerCase() !== address.toLowerCase()) {
      cachedHeaders = null;
      inFlight = null;
    }
  }, [address]);

  const buildAdminHeaders = useCallback(async () => {
    if (!address) {
      throw new Error('Connect your admin wallet first');
    }

    const now = Date.now();
    if (
      cachedHeaders &&
      cachedHeaders.wallet.toLowerCase() === address.toLowerCase() &&
      cachedHeaders.expiresAt > now
    ) {
      return cachedHeaders.headers;
    }

    // Single-flight: if a signature request is already in progress for this
    // wallet, every concurrent caller awaits the same promise instead of
    // popping its own wallet window.
    if (inFlight) {
      return inFlight;
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

      cachedHeaders = {
        wallet: address,
        expiresAt: Date.now() + ADMIN_AUTH_CACHE_MS,
        headers,
      };

      return headers;
    })();

    inFlight = promise;
    try {
      return await promise;
    } finally {
      inFlight = null;
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
