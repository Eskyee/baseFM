// Supported tokens for tipping on Base network

export interface TipToken {
  symbol: string;
  name: string;
  address: `0x${string}` | 'native';
  decimals: number;
  icon: string;
  color: string;
}

export const TIP_TOKENS: TipToken[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: 'native',
    decimals: 18,
    icon: '⟠',
    color: '#627EEA',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    icon: '$',
    color: '#2775CA',
  },
  {
    symbol: 'RAVE',
    name: 'RaveCulture',
    address: '0xdf3c79a5759eeedb844e7481309a75037b8e86f5',
    decimals: 18,
    icon: '🎵',
    color: '#8B5CF6',
  },
  {
    symbol: 'cbBTC',
    name: 'Coinbase BTC',
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    decimals: 8,
    icon: '₿',
    color: '#F7931A',
  },
];

// Preset tip amounts (in USD equivalent for display)
export const TIP_PRESETS = [
  { amount: 1, label: '$1' },
  { amount: 5, label: '$5' },
  { amount: 10, label: '$10' },
  { amount: 25, label: '$25' },
];

// ERC20 transfer ABI
export const ERC20_TRANSFER_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Get token by symbol
export function getTokenBySymbol(symbol: string): TipToken | undefined {
  return TIP_TOKENS.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
}

// Format token amount for display
export function formatTipAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 4);
  return `${whole}.${fractionStr}`.replace(/\.?0+$/, '');
}

// Parse tip amount to bigint
export function parseTipAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
