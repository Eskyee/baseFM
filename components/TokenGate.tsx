'use client';

import { useTokenGate } from '@/hooks/useTokenGate';
import { useAccount } from 'wagmi';
import { WalletConnect } from './WalletConnect';

interface TokenGateProps {
  tokenAddress: string;
  requiredAmount: number;
  tokenType?: 'ERC20' | 'ERC721';
  children: React.ReactNode;
}

export function TokenGate({
  tokenAddress,
  requiredAmount,
  tokenType = 'ERC20',
  children,
}: TokenGateProps) {
  const { isConnected } = useAccount();
  const { hasAccess, isChecking, balance, tokenSymbol, error, checkAccess } =
    useTokenGate({
      tokenAddress,
      requiredAmount,
      tokenType,
    });

  // Wallet not connected
  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="w-12 h-12 text-purple-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          Token-Gated Content
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Connect your wallet to verify access
        </p>
        <WalletConnect />
      </div>
    );
  }

  // Checking access
  if (isChecking) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Checking token balance...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={checkAccess}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="w-12 h-12 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          Insufficient Token Balance
        </h3>
        <p className="text-gray-400 text-sm mb-2">
          You need <span className="text-purple-400 font-medium">{requiredAmount}</span>{' '}
          {tokenSymbol || 'tokens'} to access this stream.
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Your balance: <span className="text-white">{balance}</span>{' '}
          {tokenSymbol || 'tokens'}
        </p>
        <button
          onClick={checkAccess}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Check Again
        </button>
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
}
