'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface UseTokenGateOptions {
  tokenAddress?: string;
  requiredAmount?: number;
  tokenType?: 'ERC20' | 'ERC721';
}

interface TokenGateResult {
  hasAccess: boolean;
  isChecking: boolean;
  balance: string;
  requiredAmount: string;
  tokenSymbol?: string;
  error: string | null;
  checkAccess: () => Promise<void>;
}

export function useTokenGate(options: UseTokenGateOptions): TokenGateResult {
  const { address, isConnected } = useAccount();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [balance, setBalance] = useState('0');
  const [tokenSymbol, setTokenSymbol] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    if (!options.tokenAddress || !address || !isConnected) {
      setHasAccess(false);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        tokenAddress: options.tokenAddress,
        walletAddress: address,
        requiredAmount: (options.requiredAmount || 1).toString(),
        tokenType: options.tokenType || 'ERC20',
      });

      const response = await fetch(`/api/token/check?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to check token access');
      }

      const data = await response.json();
      setHasAccess(data.hasAccess);
      setBalance(data.balance);
      setTokenSymbol(data.tokenSymbol);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHasAccess(false);
    } finally {
      setIsChecking(false);
    }
  }, [address, isConnected, options.tokenAddress, options.requiredAmount, options.tokenType]);

  useEffect(() => {
    // If no token gating required, grant access
    if (!options.tokenAddress) {
      setHasAccess(true);
      return;
    }

    // If wallet not connected, no access
    if (!isConnected || !address) {
      setHasAccess(false);
      return;
    }

    checkAccess();
  }, [address, isConnected, options.tokenAddress, checkAccess]);

  return {
    hasAccess,
    isChecking,
    balance,
    requiredAmount: (options.requiredAmount || 1).toString(),
    tokenSymbol,
    error,
    checkAccess,
  };
}
