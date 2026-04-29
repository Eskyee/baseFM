'use client';

import { useAccount, useBalance } from 'wagmi';
import { base } from 'wagmi/chains';
import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';
import { Identity, Avatar, Name } from '@coinbase/onchainkit/identity';
import { TransactionHistory } from '@/components/TransactionHistory';
import { TokenSurfacePanel } from '@/components/TokenSurfacePanel';
import { AGENTBOT_SOLANA_TOKEN_MINT } from '@/lib/token/surfaces';

export default function WalletPage() {
  const { isConnected, address } = useAccount();

  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
    chainId: base.id,
  });

  const { data: tokenBalance, isLoading: tokenLoading } = useBalance({
    address,
    token: DJ_TOKEN_CONFIG.address,
    chainId: base.id,
  });

  const fundUrl = 'https://www.coinbase.com/buy';
  const swapUrl = `https://app.uniswap.org/#/swap?chain=base&outputCurrency=${DJ_TOKEN_CONFIG.address}`;
  const geckoUrl = `https://www.geckoterminal.com/base/tokens/${DJ_TOKEN_CONFIG.address}`;

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="basefm-kicker text-blue-500">Wallet</span>
              <span className="basefm-kicker text-zinc-500">Base funds and station access</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
                Connect your wallet.
                <br />
                <span className="text-zinc-700">View balances and station access.</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
                Use a Base wallet to view ETH, the Base-side RAVE/baseFM station token, recent transactions, and the wider Solana Agentbot token path that sits around the broader community layer.
              </p>
            </div>
            <WalletConnect />
          </div>
        </section>

        <section className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
            <TokenSurfacePanel subtitle="Connect when you want live Base balances. The token map stays visible either way so the Base-side station token and the Solana Agentbot token are both clear." />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Wallet</span>
            <span className="basefm-kicker text-zinc-500">Base network profile</span>
          </div>

          <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-black p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                {address ? (
                  <Identity address={address} className="!bg-transparent">
                    <Avatar className="w-14 h-14 border border-zinc-900" />
                  </Identity>
                ) : null}
                <div className="min-w-0">
                  {address ? (
                    <Identity address={address} className="!bg-transparent">
                      <Name className="text-white text-lg font-bold uppercase tracking-tight block truncate" />
                    </Identity>
                  ) : null}
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'No wallet'}
                  </p>
                </div>
              </div>

              <div className="grid gap-px bg-zinc-900 sm:grid-cols-3">
                <div className="bg-black p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">ETH</div>
                  <div className="text-2xl font-bold tracking-tight text-white">
                    {ethLoading ? '...' : ethBalance ? parseFloat(ethBalance.formatted).toFixed(4) : '0.0000'}
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">Base network gas and payments</div>
                </div>
                <div className="bg-black p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{DJ_TOKEN_CONFIG.symbol}</div>
                  <div className="text-2xl font-bold tracking-tight text-white">
                    {tokenLoading ? '...' : tokenBalance ? parseFloat(tokenBalance.formatted).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">Station token and access path</div>
                </div>
                <div className="bg-black p-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">AGENTBOT</div>
                  <div className="text-sm font-bold tracking-tight text-white break-all">
                    {AGENTBOT_SOLANA_TOKEN_MINT}
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">Solana community token for the wider Agentbot path</div>
                </div>
              </div>
            </div>

            <div className="bg-black p-6 sm:p-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Next moves</div>
              <div className="space-y-3">
                <Link href={fundUrl} target="_blank" rel="noopener noreferrer" className="basefm-panel block p-4 hover:bg-zinc-950 transition-colors">
                  <div className="text-sm font-bold uppercase tracking-wider text-white mb-1">Buy crypto</div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Onramp to Base and top up your wallet cleanly.</p>
                </Link>
                <Link href={swapUrl} target="_blank" rel="noopener noreferrer" className="basefm-panel block p-4 hover:bg-zinc-950 transition-colors">
                  <div className="text-sm font-bold uppercase tracking-wider text-white mb-1">Swap tokens</div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Use Uniswap for ETH, USDC, and {DJ_TOKEN_CONFIG.symbol}.</p>
                </Link>
                <Link href={geckoUrl} target="_blank" rel="noopener noreferrer" className="basefm-panel block p-4 hover:bg-zinc-950 transition-colors">
                  <div className="text-sm font-bold uppercase tracking-wider text-white mb-1">Token chart</div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Open GeckoTerminal for price and pair context.</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <TokenSurfacePanel subtitle="This wallet screen tracks your Base-side station access directly and shows the parallel Solana Agentbot token used across the wider ecosystem." />
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20 space-y-10">
          <div className="max-w-2xl">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Station access</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
              Funding and access.
              <br />
              <span className="text-zinc-700">What the wallet is for.</span>
            </h2>
          </div>

          <div className="grid gap-px bg-zinc-900 lg:grid-cols-3">
            {[
              ['DJ access', `${DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()}+ ${DJ_TOKEN_CONFIG.symbol} is the public DJ gate.`],
              ['Community path', 'Wallet identity also powers token-gated community surfaces and onchain support.'],
              ['Low-fee payments', 'Base keeps tips, tickets, and wallet-native actions practical for the station.'],
            ].map(([title, body]) => (
              <div key={title} className="bg-black p-5">
                <div className="text-sm font-bold uppercase tracking-wider text-white mb-2">{title}</div>
                <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {address ? <TransactionHistory walletAddress={address} /> : null}
        </div>
      </section>
    </main>
  );
}
