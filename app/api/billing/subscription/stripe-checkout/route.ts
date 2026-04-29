// app/api/billing/subscription/stripe-checkout/route.ts
//
// Creates a Stripe Checkout Session for the $40/mo DJ subscription.
// The Stripe-side product/price MUST mirror DJ_SUBSCRIPTION_FEE_USDC so
// fiat and USDC rails settle to the same effective price.
//
// On successful payment, Stripe fires `checkout.session.completed` to
// /api/billing/subscription/stripe-webhook, which inserts a DJSubscription
// row identical to the USDC path — the gate code in tokenGate.ts doesn't
// need to know how the subscription was paid.

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeConfig, isStripeEnabled } from '@/lib/billing/config';

export async function POST(req: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: 'Stripe not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID_DJ_SUBSCRIPTION.' },
      { status: 503 }
    );
  }

  const cfg = getStripeConfig();
  if (!cfg.secretKey || !cfg.djSubscriptionPriceId) {
    return NextResponse.json({ error: 'Stripe misconfigured' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { walletAddress, email } = body as { walletAddress?: string; email?: string };

  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
  }

  const stripe = new Stripe(cfg.secretKey, { apiVersion: '2024-06-20' });

  const origin =
    req.headers.get('origin') ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'https://basefm.space';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: cfg.djSubscriptionPriceId, quantity: 1 }],
      success_url: `${origin}${cfg.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cfg.cancelUrl}`,
      customer_email: email,
      // Wallet address rides through to the webhook in metadata so we can
      // attach the DJSubscription row to the right wallet.
      metadata: { walletAddress: walletAddress.toLowerCase() },
      subscription_data: {
        metadata: { walletAddress: walletAddress.toLowerCase() },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
