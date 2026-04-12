import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

export type TokenSurface = {
  id: string;
  name: string;
  symbol: string;
  network: string;
  contract: string;
  purpose: string;
  detail: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export const AGENTBOT_SOLANA_TOKEN_MINT = '9V4m199eohMgy7bB7MbXhDacUur6NzpgZVrhfux5pump';

export const TOKEN_SURFACES: TokenSurface[] = [
  {
    id: 'rave-base',
    name: 'RAVE / baseFM',
    symbol: DJ_TOKEN_CONFIG.symbol,
    network: 'Base',
    contract: DJ_TOKEN_CONFIG.address,
    purpose: 'Base-side station token for DJ access, tips, and the wallet-native radio path.',
    detail: `The public baseFM DJ gate currently checks ${DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()}+ ${DJ_TOKEN_CONFIG.symbol} on Base.`,
    primaryHref: `https://basescan.org/token/${DJ_TOKEN_CONFIG.address}`,
    primaryLabel: 'BaseScan',
    secondaryHref: `https://app.uniswap.org/#/swap?chain=base&outputCurrency=${DJ_TOKEN_CONFIG.address}`,
    secondaryLabel: 'Swap on Base',
  },
  {
    id: 'agentbot-solana',
    name: 'Agentbot',
    symbol: 'AGENTBOT',
    network: 'Solana',
    contract: AGENTBOT_SOLANA_TOKEN_MINT,
    purpose: 'Solana community token for the wider Agentbot identity, perks, and free-credit path.',
    detail: 'This is the parallel community token that connects baseFM listeners and DJs to the wider Agentbot ecosystem.',
    primaryHref: `https://solscan.io/token/${AGENTBOT_SOLANA_TOKEN_MINT}`,
    primaryLabel: 'Solscan',
    secondaryHref: 'https://agentbot.sh/dashboard/community',
    secondaryLabel: 'Agentbot Community',
  },
];
