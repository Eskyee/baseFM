'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { base } from 'wagmi/chains';
import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Format address for display
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 sm:gap-3 pl-2">
        {/* Avatar + Name with proper spacing */}
        <div className="flex items-center gap-2 px-2 py-1.5 bg-[#1A1A1A] rounded-lg">
          <Identity
            address={address}
            chain={base}
            className="!bg-transparent !p-0 !gap-2 !items-center"
          >
            <Avatar
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-purple-500/30"
              defaultComponent={
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {address.slice(2, 4).toUpperCase()}
                </div>
              }
            />
            <Name
              className="hidden sm:block text-[#F5F5F5] text-sm font-medium max-w-[80px] truncate"
            />
          </Identity>
          {/* Fallback short address on mobile */}
          <span className="sm:hidden text-[#888] text-xs font-mono">
            {shortAddress}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-[#333] text-[#888] text-xs sm:text-sm rounded-lg hover:bg-[#444] hover:text-[#F5F5F5] transition-colors"
        >
          Exit
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-lg shadow-purple-500/20"
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Entering...
        </span>
      ) : (
        'Enter'
      )}
    </button>
  );
}
