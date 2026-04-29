// app/api/billing/subscription/stripe-webhook/route.ts
//
// Handles Stripe webhooks for the DJ subscription product.
// On `checkout.session.completed` we insert a DJSubscription row with
// status='active' so the gate immediately unlocks for the wallet.
// On `customer.subscription.deleted` we mark it cancelled.
//
// Configure the webhook in the Stripe dashboard pointing to
//   https://basefm.space/api/billing/subscription/stripe-webhook
// and store the signing secret in STRIPE_WEBHOOK_SECRET.

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getStripeConfig, getBillingPricing, getPlatformWalletAddress } from '@/lib/billing/config';

// Stripe needs the raw body for signature verification — do NOT parse JSON.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) throw new Error('Supabase service role credentials missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  const cfg = getStripeConfig();
  if (!cfg.secretKey || !cfg.webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
  }

  const stripe = new Stripe(cfg.secretKey, { apiVersion: '2026-04-22.dahlia' });
  const sig = req.headers.get('stripe-signature') ?? '';
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, cfg.webhookSecret);
  } catch (e) {
    return NextResponse.json({ error: `Webhook signature failed: ${(e as Error).message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      default:
        // Ignore other event types
        break;
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const walletAddress = (session.metadata?.walletAddress ?? '').toLowerCase();
  if (!walletAddress) throw new Error('No walletAddress in session metadata');

  // Pull subscription to read the current period.
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;
  if (!subscriptionId) throw new Error('No subscription on completed checkout');

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const firstItem = sub.items.data[0];
  const startedAt = firstItem ? new Date(firstItem.current_period_start * 1000).toISOString() : new Date().toISOString();
  const endsAt = firstItem ? new Date(firstItem.current_period_end * 1000).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();

  const pricing = getBillingPricing();
  const platformWallet = getPlatformWalletAddress() ?? '';

  const supabase = supabaseAdmin();

  // Insert a DJSubscription row identical in shape to the USDC path.
  // txHash is reused to store the Stripe session ID so it's still a unique,
  // auditable identifier — prefixed `stripe:` so it's never confused with chain.
  const { error } = await supabase
    .from('dj_subscriptions')
    .upsert(
      {
        wallet_address: walletAddress,
        plan_code: 'dj-monthly',
        status: 'active',
        amount_usdc: pricing.monthlySubscriptionFeeUsdc,
        started_at: startedAt,
        ends_at: endsAt,
        tx_hash: `stripe:${session.id}`,
        platform_wallet: platformWallet,
        payment_rail: 'stripe',
        stripe_subscription_id: subscriptionId,
      },
      { onConflict: 'wallet_address,stripe_subscription_id' }
    );

  if (error) throw new Error(`Failed to upsert subscription: ${error.message}`);
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const walletAddress = (sub.metadata?.walletAddress ?? '').toLowerCase();
  if (!walletAddress) return;

  const status =
    sub.status === 'active' || sub.status === 'trialing' ? 'active'
    : sub.status === 'canceled' ? 'cancelled'
    : 'expired';

  const supabase = supabaseAdmin();
  await supabase
    .from('dj_subscriptions')
    .update({
      status,
      ends_at: new Date((sub.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 86400) * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', sub.id);
}
