'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { DJ_TOKEN_CONFIG, formatTokenAmount, parseTokenAmount } from '@/lib/token/config';

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

interface DJAccessResult {
  hasAccess: boolean;
  isAdmin: boolean;
  isChecking: boolean;
  balance: string;
  requiredAmount: string;
  tokenSymbol: string;
  error: string | null;
  refetch: () => void;
}

export function useDJAccess(): DJAccessResult {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminChecking, setIsAdminChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAdminWallet() {
      if (!isConnected || !address) {
        setIsAdmin(false);
        setIsAdminChecking(false);
        return;
      }

      setIsAdminChecking(true);

      try {
        const response = await fetch(`/api/admin/check?wallet=${address}`);
        if (!response.ok) {
          throw new Error('Failed to check admin wallet');
        }

        const data = await response.json();
        if (!cancelled) {
          setIsAdmin(Boolean(data?.isAdmin));
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setIsAdminChecking(false);
        }
      }
    }

    checkAdminWallet();

    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  const {
    data: balanceData,
    isLoading,
    refetch,
    isError,
  } = useReadContract({
    address: DJ_TOKEN_CONFIG.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  useEffect(() => {
    if (isError) {
      setError('Failed to check token balance');
    } else {
      setError(null);
    }
  }, [isError]);

  const balance = balanceData ? formatTokenAmount(balanceData, DJ_TOKEN_CONFIG.decimals) : '0';
  const balanceNumber = parseInt(balance, 10);
  const hasTokenAccess = balanceNumber >= DJ_TOKEN_CONFIG.requiredAmount;
  const hasAccess = isAdmin || hasTokenAccess;

  return {
    hasAccess,
    isAdmin,
    isChecking: isLoading || isAdminChecking,
    balance,
    requiredAmount: DJ_TOKEN_CONFIG.requiredAmount.toString(),
    tokenSymbol: DJ_TOKEN_CONFIG.symbol,
    error,
    refetch: () => refetch(),
  };
}
