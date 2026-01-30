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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#F5F5F5] mb-4">Wallet</h1>
            <p className="text-[#888] mb-8">Connect your wallet to access fund and swap features</p>
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Wallet</h1>
          <p className="text-[#888] text-sm">Fund your wallet or swap tokens on Base</p>
        </div>

        {/* Fund Section */}
        <section className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F5]">Fund Wallet</h2>
              <p className="text-xs text-[#888]">Buy crypto with card or bank transfer</p>
            </div>
          </div>
          <p className="text-sm text-[#888] mb-6">
            Add funds to your wallet using Coinbase Onramp. Buy ETH, USDC, and other tokens directly with your credit card or bank account.
          </p>
          <Link
            href={fundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
          >
            Buy Crypto with Coinbase
          </Link>
        </section>

        {/* Swap Section */}
        <section className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F5]">Swap Tokens</h2>
              <p className="text-xs text-[#888]">Exchange tokens on Base network</p>
            </div>
          </div>
          <p className="text-sm text-[#888] mb-6">
            Swap between ETH, USDC, RAVE and other tokens on Base using Uniswap.
          </p>
          <Link
            href={swapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-center transition-colors"
          >
            Swap on Uniswap
          </Link>
        </section>

        {/* Get RAVE Section */}
        <section className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F5]">Get RAVE</h2>
              <p className="text-xs text-purple-300">Support baseFM & unlock features</p>
            </div>
          </div>
          <p className="text-sm text-[#888] mb-6">
            Hold 5,000+ RAVE to join the community, tip DJs, and access exclusive token-gated streams.
          </p>
          <Link
            href="https://base.meme/coin/base:0x1DBf2954FFEC96a333ae20F00c0bC40471ad8888"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg text-center transition-all"
          >
            Buy RAVE on Base.meme
          </Link>
        </section>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#666]">
            All transactions on Base network · Low fees · Fast confirmation
          </p>
        </div>
      </div>
    </div>
  );
}
