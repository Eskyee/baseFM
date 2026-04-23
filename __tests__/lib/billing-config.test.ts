import { describe, expect, it } from 'vitest';
import { calculatePlatformFee, calculateStreamMeteredFee, roundUsd } from '@/lib/billing/config';

describe('billing config helpers', () => {
  it('rounds USD values to cents', () => {
    expect(roundUsd(12.345)).toBe(12.35);
    expect(roundUsd(12.344)).toBe(12.34);
  });

  it('calculates platform fee splits from basis points', () => {
    expect(calculatePlatformFee(100, 500)).toEqual({
      grossAmount: 100,
      platformFeeAmount: 5,
      netAmount: 95,
    });
  });

  it('calculates metered fees with hourly rate', () => {
    expect(calculateStreamMeteredFee(3600, 3)).toBe(3);
    expect(calculateStreamMeteredFee(1800, 3)).toBe(1.5);
  });
});
