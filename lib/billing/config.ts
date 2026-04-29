import { BillingPricing } from '@/types/billing';

// baseFM access plans — four equivalent rails, same USD value:
//   1. TOKEN-RAVE      — hold 50,000 RAVE on Base (~$25)            → /lib/token/config.ts
//   2. TOKEN-AGENTBOT  — hold equivalent AGENTBOT on Solana (~$25)  → /lib/token/config.ts
//   3. USDC-PAYG       — $2 session fee + $5/hr metered (USDC, Base)
//   4. SUBSCRIPTION    — $40/mo, paid via Stripe OR USDC; waives session fee, $3/hr metered
//
// Defaults derived from Mux Live Streaming rates:
//   Standard live encoding ~$0.040/min = $2.40/hr, plus delivery ~$0.00096/min/viewer.
//   For ~30 avg viewers over 1 hour: $2.40 encoding + $1.73 delivery ≈ $4.13/hr cost.
//   Session fee covers per-stream overhead; metered rate covers hourly cost + margin.
//   Subscription waives session fee and drops metered to near-cost.

const DEFAULT_PRICING: BillingPricing = {
  streamSessionFeeUsdc: 2,
  monthlySubscriptionFeeUsdc: 40,
  meteredRateUsdcPerHour: 5,
  subscribedMeteredRateUsdcPerHour: 3,
  tipPlatformFeeBps: 1000,
  ticketPlatformFeeBps: 500,
};

export type PaymentRail =
  | 'token-rave'
  | 'token-agentbot'
  | 'usdc-payg'
  | 'usdc-sub'
  | 'stripe-sub'
  | 'headliner-code';

export interface PlanOption {
  rail: PaymentRail;
  label: string;
  priceUsd: number;
  cadence: 'one-time-hold' | 'per-session' | 'monthly';
  description: string;
}

/**
 * Static plan catalogue surfaced to the UI. The on-chain / off-chain checks
 * for each rail live in their own modules — this is just the menu.
 */
export const PLAN_OPTIONS: PlanOption[] = [
  {
    rail: 'token-rave',
    label: 'Hold RAVE (Base)',
    priceUsd: 25,
    cadence: 'one-time-hold',
    description: '50,000 RAVE (~$25) on Base — wallet check, no transaction.',
  },
  {
    rail: 'token-agentbot',
    label: 'Hold AGENTBOT (Solana)',
    priceUsd: 25,
    cadence: 'one-time-hold',
    description: 'Equivalent ~$25 in AGENTBOT on Solana.',
  },
  {
    rail: 'usdc-payg',
    label: 'USDC pay-as-you-go',
    priceUsd: 2,
    cadence: 'per-session',
    description: '$2 session fee + $5 USDC/hr metered.',
  },
  {
    rail: 'usdc-sub',
    label: '$40/mo subscription (USDC)',
    priceUsd: 40,
    cadence: 'monthly',
    description: 'Waives session fee, $3/hr metered. USDC on Base.',
  },
  {
    rail: 'stripe-sub',
    label: '$40/mo subscription (Stripe)',
    priceUsd: 40,
    cadence: 'monthly',
    description: 'Same plan as USDC subscription — pay by card via Stripe.',
  },
  {
    rail: 'headliner-code',
    label: 'Headliner invite code',
    priceUsd: 0,
    cadence: 'one-time-hold',
    description: 'Free DJ access for invited headliners. Admin-issued only.',
  },
];

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

/**
 * Stripe configuration. Set STRIPE_SECRET_KEY + STRIPE_PRICE_ID_DJ_SUBSCRIPTION
 * in env. The Stripe-side $40 product MUST mirror DJ_SUBSCRIPTION_FEE_USDC so
 * both rails settle to the same effective price.
 */
export function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY ?? null,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null,
    djSubscriptionPriceId: process.env.STRIPE_PRICE_ID_DJ_SUBSCRIPTION ?? null,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? null,
    successUrl: process.env.STRIPE_SUCCESS_URL ?? '/dashboard?stripe=success',
    cancelUrl: process.env.STRIPE_CANCEL_URL ?? '/dashboard?stripe=cancel',
  };
}

export function isStripeEnabled(): boolean {
  const cfg = getStripeConfig();
  return Boolean(cfg.secretKey && cfg.djSubscriptionPriceId);
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
