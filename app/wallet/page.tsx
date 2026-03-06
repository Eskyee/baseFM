'use client';

import { useAccount, useBalance } from 'wagmi';
import { base } from 'wagmi/chains';
import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';
import { Identity, Avatar, Name } from '@coinbase/onchainkit/identity';
import { TransactionHistory } from '@/components/TransactionHistory';

export default function WalletPage() {
  const { isConnected, address } = useAccount();

  // ETH balance on Base
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
    chainId: base.id,
  });

  // RAVE token balance on Base
  const { data: raveBalance, isLoading: raveLoading } = useBalance({
    address,
    token: DJ_TOKEN_CONFIG.address,
    chainId: base.id,
  });

  // Coinbase buy URL (reliable, always works)
  const fundUrl = 'https://www.coinbase.com/buy';

  // Uniswap swap URL for RAVE token on Base
  const swapUrl = `https://app.uniswap.org/#/swap?chain=base&outputCurrency=${DJ_TOKEN_CONFIG.address}`;

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
            <p className="text-[#888] text-sm mb-6">Connect to view balance and manage funds</p>
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">

        {/* Balance Card */}
        <section className="bg-[#1A1A1A] rounded-2xl p-5">
          {/* Identity Row */}
          {address && (
            <div className="flex items-center gap-3 mb-5">
              <Identity address={address} className="!bg-transparent">
                <Avatar className="w-10 h-10 rounded-full" />
              </Identity>
              <div className="flex-1 min-w-0">
                <Identity address={address} className="!bg-transparent">
                  <Name className="text-[#F5F5F5] text-sm font-semibold truncate block" />
                </Identity>
                <p className="text-[#666] text-xs font-mono truncate">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
              <span className="px-2 py-1 bg-[#0052FF]/10 text-[#0052FF] text-[10px] font-semibold rounded-full">
                Base
              </span>
            </div>
          )}

          {/* Balances */}
          <div className="space-y-3">
            {/* ETH */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#627EEA]/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#627EEA]" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16.498 4v8.87l7.497 3.35L16.498 4z" fillOpacity="0.6"/>
                    <path d="M16.498 4L9 16.22l7.498-3.35V4z"/>
                    <path d="M16.498 21.968v6.027L24 17.616l-7.502 4.352z" fillOpacity="0.6"/>
                    <path d="M16.498 27.995v-6.028L9 17.616l7.498 10.379z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[#F5F5F5] text-sm font-medium">ETH</p>
                  <p className="text-[#666] text-[10px]">Ethereum</p>
                </div>
              </div>
              <span className="text-[#F5F5F5] text-sm font-semibold tabular-nums">
                {ethLoading ? (
                  <span className="inline-block w-16 h-4 bg-[#252525] rounded animate-pulse" />
                ) : ethBalance ? (
                  parseFloat(ethBalance.formatted).toFixed(4)
                ) : (
                  '0.0000'
                )}
              </span>
            </div>

            <div className="border-t border-[#252525]" />

            {/* RAVE */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#F5F5F5] text-sm font-medium">{DJ_TOKEN_CONFIG.symbol}</p>
                  <p className="text-[#666] text-[10px]">{DJ_TOKEN_CONFIG.name}</p>
                </div>
              </div>
              <span className="text-[#F5F5F5] text-sm font-semibold tabular-nums">
                {raveLoading ? (
                  <span className="inline-block w-16 h-4 bg-[#252525] rounded animate-pulse" />
                ) : raveBalance ? (
                  parseFloat(raveBalance.formatted).toLocaleString(undefined, { maximumFractionDigits: 0 })
                ) : (
                  '0'
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Transaction History */}
        {address && <TransactionHistory walletAddress={address} />}

        {/* GBP Conversion Guide for UK Users */}
        <section className="bg-[#1A1A1A] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🇬🇧</span>
            <h3 className="text-sm font-semibold text-[#F5F5F5]">USD → GBP Guide</h3>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex-1 text-center p-2 bg-[#0A0A0A] rounded-lg">
              <p className="text-[#888]">$1</p>
              <p className="text-[#F5F5F5] font-medium">£0.79</p>
            </div>
            <div className="flex-1 text-center p-2 bg-[#0A0A0A] rounded-lg">
              <p className="text-[#888]">$10</p>
              <p className="text-[#F5F5F5] font-medium">£7.90</p>
            </div>
            <div className="flex-1 text-center p-2 bg-[#0A0A0A] rounded-lg">
              <p className="text-[#888]">$25</p>
              <p className="text-[#F5F5F5] font-medium">£19.75</p>
            </div>
            <div className="flex-1 text-center p-2 bg-[#0A0A0A] rounded-lg">
              <p className="text-[#888]">$50</p>
              <p className="text-[#F5F5F5] font-medium">£39.50</p>
            </div>
            <div className="flex-1 text-center p-2 bg-[#0A0A0A] rounded-lg">
              <p className="text-[#888]">$100</p>
              <p className="text-[#F5F5F5] font-medium">£79</p>
            </div>
          </div>
          <p className="text-[#666] text-[10px] mt-2 text-center">
            1 USDC = $1 USD · Approximate GBP rates
          </p>
        </section>

        {/* Buy Crypto — fixed URL */}
        <section className="bg-[#1A1A1A] rounded-2xl p-4 active:scale-[0.98] transition-transform">
          <Link
            href={fundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#0052FF] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 111 111" fill="currentColor">
                  <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F5F5F5]">Buy Crypto</h2>
                <p className="text-xs text-[#888]">Onramp to Base network</p>
              </div>
              <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </section>

        {/* Swap Tokens */}
        <section className="bg-[#1A1A1A] rounded-2xl p-4 active:scale-[0.98] transition-transform">
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
                <p className="text-xs text-[#888]">ETH, USDC, {DJ_TOKEN_CONFIG.symbol} on Uniswap</p>
              </div>
              <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </section>

        {/* Get RAVE */}
        <section className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-4 border border-purple-500/20 active:scale-[0.98] transition-transform">
          <Link
            href={`https://www.geckoterminal.com/base/tokens/${DJ_TOKEN_CONFIG.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-[#F5F5F5]">Get {DJ_TOKEN_CONFIG.symbol}</h2>
                <p className="text-xs text-purple-300">{DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()}+ unlocks community</p>
              </div>
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </section>

        {/* GeckoTerminal Chart */}
        <section className="rounded-2xl overflow-hidden border border-[#1A1A1A]">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A]">
            <h3 className="text-sm font-semibold text-[#F5F5F5]">{DJ_TOKEN_CONFIG.symbol} Chart</h3>
            <Link
              href={`https://www.geckoterminal.com/base/tokens/${DJ_TOKEN_CONFIG.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#888] hover:text-[#F5F5F5] transition-colors"
            >
              GeckoTerminal ↗
            </Link>
          </div>
          <iframe
            src={`https://www.geckoterminal.com/base/tokens/${DJ_TOKEN_CONFIG.address}?embed=1&info=0&swaps=0`}
            className="w-full border-none bg-black"
            style={{ height: '300px' }}
            title="RAVE Price Chart"
            allow="clipboard-write"
          />
        </section>

        {/* Info */}
        <p className="text-center text-xs text-[#666] pt-1">
          Base network · Low fees · Fast
        </p>
      </div>
    </div>
  );
}