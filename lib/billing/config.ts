import { BillingPricing } from '@/types/billing';

// Defaults derived from Mux Live Streaming rates:
// Standard live encoding ~$0.040/min = $2.40/hr, plus delivery ~$0.00096/min/viewer.
// For ~30 avg viewers over 1 hour: $2.40 encoding + $1.73 delivery ≈ $4.13/hr cost.
// Session fee covers per-stream overhead; metered rate covers hourly cost + margin.
// Subscription waives session fee and drops metered to near-cost.
const DEFAULT_PRICING: BillingPricing = {
  streamSessionFeeUsdc: 2,
  monthlySubscriptionFeeUsdc: 40,
  meteredRateUsdcPerHour: 5,
  subscribedMeteredRateUsdcPerHour: 3,
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
