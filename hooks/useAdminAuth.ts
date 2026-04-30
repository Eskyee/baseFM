'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
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

const ADMIN_AUTH_CACHE_MS = 20 * 60 * 1000; // 20 minutes
const STORAGE_KEY = 'basefm_admin_session';

function loadFromStorage(): CachedHeaders | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedHeaders;
    if (parsed.expiresAt > Date.now()) return parsed;
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(cache: CachedHeaders): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export function useAdminAuth() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const cacheRef = useRef<CachedHeaders | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Load cached session on mount
  useEffect(() => {
    const cached = loadFromStorage();
    if (cached && address && cached.wallet.toLowerCase() === address.toLowerCase()) {
      cacheRef.current = cached;
      setIsAuthenticated(true);
    }
  }, [address]);

  const signIn = useCallback(async () => {
    if (!address) throw new Error('Connect your admin wallet first');
    if (isSigningIn) return;

    setIsSigningIn(true);
    try {
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

      const cached: CachedHeaders = {
        wallet: address,
        expiresAt: Date.now() + ADMIN_AUTH_CACHE_MS,
        headers,
      };

      cacheRef.current = cached;
      saveToStorage(cached);
      setIsAuthenticated(true);
    } finally {
      setIsSigningIn(false);
    }
  }, [address, signMessageAsync, isSigningIn]);

  const buildAdminHeaders = useCallback(async () => {
    if (!address) throw new Error('Connect your admin wallet first');

    // Try in-memory cache
    const now = Date.now();
    if (
      cacheRef.current &&
      cacheRef.current.wallet.toLowerCase() === address.toLowerCase() &&
      cacheRef.current.expiresAt > now
    ) {
      return cacheRef.current.headers;
    }

    // Try localStorage
    const stored = loadFromStorage();
    if (stored && stored.wallet.toLowerCase() === address.toLowerCase()) {
      cacheRef.current = stored;
      setIsAuthenticated(true);
      return stored.headers;
    }

    // Need fresh signature
    await signIn();
    return cacheRef.current!.headers;
  }, [address, signIn]);

  const adminFetch = useCallback(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const authHeaders = await buildAdminHeaders();
    const headers = new Headers(init.headers || {});

    for (const [key, value] of Object.entries(authHeaders)) {
      headers.set(key, value);
    }

    return fetch(input, { ...init, headers });
  }, [buildAdminHeaders]);

  const signOut = useCallback(() => {
    cacheRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return {
    address,
    adminFetch,
    buildAdminHeaders,
    signIn,
    signOut,
    isAuthenticated,
    isSigningIn,
  };
}
