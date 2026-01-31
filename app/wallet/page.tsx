'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';

export default function WalletPage() {
  const { isConnected, address } = useAccount();

  // Coinbase Pay URL for on-ramp
  const fundUrl = address
    ? `https://pay.coinbase.com/buy/select-asset?appId=basefm&destinationWallets=[{"address":"${address}","blockchains":["base"]}]`
    : 'https://pay.coinbase.com/buy/select-asset';

  // Uniswap swap URL for RAVE token on Base
  const swapUrl = `https://app.uniswap.org/#/swap?chain=base&outputCurrency=0x1DBf2954FFEC96a333ae20F00c0bC40471ad8888`;

  if (!isConnected) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#F5F5F5] mb-3">Wallet</h1>
            <p className="text-[#888] text-sm mb-6">Connect to access fund and swap</p>
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-1">Wallet</h1>
          <p className="text-[#888] text-xs">Fund or swap tokens on Base</p>
        </div>

        {/* Fund Section */}
        <section className="bg-[#1A1A1A] rounded-2xl p-4 mb-3 active:scale-[0.98] transition-transform">
          <Link
            href={fundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F5F5F5]">Buy Crypto</h2>
                <p className="text-xs text-[#888]">Card or bank via Coinbase</p>
              </div>
              <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </section>

        {/* Swap Section */}
        <section className="bg-[#1A1A1A] rounded-2xl p-4 mb-3 active:scale-[0.98] transition-transform">
          <Link
            href={swapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F5F5F5]">Swap Tokens</h2>
                <p className="text-xs text-[#888]">ETH, USDC, RAVE on Uniswap</p>
              </div>
              <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </section>

        {/* Get RAVE Section */}
        <section className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-4 border border-purple-500/20 active:scale-[0.98] transition-transform">
          <Link
            href="https://base.meme/coin/base:0x1DBf2954FFEC96a333ae20F00c0bC40471ad8888"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎵</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F5F5F5]">Get RAVE</h2>
                <p className="text-xs text-purple-300">5K+ unlocks community features</p>
              </div>
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </section>

        {/* Info */}
        <p className="text-center text-xs text-[#666] mt-4">
          Base network · Low fees · Fast
        </p>
      </div>
    </div>
  );
}
