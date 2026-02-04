// baseFM Token Configuration
// RaveCulture token for DJ access gating

export const DJ_TOKEN_CONFIG = {
  // RaveCulture token on Base
  address: '0xdf3c79a5759eeedb844e7481309a75037b8e86f5' as `0x${string}`,

  // Minimum tokens required to DJ (5000 tokens)
  requiredAmount: 5000,

  // Premium tier - 1 billion tokens to use custom token gating
  premiumAmount: 1_000_000_000,

  // Token decimals (standard ERC-20 is 18)
  decimals: 18,

  // Display info
  symbol: 'RAVE',
  name: 'RaveCulture',

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
