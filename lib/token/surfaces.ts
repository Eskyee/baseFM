import {
  DJ_TOKEN_CONFIG,
  AGENTBOT_TOKEN_CONFIG,
  ACCESS_USD_FLOOR,
} from '@/lib/token/config';

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

export const AGENTBOT_SOLANA_TOKEN_MINT = AGENTBOT_TOKEN_CONFIG.mint;

export const TOKEN_SURFACES: TokenSurface[] = [
  {
    id: 'rave-base',
    name: 'RAVE / RaveCulture',
    symbol: DJ_TOKEN_CONFIG.symbol,
    network: 'Base',
    contract: DJ_TOKEN_CONFIG.address,
    purpose: `Base-side access token — ${DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()} ${DJ_TOKEN_CONFIG.symbol} (~$${ACCESS_USD_FLOOR}) gates a 2-hour DJ session.`,
    detail: `Public DJ gate checks ${DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()}+ ${DJ_TOKEN_CONFIG.symbol} on Base. Amount auto-scales to maintain the $${ACCESS_USD_FLOOR} USD floor as price moves.`,
    primaryHref: DJ_TOKEN_CONFIG.geckoPoolUrl,
    primaryLabel: 'GeckoTerminal (V4 pool)',
    secondaryHref: `https://app.uniswap.org/#/swap?chain=base&outputCurrency=${DJ_TOKEN_CONFIG.address}`,
    secondaryLabel: 'Swap on Base',
  },
  {
    id: 'agentbot-solana',
    name: 'Agentbot',
    symbol: AGENTBOT_TOKEN_CONFIG.symbol,
    network: 'Solana',
    contract: AGENTBOT_TOKEN_CONFIG.mint,
    purpose: `Solana-side access token — equivalent ~$${ACCESS_USD_FLOOR} value gates the same DJ rights as RAVE.`,
    detail: 'Parallel community token for the wider Agentbot identity, perks, and free-credit path. Same DJ access as RAVE when held at $25 USD equivalent.',
    primaryHref: AGENTBOT_TOKEN_CONFIG.tokenInfoUrl,
    primaryLabel: 'agentbot.sh/token',
    secondaryHref: `https://solscan.io/token/${AGENTBOT_TOKEN_CONFIG.mint}`,
    secondaryLabel: 'Solscan',
  },
];
