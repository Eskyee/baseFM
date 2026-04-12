/**
 * Unit Tests for Tip Configuration
 *
 * Tests the tip token configuration and utility functions.
 * These are critical for the tipping functionality throughout the app.
 *
 * Run with: npm run test:run
 */

import { describe, it, expect } from 'vitest';
import {
  TIP_TOKENS,
  TIP_PRESETS,
  getTokenBySymbol,
  formatTipAmount,
  parseTipAmount,
} from '@/lib/token/tip-config';

describe('TIP_TOKENS', () => {
  /**
   * Verify all expected tokens are configured
   * These are the tokens users can tip DJs with
   */
  it('should include all supported tip tokens', () => {
    const symbols = TIP_TOKENS.map((t) => t.symbol);

    expect(symbols).toContain('ETH');
    expect(symbols).toContain('USDC');
    expect(symbols).toContain('BASEFM');
    expect(symbols).toContain('cbBTC');
  });

  /**
   * ETH is a special case - native token, not ERC-20
   */
  it('should have ETH as native token', () => {
    const eth = TIP_TOKENS.find((t) => t.symbol === 'ETH');

    expect(eth).toBeDefined();
    expect(eth?.address).toBe('native');
    expect(eth?.decimals).toBe(18);
  });

  /**
   * USDC is the primary stable coin for payments
   * Must have correct Base mainnet address
   */
  it('should have correct USDC configuration for Base', () => {
    const usdc = TIP_TOKENS.find((t) => t.symbol === 'USDC');

    expect(usdc).toBeDefined();
    expect(usdc?.address).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
    expect(usdc?.decimals).toBe(6);
  });

  /**
   * RAVE is our community token
   * Must have correct Base mainnet address
   */
  it('should have correct BASEFM token configuration', () => {
    const rave = TIP_TOKENS.find((t) => t.symbol === 'BASEFM');

    expect(rave).toBeDefined();
    expect(rave?.address).toBe('0x9a4376bab717ac0a3901eeed8308a420c59c0ba3');
    expect(rave?.decimals).toBe(18);
  });

  /**
   * All tokens must have required fields for UI display
   */
  it('should have all required fields for each token', () => {
    TIP_TOKENS.forEach((token) => {
      expect(token.symbol).toBeDefined();
      expect(token.name).toBeDefined();
      expect(token.address).toBeDefined();
      expect(token.decimals).toBeGreaterThan(0);
      expect(token.icon).toBeDefined();
      expect(token.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('TIP_PRESETS', () => {
  /**
   * Presets provide quick tip amount selections
   */
  it('should have preset tip amounts', () => {
    expect(TIP_PRESETS.length).toBeGreaterThan(0);
  });

  /**
   * Each preset should have amount and label
   */
  it('should have amount and label for each preset', () => {
    TIP_PRESETS.forEach((preset) => {
      expect(preset.amount).toBeGreaterThan(0);
      expect(preset.label).toBeDefined();
      expect(preset.label).toContain('$');
    });
  });

  /**
   * Presets should be in ascending order for UX
   */
  it('should have presets in ascending order', () => {
    for (let i = 1; i < TIP_PRESETS.length; i++) {
      expect(TIP_PRESETS[i].amount).toBeGreaterThan(TIP_PRESETS[i - 1].amount);
    }
  });
});

describe('getTokenBySymbol', () => {
  /**
   * Should find tokens by exact symbol match
   */
  it('should find token by symbol', () => {
    const eth = getTokenBySymbol('ETH');
    expect(eth?.symbol).toBe('ETH');

    const usdc = getTokenBySymbol('USDC');
    expect(usdc?.symbol).toBe('USDC');
  });

  /**
   * Should be case insensitive for user convenience
   */
  it('should be case insensitive', () => {
    const eth1 = getTokenBySymbol('eth');
    const eth2 = getTokenBySymbol('ETH');
    const eth3 = getTokenBySymbol('Eth');

    expect(eth1).toEqual(eth2);
    expect(eth2).toEqual(eth3);
  });

  /**
   * Should return undefined for unknown tokens
   */
  it('should return undefined for unknown token', () => {
    const unknown = getTokenBySymbol('UNKNOWN');
    expect(unknown).toBeUndefined();
  });
});

describe('formatTipAmount', () => {
  /**
   * Should format whole numbers without decimals
   */
  it('should format whole numbers', () => {
    // 1 ETH = 1000000000000000000 wei (18 decimals)
    const result = formatTipAmount(BigInt('1000000000000000000'), 18);
    expect(result).toBe('1');
  });

  /**
   * Should format amounts with decimals
   */
  it('should format amounts with decimals', () => {
    // 1.5 ETH
    const result = formatTipAmount(BigInt('1500000000000000000'), 18);
    expect(result).toBe('1.5');
  });

  /**
   * Should handle USDC with 6 decimals
   */
  it('should handle USDC decimals correctly', () => {
    // 25 USDC
    const result = formatTipAmount(BigInt('25000000'), 6);
    expect(result).toBe('25');

    // 25.50 USDC
    const result2 = formatTipAmount(BigInt('25500000'), 6);
    expect(result2).toBe('25.5');
  });

  /**
   * Should trim trailing zeros
   */
  it('should trim trailing zeros', () => {
    const result = formatTipAmount(BigInt('1500000000000000000'), 18);
    expect(result).not.toContain('0000');
    expect(result).toBe('1.5');
  });
});

describe('parseTipAmount', () => {
  /**
   * Should parse whole number amounts
   */
  it('should parse whole numbers', () => {
    const result = parseTipAmount('1', 18);
    expect(result).toBe(BigInt('1000000000000000000'));
  });

  /**
   * Should parse decimal amounts
   */
  it('should parse decimal amounts', () => {
    const result = parseTipAmount('1.5', 18);
    expect(result).toBe(BigInt('1500000000000000000'));
  });

  /**
   * Should handle USDC amounts correctly
   */
  it('should handle USDC amounts', () => {
    // 25 USDC
    const result = parseTipAmount('25', 6);
    expect(result).toBe(BigInt('25000000'));

    // 25.50 USDC
    const result2 = parseTipAmount('25.50', 6);
    expect(result2).toBe(BigInt('25500000'));
  });

  /**
   * Should handle amounts without decimal part
   */
  it('should handle amounts without decimal part', () => {
    const result = parseTipAmount('100', 18);
    expect(result).toBe(BigInt('100000000000000000000'));
  });
});
