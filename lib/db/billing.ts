import { createServerClient } from '@/lib/supabase/client';
import { getBillingPricing, getPlatformWalletAddress, calculatePlatformFee, calculateStreamMeteredFee, roundUsd } from '@/lib/billing/config';
import { DJSubscription, PlatformFeeRecord, StreamBillingSession, StreamBillingSummary } from '@/types/billing';
import { Stream } from '@/types/stream';

function mapSubscription(row: Record<string, unknown>): DJSubscription {
  return {
    id: row.id as string,
    walletAddress: row.wallet_address as string,
    planCode: (row.plan_code as string) || 'monthly_pro',
    status: row.status as DJSubscription['status'],
    amountUsdc: Number(row.amount_usdc || 0),
    startedAt: row.started_at as string,
    endsAt: row.ends_at as string,
    txHash: row.tx_hash as string,
    platformWallet: row.platform_wallet as string,
  };
}

function mapStreamBillingSession(row: Record<string, unknown>): StreamBillingSession {
  return {
    id: row.id as string,
    streamId: row.stream_id as string,
    djWalletAddress: row.dj_wallet_address as string,
    subscriptionId: (row.subscription_id as string) || undefined,
    sessionFeeUsdc: Number(row.session_fee_usdc || 0),
    meteredRateUsdcPerHour: Number(row.metered_rate_usdc_per_hour || 0),
    meteredFeeUsdc: Number(row.metered_fee_usdc || 0),
    totalFeeUsdc: Number(row.total_fee_usdc || 0),
    durationSeconds: Number(row.duration_seconds || 0),
    sessionFeeStatus: row.session_fee_status as StreamBillingSession['sessionFeeStatus'],
    meteredFeeStatus: row.metered_fee_status as StreamBillingSession['meteredFeeStatus'],
    sessionTxHash: (row.session_tx_hash as string) || undefined,
    meteredTxHash: (row.metered_tx_hash as string) || undefined,
    startedAt: (row.started_at as string) || undefined,
    endedAt: (row.ended_at as string) || undefined,
    platformWallet: row.platform_wallet as string,
  };
}

function mapPlatformFeeRecord(row: Record<string, unknown>): PlatformFeeRecord {
  return {
    id: row.id as string,
    sourceType: row.source_type as PlatformFeeRecord['sourceType'],
    sourceId: row.source_id as string,
    payerWallet: (row.payer_wallet as string) || undefined,
    recipientWallet: (row.recipient_wallet as string) || undefined,
    platformWallet: row.platform_wallet as string,
    tokenSymbol: row.token_symbol as string,
    tokenAddress: (row.token_address as string) || undefined,
    grossAmount: Number(row.gross_amount || 0),
    platformFeeAmount: Number(row.platform_fee_amount || 0),
    netAmount: Number(row.net_amount || 0),
    status: row.status as PlatformFeeRecord['status'],
    txHash: (row.tx_hash as string) || undefined,
    createdAt: row.created_at as string,
  };
}

export async function getActiveSubscription(walletAddress: string): Promise<DJSubscription | null> {
  const supabase = createServerClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('dj_subscriptions')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .eq('status', 'active')
    .gte('ends_at', now)
    .order('ends_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapSubscription(data);
}

export async function recordSubscriptionPayment(input: {
  walletAddress: string;
  txHash: string;
  months?: number;
}) {
  const supabase = createServerClient();
  const pricing = getBillingPricing();
  const platformWallet = getPlatformWalletAddress();

  if (!platformWallet) {
    throw new Error('Platform wallet is not configured');
  }

  const months = Math.max(input.months || 1, 1);
  const amountUsdc = roundUsd(pricing.monthlySubscriptionFeeUsdc * months);
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(endsAt.getMonth() + months);

  const { data, error } = await supabase
    .from('dj_subscriptions')
    .insert({
      wallet_address: input.walletAddress.toLowerCase(),
      plan_code: 'monthly_pro',
      status: 'active',
      amount_usdc: amountUsdc,
      started_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      tx_hash: input.txHash,
      platform_wallet: platformWallet,
      metadata: { months },
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record subscription: ${error.message}`);
  }

  await recordPlatformFee({
    sourceType: 'subscription',
    sourceId: data.id,
    payerWallet: input.walletAddress,
    platformWallet,
    tokenSymbol: 'USDC',
    grossAmount: amountUsdc,
    platformFeeAmount: amountUsdc,
    netAmount: 0,
    status: 'paid',
    txHash: input.txHash,
  });

  return mapSubscription(data);
}

export async function getStreamBillingSession(streamId: string): Promise<StreamBillingSession | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('stream_billing_sessions')
    .select('*')
    .eq('stream_id', streamId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapStreamBillingSession(data);
}

export async function upsertStreamBillingSession(input: {
  streamId: string;
  djWalletAddress: string;
  subscriptionId?: string | null;
  sessionFeeUsdc: number;
  meteredRateUsdcPerHour: number;
  sessionFeeStatus: StreamBillingSession['sessionFeeStatus'];
  sessionTxHash?: string | null;
  startedAt?: string | null;
  platformWallet?: string | null;
}) {
  const supabase = createServerClient();
  const platformWallet = input.platformWallet || getPlatformWalletAddress();

  if (!platformWallet) {
    throw new Error('Platform wallet is not configured');
  }

  const { data, error } = await supabase
    .from('stream_billing_sessions')
    .upsert({
      stream_id: input.streamId,
      dj_wallet_address: input.djWalletAddress.toLowerCase(),
      subscription_id: input.subscriptionId || null,
      session_fee_usdc: roundUsd(input.sessionFeeUsdc),
      metered_rate_usdc_per_hour: roundUsd(input.meteredRateUsdcPerHour),
      session_fee_status: input.sessionFeeStatus,
      session_tx_hash: input.sessionTxHash || null,
      started_at: input.startedAt || null,
      platform_wallet: platformWallet,
      total_fee_usdc: roundUsd(input.sessionFeeStatus === 'paid' ? input.sessionFeeUsdc : 0),
    }, { onConflict: 'stream_id' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert stream billing session: ${error.message}`);
  }

  return mapStreamBillingSession(data);
}

export async function recordStreamSessionPayment(input: {
  streamId: string;
  djWalletAddress: string;
  txHash: string;
}) {
  const pricing = getBillingPricing();
  const session = await upsertStreamBillingSession({
    streamId: input.streamId,
    djWalletAddress: input.djWalletAddress,
    sessionFeeUsdc: pricing.streamSessionFeeUsdc,
    meteredRateUsdcPerHour: pricing.meteredRateUsdcPerHour,
    sessionFeeStatus: 'paid',
    sessionTxHash: input.txHash,
    startedAt: new Date().toISOString(),
  });

  await recordPlatformFee({
    sourceType: 'stream_session',
    sourceId: input.streamId,
    payerWallet: input.djWalletAddress,
    platformWallet: session.platformWallet,
    tokenSymbol: 'USDC',
    grossAmount: session.sessionFeeUsdc,
    platformFeeAmount: session.sessionFeeUsdc,
    netAmount: 0,
    status: 'paid',
    txHash: input.txHash,
  });

  return session;
}

export async function markStreamStarted(streamId: string) {
  const session = await getStreamBillingSession(streamId);
  if (!session) return null;

  const supabase = createServerClient();
  const startedAt = session.startedAt || new Date().toISOString();
  const { data, error } = await supabase
    .from('stream_billing_sessions')
    .update({ started_at: startedAt })
    .eq('stream_id', streamId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark stream started for billing: ${error.message}`);
  }

  return mapStreamBillingSession(data);
}

export async function finalizeStreamBilling(stream: Stream, endedAtIso?: string) {
  const existing = await getStreamBillingSession(stream.id);
  if (!existing) return null;

  const endedAt = new Date(endedAtIso || stream.actualEndTime || new Date().toISOString());
  const startedAt = new Date(existing.startedAt || stream.actualStartTime || stream.createdAt);
  const durationSeconds = Math.max(Math.round((endedAt.getTime() - startedAt.getTime()) / 1000), 0);
  const meteredFeeUsdc = calculateStreamMeteredFee(durationSeconds, existing.meteredRateUsdcPerHour);
  const totalFeeUsdc = roundUsd(existing.sessionFeeUsdc + meteredFeeUsdc);
  const meteredFeeStatus = meteredFeeUsdc > 0 ? existing.meteredFeeStatus : 'waived';

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('stream_billing_sessions')
    .update({
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
      metered_fee_usdc: meteredFeeUsdc,
      total_fee_usdc: totalFeeUsdc,
      metered_fee_status: meteredFeeStatus,
    })
    .eq('stream_id', stream.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to finalize stream billing: ${error.message}`);
  }

  return mapStreamBillingSession(data);
}

export async function settleStreamMeteredFee(input: {
  streamId: string;
  txHash: string;
}) {
  const supabase = createServerClient();
  const session = await getStreamBillingSession(input.streamId);

  if (!session) {
    throw new Error('Stream billing session not found');
  }

  const { data, error } = await supabase
    .from('stream_billing_sessions')
    .update({
      metered_fee_status: session.meteredFeeUsdc > 0 ? 'paid' : 'waived',
      metered_tx_hash: input.txHash,
    })
    .eq('stream_id', input.streamId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to settle metered fee: ${error.message}`);
  }

  const updated = mapStreamBillingSession(data);

  if (updated.meteredFeeUsdc > 0) {
    await recordPlatformFee({
      sourceType: 'stream_metered',
      sourceId: input.streamId,
      payerWallet: updated.djWalletAddress,
      platformWallet: updated.platformWallet,
      tokenSymbol: 'USDC',
      grossAmount: updated.meteredFeeUsdc,
      platformFeeAmount: updated.meteredFeeUsdc,
      netAmount: 0,
      status: 'paid',
      txHash: input.txHash,
    });
  }

  return updated;
}

export async function recordPlatformFee(input: {
  sourceType: PlatformFeeRecord['sourceType'];
  sourceId: string;
  payerWallet?: string;
  recipientWallet?: string;
  platformWallet?: string | null;
  tokenSymbol: string;
  tokenAddress?: string;
  grossAmount: number;
  platformFeeAmount: number;
  netAmount: number;
  status: PlatformFeeRecord['status'];
  txHash?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createServerClient();
  const platformWallet = input.platformWallet || getPlatformWalletAddress();
  if (!platformWallet) {
    throw new Error('Platform wallet is not configured');
  }

  const { data, error } = await supabase
    .from('platform_fee_records')
    .insert({
      source_type: input.sourceType,
      source_id: input.sourceId,
      payer_wallet: input.payerWallet?.toLowerCase() || null,
      recipient_wallet: input.recipientWallet?.toLowerCase() || null,
      platform_wallet: platformWallet,
      token_symbol: input.tokenSymbol,
      token_address: input.tokenAddress || null,
      gross_amount: input.grossAmount,
      platform_fee_amount: input.platformFeeAmount,
      net_amount: input.netAmount,
      status: input.status,
      tx_hash: input.txHash || null,
      metadata: input.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record platform fee: ${error.message}`);
  }

  return mapPlatformFeeRecord(data);
}

export async function getStreamBillingSummary(stream: Stream): Promise<StreamBillingSummary> {
  const pricing = getBillingPricing();
  const platformWallet = getPlatformWalletAddress();

  // Degrade gracefully when the platform wallet env isn't configured. The DJ
  // dashboard should still render so the DJ can manage Mux / RTMP / relays
  // even if billing is offline. Pay buttons hide via billingUnavailable.
  if (!platformWallet) {
    return {
      platformWallet: '',
      pricing,
      subscription: null,
      streamSession: null,
      canActivateStream: false,
      requiresSessionPayment: false,
      outstandingMeteredFeeUsdc: 0,
      billingUnavailable: true,
      billingUnavailableReason: 'PLATFORM_WALLET_ADDRESS / ADMIN_WALLET_ADDRESS env not configured on the server',
    };
  }

  let subscription: DJSubscription | null = null;
  let streamSession: StreamBillingSession | null = null;
  try {
    [subscription, streamSession] = await Promise.all([
      getActiveSubscription(stream.djWalletAddress),
      getStreamBillingSession(stream.id),
    ]);
  } catch (err) {
    console.error('Billing data fetch failed, returning degraded summary:', err);
    return {
      platformWallet,
      pricing,
      subscription: null,
      streamSession: null,
      canActivateStream: false,
      requiresSessionPayment: false,
      outstandingMeteredFeeUsdc: 0,
      billingUnavailable: true,
      billingUnavailableReason: err instanceof Error ? err.message : 'Billing data fetch failed',
    };
  }

  const effectiveMeterRate = subscription
    ? pricing.subscribedMeteredRateUsdcPerHour
    : pricing.meteredRateUsdcPerHour;

  const seededSession = streamSession || null;
  const outstandingMeteredFeeUsdc = seededSession && seededSession.meteredFeeStatus !== 'paid'
    ? seededSession.meteredFeeUsdc
    : 0;

  const requiresSessionPayment = !subscription && seededSession?.sessionFeeStatus !== 'paid';
  const canActivateStream = Boolean(subscription) || seededSession?.sessionFeeStatus === 'paid';

  return {
    platformWallet,
    pricing: {
      ...pricing,
      meteredRateUsdcPerHour: effectiveMeterRate,
    },
    subscription,
    streamSession: seededSession,
    canActivateStream,
    requiresSessionPayment,
    outstandingMeteredFeeUsdc,
  };
}

export async function getBillingTotals(days: number | null = 30) {
  const supabase = createServerClient();
  let query = supabase
    .from('platform_fee_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (days !== null) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    query = query.gte('created_at', date.toISOString());
  }

  const { data, error } = await query.limit(500);
  if (error) {
    throw new Error(`Failed to fetch billing totals: ${error.message}`);
  }

  const records = (data || []).map((row) => mapPlatformFeeRecord(row));
  const totalCollected = records
    .filter((record) => record.status === 'paid')
    .reduce((sum, record) => sum + record.platformFeeAmount, 0);
  const totalAccrued = records
    .filter((record) => record.status === 'accrued')
    .reduce((sum, record) => sum + record.platformFeeAmount, 0);

  return {
    records,
    totalCollected: roundUsd(totalCollected),
    totalAccrued: roundUsd(totalAccrued),
    bySource: records.reduce<Record<string, { collected: number; accrued: number }>>((acc, record) => {
      const entry = acc[record.sourceType] || { collected: 0, accrued: 0 };
      if (record.status === 'paid') {
        entry.collected = roundUsd(entry.collected + record.platformFeeAmount);
      } else if (record.status === 'accrued') {
        entry.accrued = roundUsd(entry.accrued + record.platformFeeAmount);
      }
      acc[record.sourceType] = entry;
      return acc;
    }, {}),
  };
}

export function deriveTicketPlatformFee(amountUsdc: number) {
  const pricing = getBillingPricing();
  return calculatePlatformFee(amountUsdc, pricing.ticketPlatformFeeBps);
}

export function deriveTipPlatformFee(amount: number) {
  const pricing = getBillingPricing();
  return calculatePlatformFee(amount, pricing.tipPlatformFeeBps);
}
