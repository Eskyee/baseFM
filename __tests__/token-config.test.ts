import { describe, it, expect } from 'vitest';
import {
  DJ_TOKEN_CONFIG,
  LISTENER_CONFIG,
  PREMIUM_FEATURES,
  formatTokenAmount,
  parseTokenAmount,
} from '@/lib/token/config';

describe('DJ_TOKEN_CONFIG', () => {
  it('should have valid token address', () => {
    expect(DJ_TOKEN_CONFIG.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('should require 5000 tokens for DJ access', () => {
    expect(DJ_TOKEN_CONFIG.requiredAmount).toBe(5000);
  });

  it('should require 1 billion tokens for premium tier', () => {
    expect(DJ_TOKEN_CONFIG.premiumAmount).toBe(1_000_000_000);
  });

  it('should have premium amount greater than required amount', () => {
    expect(DJ_TOKEN_CONFIG.premiumAmount).toBeGreaterThan(DJ_TOKEN_CONFIG.requiredAmount);
  });

  it('should have 18 decimals (standard ERC-20)', () => {
    expect(DJ_TOKEN_CONFIG.decimals).toBe(18);
  });

  it('should be on Base mainnet', () => {
    expect(DJ_TOKEN_CONFIG.chainId).toBe(8453);
  });

  it('should have RAVE as symbol', () => {
    expect(DJ_TOKEN_CONFIG.symbol).toBe('RAVE');
  });
});

describe('PREMIUM_FEATURES', () => {
  it('should enable custom token gating for premium users', () => {
    expect(PREMIUM_FEATURES.customTokenGating).toBe(true);
  });

  it('should enable priority support for premium users', () => {
    expect(PREMIUM_FEATURES.prioritySupport).toBe(true);
  });

  it('should enable featured placement for premium users', () => {
    expect(PREMIUM_FEATURES.featuredPlacement).toBe(true);
  });
});

describe('LISTENER_CONFIG', () => {
  it('should not require tokens for listeners', () => {
    expect(LISTENER_CONFIG.requiresToken).toBe(false);
  });

  it('should not require wallet for listeners', () => {
    expect(LISTENER_CONFIG.requiresWallet).toBe(false);
  });
});

describe('formatTokenAmount', () => {
  it('should format token amount correctly', () => {
    const amount = BigInt('5000000000000000000000'); // 5000 tokens with 18 decimals
    expect(formatTokenAmount(amount)).toBe('5000');
  });

  it('should handle zero', () => {
    expect(formatTokenAmount(BigInt(0))).toBe('0');
  });

  it('should handle custom decimals', () => {
    const amount = BigInt('5000000000'); // 5000 with 6 decimals
    expect(formatTokenAmount(amount, 6)).toBe('5000');
  });
});

describe('parseTokenAmount', () => {
  it('should parse token amount correctly', () => {
    const result = parseTokenAmount(5000);
    expect(result).toBe(BigInt('5000000000000000000000'));
  });

  it('should handle zero', () => {
    expect(parseTokenAmount(0)).toBe(BigInt(0));
  });

  it('should handle custom decimals', () => {
    const result = parseTokenAmount(5000, 6);
    expect(result).toBe(BigInt('5000000000'));
  });
});
