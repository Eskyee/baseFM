'use client';

import { 
  Swap, 
  SwapAmountInput, 
  SwapToggleButton, 
  SwapButton, 
  SwapMessage, 
  SwapToast 
} from '@coinbase/onchainkit/swap'; 
import { useAccount } from 'wagmi';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

export function StationSwap() {
  const { address } = useAccount();

  const ETHToken = {
    address: '',
    chainId: 8453,
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
    image: 'https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/chain/base-symbol-color.svg',
  };

  const RAVEToken = {
    address: DJ_TOKEN_CONFIG.address,
    chainId: 8453,
    decimals: 18,
    name: DJ_TOKEN_CONFIG.name,
    symbol: DJ_TOKEN_CONFIG.symbol,
    image: '/IMG_raveculture.png',
  };

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A]">
      <h3 className="text-[#F5F5F5] font-mono font-semibold text-sm mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Station Swap
      </h3>
      
      <Swap>
        {/* @ts-ignore */}
        <SwapAmountInput
          label="Sell"
          swappableTokens={[ETHToken]}
          type="from"
        />
        <SwapToggleButton />
        {/* @ts-ignore */}
        <SwapAmountInput
          label="Buy"
          swappableTokens={[RAVEToken]}
          type="to"
        />
        <SwapButton className="w-full mt-4 !bg-[#0052FF] !text-white !font-mono !font-bold hover:opacity-90 transition-opacity" />
        <SwapMessage />
        <SwapToast />
      </Swap>
      
      <p className="text-[#666] text-[10px] font-mono mt-3 text-center">
        Powered by Coinbase OnchainKit
      </p>
    </div>
  );
}
