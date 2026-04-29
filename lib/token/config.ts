// baseFM Token Configuration
// Two equivalent access paths, both targeting the same USD floor:
//   PATH A — RAVE on Base   (EVM)
//   PATH B — AGENTBOT on Solana
//
// USD floor covers a 2-hour Mux live-streaming session:
//   encoding ~$6 + delivery ~$10 + storage ~$5 + margin = ~$25 floor.
// Token amounts auto-scale to maintain this floor regardless of market price.

export const ACCESS_USD_FLOOR = 25; // dollars per DJ session

// PATH A — RAVE on Base
export const DJ_TOKEN_CONFIG = {
  // RAVE / RaveCulture on Base
  address: '0xdf3c79a5759eeedb844e7481309a75037b8e86f5' as `0x${string}`,

  // Minimum tokens required to DJ — covers Mux USDC costs + profit.
  // 50,000 RAVE ≈ $25 at the time of the v4 pool launch. Auto-scaled at runtime.
  requiredAmount: 50_000,

  // Premium tier — custom token gating
  premiumAmount: 1_000_000,

  decimals: 18,
  symbol: 'RAVE',
  name: 'RaveCulture',
  chainId: 8453, // Base mainnet

  // GeckoTerminal Uniswap v4 pool used to read the live RAVE/USD price.
  geckoPoolId: '0xd54464bb6e5a0e1c49beddde0e02cd03e3239a49c71362902d48a034cd119894',
  geckoPoolUrl:
    'https://www.geckoterminal.com/base/pools/0xd54464bb6e5a0e1c49beddde0e02cd03e3239a49c71362902d48a034cd119894',
};

// PATH B — AGENTBOT on Solana
export const AGENTBOT_TOKEN_CONFIG = {
  mint: '9V4m199eohMgy7bB7MbXhDacUur6NzpgZVrhfux5pump',
  decimals: 6,
  symbol: 'AGENTBOT',
  name: 'Agentbot',
  chain: 'solana' as const,

  // Required balance is computed at runtime from agentbot.sh/token spot price.
  tokenInfoUrl: 'https://agentbot.sh/token',
};

// Premium tier benefits (apply to either path)
export const PREMIUM_FEATURES = {
  customTokenGating: true,
  prioritySupport: true,
  featuredPlacement: true,
};

// Listener access is always free
export const LISTENER_CONFIG = {
  requiresToken: false,
  requiresWallet: false,
};

// ---------- helpers ----------

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  return (amount / divisor).toString();
}

export function parseTokenAmount(amount: number, decimals: number = 18): bigint {
  return BigInt(amount) * BigInt(10 ** decimals);
}

/**
 * Required RAVE balance to clear the $25 USD floor at a given spot price (USD per RAVE).
 * If spot is missing or zero, fall back to the static `requiredAmount`.
 */
export function requiredRaveAt(usdPerRave: number | null | undefined): number {
  if (!usdPerRave || usdPerRave <= 0) return DJ_TOKEN_CONFIG.requiredAmount;
  return Math.ceil(ACCESS_USD_FLOOR / usdPerRave);
}

/**
 * Required AGENTBOT balance to clear the $25 USD floor at a given spot price (USD per AGENTBOT).
 */
export function requiredAgentbotAt(usdPerAgentbot: number | null | undefined): number {
  if (!usdPerAgentbot || usdPerAgentbot <= 0) return 0;
  return Math.ceil(ACCESS_USD_FLOOR / usdPerAgentbot);
}
