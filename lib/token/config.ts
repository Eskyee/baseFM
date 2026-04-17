// baseFM Token Configuration
// BASEFM token for DJ access gating
// Gate must cover Mux live-streaming USDC costs + profit margin per 2-hour session.
// Mux encoding ~$6 + delivery ~$10 + storage ~$5 + margin = ~$25 floor.

export const DJ_TOKEN_CONFIG = {
  // BASEFM token on Base
  address: '0x9a4376bab717ac0a3901eeed8308a420c59c0ba3' as `0x${string}`,

  // Minimum tokens required to DJ — covers Mux USDC costs + profit
  // 2.5M BASEFM ≈ $25+ at current prices (encoding + delivery + storage + margin)
  requiredAmount: 2_500_000,

  // Premium tier - 1 billion tokens to use custom token gating
  premiumAmount: 1_000_000_000,

  // Token decimals (standard ERC-20 is 18)
  decimals: 18,

  // Display info
  symbol: 'BASEFM',
  name: 'baseFM',

  // Chain
  chainId: 8453, // Base mainnet
};

// Premium tier benefits
export const PREMIUM_FEATURES = {
  // Can use their own token for stream gating
  customTokenGating: true,
  // Priority support
  prioritySupport: true,
  // Featured placement
  featuredPlacement: true,
};

// Listener access is always free
export const LISTENER_CONFIG = {
  requiresToken: false,
  requiresWallet: false,
};

// Helper to format token amount with decimals
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  return whole.toString();
}

// Helper to parse token amount to bigint
export function parseTokenAmount(amount: number, decimals: number = 18): bigint {
  return BigInt(amount) * BigInt(10 ** decimals);
}
