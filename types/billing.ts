export interface BillingPricing {
  streamSessionFeeUsdc: number;
  monthlySubscriptionFeeUsdc: number;
  meteredRateUsdcPerHour: number;
  subscribedMeteredRateUsdcPerHour: number;
  tipPlatformFeeBps: number;
  ticketPlatformFeeBps: number;
}

export interface DJSubscription {
  id: string;
  walletAddress: string;
  planCode: string;
  status: 'active' | 'expired' | 'cancelled';
  amountUsdc: number;
  startedAt: string;
  endsAt: string;
  txHash: string;
  platformWallet: string;
}

export interface StreamBillingSession {
  id: string;
  streamId: string;
  djWalletAddress: string;
  subscriptionId?: string;
  sessionFeeUsdc: number;
  meteredRateUsdcPerHour: number;
  meteredFeeUsdc: number;
  totalFeeUsdc: number;
  durationSeconds: number;
  sessionFeeStatus: 'pending' | 'paid' | 'waived';
  meteredFeeStatus: 'pending' | 'paid' | 'waived';
  sessionTxHash?: string;
  meteredTxHash?: string;
  startedAt?: string;
  endedAt?: string;
  platformWallet: string;
}

export interface PlatformFeeRecord {
  id: string;
  sourceType: 'tip' | 'ticket' | 'stream_session' | 'stream_metered' | 'subscription';
  sourceId: string;
  payerWallet?: string;
  recipientWallet?: string;
  platformWallet: string;
  tokenSymbol: string;
  tokenAddress?: string;
  grossAmount: number;
  platformFeeAmount: number;
  netAmount: number;
  status: 'accrued' | 'paid' | 'waived';
  txHash?: string;
  createdAt: string;
}

export interface StreamBillingSummary {
  platformWallet: string;
  pricing: BillingPricing;
  subscription?: DJSubscription | null;
  streamSession?: StreamBillingSession | null;
  canActivateStream: boolean;
  requiresSessionPayment: boolean;
  outstandingMeteredFeeUsdc: number;
}
