import { BillingPricing } from '@/types/billing';

const DEFAULT_PRICING: BillingPricing = {
  streamSessionFeeUsdc: 5,
  monthlySubscriptionFeeUsdc: 25,
  meteredRateUsdcPerHour: 3,
  subscribedMeteredRateUsdcPerHour: 1.5,
  tipPlatformFeeBps: 1000,
  ticketPlatformFeeBps: 500,
};

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBasisPoints(value: string | undefined, fallback: number): number {
  const parsed = parseNumber(value, fallback);
  return Math.max(0, Math.min(10_000, Math.round(parsed)));
}

export function getBillingPricing(): BillingPricing {
  return {
    streamSessionFeeUsdc: parseNumber(process.env.STREAM_SESSION_FEE_USDC, DEFAULT_PRICING.streamSessionFeeUsdc),
    monthlySubscriptionFeeUsdc: parseNumber(process.env.DJ_SUBSCRIPTION_FEE_USDC, DEFAULT_PRICING.monthlySubscriptionFeeUsdc),
    meteredRateUsdcPerHour: parseNumber(process.env.STREAM_METERED_RATE_USDC_PER_HOUR, DEFAULT_PRICING.meteredRateUsdcPerHour),
    subscribedMeteredRateUsdcPerHour: parseNumber(
      process.env.STREAM_SUBSCRIBED_METERED_RATE_USDC_PER_HOUR,
      DEFAULT_PRICING.subscribedMeteredRateUsdcPerHour
    ),
    tipPlatformFeeBps: parseBasisPoints(process.env.TIP_PLATFORM_FEE_BPS, DEFAULT_PRICING.tipPlatformFeeBps),
    ticketPlatformFeeBps: parseBasisPoints(process.env.TICKET_PLATFORM_FEE_BPS, DEFAULT_PRICING.ticketPlatformFeeBps),
  };
}

export function roundUsd(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function getPlatformWalletAddress(): string | null {
  const explicit = process.env.PLATFORM_WALLET_ADDRESS?.trim();
  if (explicit) return explicit.toLowerCase();

  const adminWallets = process.env.ADMIN_WALLET_ADDRESS
    ?.split(/[\n,]/)
    .map((wallet) => wallet.trim().toLowerCase())
    .filter(Boolean);

  return adminWallets?.[0] || null;
}

export function calculatePlatformFee(grossAmount: number, basisPoints: number) {
  const fee = roundUsd((grossAmount * basisPoints) / 10_000);
  const net = roundUsd(Math.max(grossAmount - fee, 0));
  return {
    grossAmount: roundUsd(grossAmount),
    platformFeeAmount: fee,
    netAmount: net,
  };
}

export function calculateStreamMeteredFee(durationSeconds: number, hourlyRateUsdc: number) {
  if (durationSeconds <= 0 || hourlyRateUsdc <= 0) {
    return 0;
  }

  const billableHours = Math.max(durationSeconds / 3600, 1 / 60);
  return roundUsd(billableHours * hourlyRateUsdc);
}
